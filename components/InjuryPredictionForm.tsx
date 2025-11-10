"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { predictInjuryRisk } from '@/lib/vertex-ai/client'
import { INITIAL_FEATURES, type PredictionFeatures, type FeatureKey } from '@/lib/vertex-ai/config'
import { toast } from 'sonner'

export function InjuryPredictionForm() {
  const [features, setFeatures] = useState<PredictionFeatures>(INITIAL_FEATURES)
  const [prediction, setPrediction] = useState<0 | 1 | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (key: FeatureKey, value: string) => {
    setFeatures(prev => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFeatures(INITIAL_FEATURES)
    setPrediction(null)
    setConfidence(null)
    setError(null)
  }

  const handlePredict = async () => {
    setIsLoading(true)
    setPrediction(null)
    setConfidence(null)
    setError(null)

    try {
      const result = await predictInjuryRisk(features)
      setPrediction(result.prediction)
      setConfidence(result.confidence)
      
      toast.success('Prediction complete', {
        description: result.prediction === 1 ? 'Risk of injury detected' : 'No risk detected',
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMsg)
      toast.error('Prediction failed', {
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const featureLabels: Record<FeatureKey, string> = {
    Player_Age: 'Player Age',
    Player_Weight: 'Player Weight (kg)',
    Player_Height: 'Player Height (cm)',
    Previous_Injuries: 'Previous Injuries',
    Training_Intensity: 'Training Intensity (0-1)',
    Recovery_Time: 'Recovery Time (days)',
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-[22px]">Injury Risk Prediction</CardTitle>
        <CardDescription className="text-[15px]">
          Enter player data to predict injury risk using Vertex AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Inputs */}
        <div className="space-y-4">
          {(Object.keys(features) as FeatureKey[]).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-[15px]">{featureLabels[key]}</Label>
              <Input
                id={key}
                type="text"
                value={features[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                disabled={isLoading}
                className="text-[15px]"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="rounded-full"
          >
            Reset
          </Button>
          <Button
            onClick={handlePredict}
            disabled={isLoading}
            className="rounded-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              'Predict Risk'
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Prediction Result */}
        {prediction !== null && confidence !== null && (
          <div
            className={`rounded-xl p-6 text-center space-y-2 ${
              prediction === 1
                ? 'bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20'
                : 'bg-[hsl(var(--chart-1))]/10 border border-[hsl(var(--chart-1))]/20'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {prediction === 1 ? (
                <AlertCircle className="h-6 w-6" style={{ color: 'hsl(var(--destructive))' }} />
              ) : (
                <CheckCircle className="h-6 w-6" style={{ color: 'hsl(var(--chart-1))' }} />
              )}
              <h3 className="text-[20px] font-semibold">
                {prediction === 1 ? 'Risk of Injury' : 'No Risk Detected'}
              </h3>
            </div>
            <p className="text-[15px] text-foreground/70">
              Confidence: {(confidence * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

