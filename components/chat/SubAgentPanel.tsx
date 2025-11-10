"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { X, CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react'
import type { SubAgent } from '@/app/types/types'

interface SubAgentPanelProps {
  subAgent: SubAgent
  onClose: () => void
}

export function SubAgentPanel({ subAgent, onClose }: SubAgentPanelProps) {
  const getStatusIcon = (status: SubAgent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
      case 'thinking':
      case 'acting':
        return <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'hsl(var(--chart-2))' }} />
      case 'failed':
        return <XCircle className="h-4 w-4" style={{ color: 'hsl(var(--destructive))' }} />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: SubAgent['status']) => {
    const colors = {
      idle: 'bg-muted text-muted-foreground',
      thinking: '[background:hsl(var(--chart-2))] text-white',
      acting: '[background:hsl(var(--chart-3))] text-white',
      completed: '[background:hsl(var(--chart-1))] text-white',
      failed: '[background:hsl(var(--destructive))] text-white',
    }

    return (
      <Badge className={colors[status]}>
        {status}
      </Badge>
    )
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" style={{ color: 'hsl(var(--chart-1))' }} />
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin" style={{ color: 'hsl(var(--chart-2))' }} />
      case 'failed':
        return <XCircle className="h-3 w-3" style={{ color: 'hsl(var(--destructive))' }} />
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }

  const completedSteps = subAgent.steps.filter(s => s.status === 'completed').length
  const progress = subAgent.progress || (subAgent.steps.length > 0 ? (completedSteps / subAgent.steps.length) * 100 : 0)

  return (
    <div className="w-80 border-l bg-background flex flex-col">
      <Card className="rounded-none border-0 shadow-none flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(subAgent.status)}
                <CardTitle className="text-base">{subAgent.name}</CardTitle>
              </div>
              {getStatusBadge(subAgent.status)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {completedSteps} / {subAgent.steps.length} steps completed
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-4">
          {subAgent.steps.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No steps yet...
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {subAgent.steps.map((step, index) => (
                <AccordionItem
                  key={step.id}
                  value={step.id}
                  className="border rounded-lg bg-card"
                >
                  <AccordionTrigger className="px-3 py-2 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      {getStepIcon(step.status)}
                      <span className="text-xs font-medium">
                        Step {index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2 text-xs">
                      <div className="text-muted-foreground">
                        {step.description}
                      </div>
                      {step.output && (
                        <div className="bg-muted/50 rounded p-2 font-mono">
                          {step.output}
                        </div>
                      )}
                      <div className="text-muted-foreground">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

