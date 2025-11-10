"use client"

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWorkout, type Workout } from '@/context/WorkoutContext'
import { MessageSquare, Calendar, TrendingUp, Clock, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function RecentWorkoutsCarousel() {
  const { workouts, movementQuality } = useWorkout()
  const router = useRouter()

  // Debug logging
  React.useEffect(() => {
    console.log('[RecentWorkoutsCarousel] Total workouts:', workouts.length)
    console.log('[RecentWorkoutsCarousel] Sample workout:', workouts[0])
    console.log('[RecentWorkoutsCarousel] Has rawData:', workouts[0]?.rawData ? 'Yes' : 'No')
  }, [workouts])

  // Get last 5 workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMetricsForWorkout = (workoutDate: string) => {
    return movementQuality.find(mq => mq.date === workoutDate)
  }

  const handleAskCoach = React.useCallback((workout: Workout) => {
    const workoutName = workout.exercises[0]?.name || 'Workout'
    const workoutSummary = `${workoutName} on ${formatDate(workout.date)}`
    const metrics = getMetricsForWorkout(workout.date)
    
    // Create the message
    let message = `I did this workout: ${workoutSummary}. Can you provide feedback on my form and suggest improvements?`
    
    if (metrics) {
      message += `\n\nMetrics for this workout:\n- Training Intensity: ${(metrics.training_intensity * 100).toFixed(1)}%\n- Recovery Time: ${metrics.recovery_time} day(s)\n- Injury Risk: ${(metrics.confidence * 100).toFixed(1)}%`
    }
    
    // Prepare the complete workout data to store
    const workoutData = {
      message,
      workout,
      metrics: metrics ? {
        training_intensity: metrics.training_intensity,
        recovery_time: metrics.recovery_time,
        confidence: metrics.confidence
      } : null,
      summary: workoutSummary,
      timestamp: Date.now()
    }
    
    // Store workout data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending-workout-query', JSON.stringify(workoutData))
    }
    
    // Navigate to coach without URL parameters
    router.push('/coach')
  }, [router, movementQuality])

  if (recentWorkouts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold tracking-tight">Recent Workouts</h3>
        <Link href="/coach" className="text-[13px] text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:-mx-6 lg:px-6">
        {recentWorkouts.map((workout) => (
          <Card
            key={workout.id}
            className="flex-shrink-0 w-[280px] p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-[13px] font-medium text-foreground/60">
                {formatDate(workout.date)}
              </span>
            </div>

            {/* Workout Name/Type */}
            <div className="space-y-2">
              <div className="text-[15px] font-semibold">
                {workout.exercises[0]?.name || 
                 (workout.rawData && typeof workout.rawData === 'object' && 'workout_name' in workout.rawData ? String(workout.rawData.workout_name) : null) ||
                 (workout.rawData && typeof workout.rawData === 'object' && 'workout_type' in workout.rawData ? String(workout.rawData.workout_type) : null) ||
                 'Workout'}
              </div>
              
              {workout.rawData && 
               typeof workout.rawData === 'object' && 
               'workout_tags' in workout.rawData && 
               Array.isArray(workout.rawData.workout_tags) && 
               workout.rawData.workout_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(workout.rawData.workout_tags as string[]).slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {workout.rawData.workout_tags.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      +{workout.rawData.workout_tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Metrics Display */}
            {(() => {
              const metrics = getMetricsForWorkout(workout.date)
              if (!metrics) return null
              
              return (
                <div className="pt-2 border-t space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="flex flex-col items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{(metrics.training_intensity * 100).toFixed(0)}%</span>
                      <span className="text-[10px] text-muted-foreground">Intensity</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{metrics.recovery_time}d</span>
                      <span className="text-[10px] text-muted-foreground">Recovery</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{(metrics.confidence * 100).toFixed(0)}%</span>
                      <span className="text-[10px] text-muted-foreground">Injury Risk</span>
                    </div>
                  </div>
                </div>
              )
            })()}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 rounded-full"
              onClick={() => handleAskCoach(workout)}
            >
              <MessageSquare className="h-4 w-4" />
              Ask AI Coach
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

