import { type PredictionFeatures } from './config'

export interface PredictionResponse {
  prediction: 0 | 1
  confidence: number
  scores: number[]
  classes: string[]
}

export async function predictInjuryRisk(features: PredictionFeatures): Promise<PredictionResponse> {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ features }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Prediction request failed')
  }

  return response.json()
}

