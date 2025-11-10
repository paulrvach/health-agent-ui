import { NextRequest } from 'next/server'
import * as jose from 'jose'
import { VERTEX_AI_CONFIG, SERVICE_ACCOUNT, type PredictionFeatures } from '@/lib/vertex-ai/config'

/**
 * Creates a signed JWT and exchanges it for a Google OAuth2 access token using a service account key.
 */
async function getAccessToken(): Promise<string> {
  const scope = 'https://www.googleapis.com/auth/cloud-platform'
  const alg = 'RS256'
  
  const privateKey = await jose.importPKCS8(SERVICE_ACCOUNT.private_key, alg)

  const jwt = await new jose.SignJWT({ scope })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(SERVICE_ACCOUNT.client_email)
    .setAudience(SERVICE_ACCOUNT.token_uri)
    .setExpirationTime('1h')
    .setSubject(SERVICE_ACCOUNT.client_email)
    .sign(privateKey)

  const response = await fetch(SERVICE_ACCOUNT.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await response.json()
  
  if (!response.ok || !tokenData.access_token) {
    console.error('Token exchange failed:', tokenData)
    throw new Error(tokenData.error_description || 'Failed to obtain access token')
  }

  return tokenData.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const features = body.features as PredictionFeatures

    if (!features) {
      return Response.json(
        { error: 'Missing features in request body' },
        { status: 400 }
      )
    }

    console.log('[Predict API] Making prediction with features:', features)

    const { project, location, endpointId } = VERTEX_AI_CONFIG
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/endpoints/${endpointId}:predict`

    // Get access token
    const accessToken = await getAccessToken()

    // Make prediction request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ instances: [features] }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('[Predict API] Vertex AI error:', result)
      return Response.json(
        { error: result.error?.message || `Request failed with status ${response.status}` },
        { status: response.status }
      )
    }

    const predictionResult = result?.predictions?.[0]

    if (!predictionResult || !Array.isArray(predictionResult.scores) || !Array.isArray(predictionResult.classes)) {
      console.error('[Predict API] Invalid prediction format:', result)
      return Response.json(
        { error: 'Invalid prediction format received from Vertex AI' },
        { status: 500 }
      )
    }

    const scores: number[] = predictionResult.scores
    const classes: string[] = predictionResult.classes

    // Find the index of the highest score
    const maxScore = Math.max(...scores)
    const maxScoreIndex = scores.indexOf(maxScore)
    const predictedClass = classes[maxScoreIndex]
    const predictionValue = parseInt(predictedClass, 10)

    if (predictionValue !== 0 && predictionValue !== 1) {
      return Response.json(
        { error: 'Parsed prediction class is not 0 or 1' },
        { status: 500 }
      )
    }

    console.log('[Predict API] Prediction successful:', {
      prediction: predictionValue,
      confidence: maxScore,
    })

    return Response.json({
      prediction: predictionValue as 0 | 1,
      confidence: maxScore,
      scores,
      classes,
    })
  } catch (error) {
    console.error('[Predict API] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

