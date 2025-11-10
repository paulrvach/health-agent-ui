import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deploymentUrl = process.env.NEXT_PUBLIC_HEALTH_AGENT_URL

    if (!deploymentUrl) {
      return Response.json(
        { error: 'Health agent URL not configured' },
        { status: 500 }
      )
    }

    const url = `${deploymentUrl}/invoke`

    // Forward the request to the health agent
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return Response.json(
        { error: `Health agent returned status ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

