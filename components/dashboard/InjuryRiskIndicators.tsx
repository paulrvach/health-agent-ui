"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkout } from '@/context/WorkoutContext'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

export function InjuryRiskIndicators() {
  const { injuryRisks } = useWorkout()

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-5 w-5" style={{ color: 'hsl(var(--chart-1))' }} />
      case 'medium':
        return <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(var(--chart-3))' }} />
      case 'high':
        return <AlertCircle className="h-5 w-5" style={{ color: 'hsl(var(--destructive))' }} />
    }
  }

  const getRiskBadgeVariant = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'high':
        return 'destructive'
    }
  }

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return '[color:hsl(var(--chart-1))]'
      case 'medium':
        return '[color:hsl(var(--chart-3))]'
      case 'high':
        return '[color:hsl(var(--destructive))]'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Injury Risk Assessment</CardTitle>
        <CardDescription>
          AI-detected risk factors based on your movement patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {injuryRisks.map((risk, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="mt-0.5">
                {getRiskIcon(risk.level)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{risk.area}</h4>
                  <Badge variant={getRiskBadgeVariant(risk.level)} className="capitalize">
                    {risk.level} Risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {risk.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Risk Level</span>
            <span className={`font-semibold ${getRiskColor(
              injuryRisks.filter(r => r.level === 'high').length > 0 ? 'high' :
              injuryRisks.filter(r => r.level === 'medium').length > 1 ? 'medium' : 'low'
            )}`}>
              {injuryRisks.filter(r => r.level === 'high').length > 0 ? 'Elevated' :
               injuryRisks.filter(r => r.level === 'medium').length > 1 ? 'Moderate' : 'Low'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

