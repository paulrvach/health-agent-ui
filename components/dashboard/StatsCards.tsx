"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkout } from '@/context/WorkoutContext'
import { Activity, Calendar, TrendingUp, Flame } from 'lucide-react'

export function StatsCards() {
  const { workouts, movementQuality } = useWorkout()
  const [mounted] = useState(() => typeof window !== 'undefined')

  // Calculate total workouts (only on client to avoid hydration issues)
  const totalWorkouts = mounted ? workouts.length : 0

  // Calculate current streak
  const calculateStreak = () => {
    if (!mounted || workouts.length === 0) return 0
    
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].date)
      workoutDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - streak)
      
      const daysDiff = Math.floor((expectedDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 0) {
        streak++
      } else if (daysDiff > 1) {
        break
      }
    }
    
    return streak
  }

  const currentStreak = calculateStreak()

  // Calculate average confidence (only on client)
  const avgConfidence = mounted && movementQuality.length > 0
    ? Math.round(
        movementQuality.slice(-7).reduce((acc, mq) => 
          acc + (mq.confidence * 100), 0
        ) / Math.min(7, movementQuality.length)
      )
    : 0

  // Determine next workout recommendation
  const getNextWorkoutRecommendation = () => {
    if (!mounted) return 'Loading...'
    if (workouts.length === 0) return 'Start your fitness journey today!'
    
    const lastWorkout = [...workouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
    
    const lastDate = new Date(lastWorkout.date)
    const today = new Date()
    const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSince === 0) return 'Great job today! Rest or light activity tomorrow'
    if (daysSince === 1) return 'Ready for your next session'
    if (daysSince >= 2) return 'Time to get back on track!'
    
    return 'Keep up the momentum'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            {currentStreak === 1 ? 'day' : 'days'} in a row
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Injury Risk Confidence</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgConfidence}%</div>
          <p className="text-xs text-muted-foreground">
            7-day average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Workout</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium mt-1">
            {getNextWorkoutRecommendation()}
          </div>
          <Badge variant="secondary" className="mt-2">
            Strength Focus
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

