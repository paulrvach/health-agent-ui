"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useWorkout } from '@/context/WorkoutContext'
import { Calendar, Dumbbell } from 'lucide-react'

export function RecentWorkouts() {
  const { workouts } = useWorkout()
  const [mounted] = useState(() => typeof window !== 'undefined')

  // Get last 5 workouts
  const recentWorkouts = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const formatDate = (dateString: string) => {
    if (!mounted) {
      // Return a static formatted date during SSR
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-[hsl(var(--chart-1))]/10 [color:hsl(var(--chart-1))]'
      case 'moderate':
        return 'bg-[hsl(var(--chart-3))]/10 [color:hsl(var(--chart-3))]'
      case 'hard':
        return 'bg-[hsl(var(--destructive))]/10 [color:hsl(var(--destructive))]'
      default:
        return 'bg-muted/50 text-muted-foreground'
    }
  }

  const getFormScoreColor = (score: number) => {
    if (score >= 90) return '[color:hsl(var(--chart-1))]'
    if (score >= 75) return '[color:hsl(var(--chart-3))]'
    return '[color:hsl(var(--destructive))]'
  }

  const calculateAverageFormScore = (exercises: Array<{ formScore?: number }>) => {
    const scores = exercises.filter(e => e.formScore).map(e => e.formScore!)
    if (scores.length === 0) return null
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  if (recentWorkouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
          <CardDescription>Your workout history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No workouts logged yet. Start by logging your first workout!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
        <CardDescription>
          Your last {recentWorkouts.length} training sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentWorkouts.map((workout, index) => {
            const avgFormScore = calculateAverageFormScore(workout.exercises)
            
            return (
              <div key={workout.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(workout.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {workout.difficulty && (
                          <Badge variant="outline" className={getDifficultyColor(workout.difficulty)}>
                            {workout.difficulty}
                          </Badge>
                        )}
                        {avgFormScore && (
                          <span className={`text-xs font-semibold ${getFormScoreColor(avgFormScore)}`}>
                            Form: {avgFormScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {workout.exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-3 py-2"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>

                  {workout.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{workout.notes}&quot;
                    </p>
                  )}
                </div>

                {index < recentWorkouts.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

