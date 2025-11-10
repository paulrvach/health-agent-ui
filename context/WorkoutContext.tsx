"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { workoutData } from './dummy-workout-data'

export interface Workout {
  id: string
  date: string
  exercises: Array<{
    name: string
    sets: number
    reps: number
    formScore?: number
  }>
  duration?: number
  notes?: string
  difficulty?: 'easy' | 'moderate' | 'hard'
  rawData?: Record<string, unknown> // Store original dummy workout object for AI coach
}

export interface MovementQuality {
  date: string
  training_intensity: number
  recovery_time: number
  confidence: number
}

export interface InjuryRisk {
  area: string
  level: 'low' | 'medium' | 'high'
  description: string
}

export interface UserProfile {
  name: string
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  injuryHistory: string[]
  goals: string[]
}

export interface AIInsight {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'mobility' | 'form' | 'recovery' | 'strength'
}

interface WorkoutContextType {
  userProfile: UserProfile
  workouts: Workout[]
  movementQuality: MovementQuality[]
  injuryRisks: InjuryRisk[]
  aiInsights: AIInsight[]
  addWorkout: (workout: Omit<Workout, 'id' | 'date'>) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

const STORAGE_KEY = 'fitness-app-data'

// Load data from dummy workout data
const loadWorkoutData = () => {
  const workouts: Workout[] = []
  const movementQuality: MovementQuality[] = []
  
  // Baselines for metrics
  const baseIntensity = 0.48
  const baseConfidence = 0.51

  // Flatten and transform workoutData
  const allWorkouts: Array<{ workout: Record<string, unknown>; from_timestamp: string }> = []
  console.log('[WorkoutContext] Loading dummy workout data, total entries:', workoutData.length)
  workoutData.forEach(entry => {
    if (entry.workouts && Array.isArray(entry.workouts)) {
      entry.workouts.forEach(workout => {
        allWorkouts.push({
          workout,
          from_timestamp: entry.from_timestamp
        })
      })
    }
  })
  console.log('[WorkoutContext] Total workouts found:', allWorkouts.length)

  // Transform each workout to Workout interface
  allWorkouts.forEach(({ workout: rawWorkout, from_timestamp }, index) => {
    // Extract date from from_timestamp (entry level) or fallback to workout timestamp
    let dateStr = ''
    if (from_timestamp) {
      const date = new Date(from_timestamp)
      dateStr = date.toISOString().split('T')[0]
    } else if (rawWorkout && typeof rawWorkout === 'object' && 'start_at_timestamp' in rawWorkout && rawWorkout.start_at_timestamp) {
      const timestamp = rawWorkout.start_at_timestamp
      const date = new Date(typeof timestamp === 'string' || typeof timestamp === 'number' ? timestamp : String(timestamp))
      dateStr = date.toISOString().split('T')[0]
    } else if (rawWorkout && typeof rawWorkout === 'object' && 'start_at' in rawWorkout && rawWorkout.start_at) {
      const startAt = rawWorkout.start_at
      const date = new Date(typeof startAt === 'string' || typeof startAt === 'number' ? startAt : String(startAt))
      dateStr = date.toISOString().split('T')[0]
    } else {
      // Fallback to today if no timestamp
      dateStr = new Date().toISOString().split('T')[0]
    }

    // Get laps count for sets
    const laps = rawWorkout && typeof rawWorkout === 'object' && 'laps' in rawWorkout && Array.isArray(rawWorkout.laps) ? rawWorkout.laps : []
    const sets = laps.length || 1
    
    // Estimate reps from duration (rough estimate: duration in seconds / 60)
    const duration = rawWorkout && typeof rawWorkout === 'object' && 'duration' in rawWorkout ? rawWorkout.duration : undefined
    const durationNum = typeof duration === 'number' ? duration : (typeof duration === 'string' ? parseFloat(duration) : 0)
    const reps = durationNum > 0 ? Math.max(1, Math.floor(durationNum / 60)) : 10
    
    // Convert duration from seconds to minutes
    const durationMinutes = durationNum > 0 ? Math.floor(durationNum / 60) : undefined
    
    // Derive difficulty from duration
    let difficulty: 'easy' | 'moderate' | 'hard' = 'moderate'
    if (durationMinutes) {
      if (durationMinutes < 30) {
        difficulty = 'easy'
      } else if (durationMinutes > 60) {
        difficulty = 'hard'
      }
    }

    const workoutId = rawWorkout && typeof rawWorkout === 'object' && 'workout_id' in rawWorkout 
      ? String(rawWorkout.workout_id) 
      : `workout-${index}`
    const workoutName = rawWorkout && typeof rawWorkout === 'object' && 'workout_name' in rawWorkout
      ? String(rawWorkout.workout_name)
      : (rawWorkout && typeof rawWorkout === 'object' && 'workout_type' in rawWorkout
        ? String(rawWorkout.workout_type)
        : 'Workout')

    workouts.push({
      id: workoutId,
      date: dateStr,
      exercises: [
        {
          name: workoutName,
          sets,
          reps,
          formScore: undefined
        }
      ],
      duration: durationMinutes,
      difficulty,
      notes: '',
      rawData: rawWorkout // Store full workout object
    })
  })

  // Sort workouts by date
  workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  console.log('[WorkoutContext] Transformed workouts:', workouts.length)

  // Get all unique dates from workouts
  const workoutDates = new Set(workouts.map(w => w.date))
  const sortedDates = Array.from(workoutDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Calculate date range for movementQuality
  const minDate = sortedDates.length > 0 ? new Date(sortedDates[0]) : new Date()
  const maxDate = sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]) : new Date()
  const today = new Date()
  const endDate = maxDate > today ? maxDate : today
  
  // Generate movementQuality for date range
  const dateMap = new Map<string, Workout[]>()
  workouts.forEach(workout => {
    if (!dateMap.has(workout.date)) {
      dateMap.set(workout.date, [])
    }
    dateMap.get(workout.date)!.push(workout)
  })

  // Calculate recovery_time for each workout date
  const recoveryTimeMap = new Map<string, number>()
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    if (i === 0) {
      // First workout: default to 2 days
      recoveryTimeMap.set(sortedDates[i], 2)
    } else {
      const previousDate = new Date(sortedDates[i - 1])
      const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
      recoveryTimeMap.set(sortedDates[i], daysDiff)
    }
  }

  // Generate movementQuality entries for each day in range
  const currentDate = new Date(minDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayWorkouts = dateMap.get(dateStr) || []
    const hasWorkout = dayWorkouts.length > 0
    
    // Calculate training intensity based on workout duration
    let training_intensity = baseIntensity
    if (hasWorkout) {
      const totalDuration = dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
      // Normalize duration to intensity (0-1 scale, assuming max 120 minutes = 1.0)
      const intensityFromDuration = Math.min(1.0, (totalDuration / 120) * 0.5 + baseIntensity)
      training_intensity = intensityFromDuration
    }

    // Get recovery_time for this date
    let recovery_time = 2 // Default baseline
    if (hasWorkout && recoveryTimeMap.has(dateStr)) {
      recovery_time = recoveryTimeMap.get(dateStr)!
    }

    // Confidence (injury risk): varies with workout presence
    const confidence = hasWorkout
      ? Math.min(1.0, baseConfidence + (Math.random() * 0.3))
      : baseConfidence

    movementQuality.push({
      date: dateStr,
      training_intensity: parseFloat(training_intensity.toFixed(4)),
      recovery_time,
      confidence: parseFloat(confidence.toFixed(4))
    })

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return {
    userProfile: {
      name: 'Sarah Chen',
      fitnessLevel: 'intermediate' as const,
      injuryHistory: ['Previous knee injury (recovered)', 'Minor shoulder strain'],
      goals: ['Prevent injuries', 'Improve form', 'Build strength']
    },
    workouts,
    movementQuality,
    injuryRisks: [
      {
        area: 'Knees',
        level: 'medium' as const,
        description: 'Slight compensation detected in single-leg movements'
      },
      {
        area: 'Shoulders',
        level: 'low' as const,
        description: 'Good mobility and stability'
      },
      {
        area: 'Lower Back',
        level: 'low' as const,
        description: 'Proper form maintained during compound lifts'
      },
      {
        area: 'Hips',
        level: 'medium' as const,
        description: 'Could benefit from additional mobility work'
      }
    ] as InjuryRisk[],
    aiInsights: [
      {
        id: '1',
        title: 'Hip Mobility Improvement Needed',
        description: 'Your squat depth has improved 15% this month, but hip flexor tightness is limiting your range. Add 5 minutes of dynamic hip stretches before workouts.',
        priority: 'high' as const,
        category: 'mobility' as const
      },
      {
        id: '2',
        title: 'Excellent Form Consistency',
        description: 'Your deadlift form score has remained above 90% for 3 weeks straight. Great job maintaining proper technique even under fatigue.',
        priority: 'medium' as const,
        category: 'form' as const
      },
      {
        id: '3',
        title: 'Recovery Optimization',
        description: 'Detected minor form degradation in your last 2 sessions. Consider adding an extra rest day this week to prevent overtraining.',
        priority: 'high' as const,
        category: 'recovery' as const
      },
      {
        id: '4',
        title: 'Balanced Development',
        description: 'Your push-to-pull ratio is excellent at 1:1.2, reducing shoulder injury risk. Continue this balanced approach.',
        priority: 'low' as const,
        category: 'strength' as const
      }
    ] as AIInsight[]
  }
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Omit<WorkoutContextType, 'addWorkout' | 'updateUserProfile'>>(() => {
    // Always load from dummy workout data
    // Optionally check localStorage for user-added workouts, but always start with dummy data
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Only use stored data if it has dummy workout data (has rawData field)
          const hasDummyData = parsed.workouts?.some((w: Workout) => w.rawData)
          if (hasDummyData) {
            console.log('[WorkoutContext] Loading from localStorage, workouts:', parsed.workouts?.length || 0)
            return parsed as Omit<WorkoutContextType, 'addWorkout' | 'updateUserProfile'>
          } else {
            console.log('[WorkoutContext] Stored data does not have dummy workout data, loading fresh...')
            // Clear localStorage and load fresh dummy data
            localStorage.removeItem(STORAGE_KEY)
          }
        } catch (e) {
          console.error('Failed to parse stored data:', e)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      console.log('[WorkoutContext] Loading from dummy workout data...')
    }
    return loadWorkoutData()
  })

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data])

  const addWorkout = (workout: Omit<Workout, 'id' | 'date'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: `workout-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    }
    
    setData(prev => ({
      ...prev,
      workouts: [newWorkout, ...prev.workouts]
    }))
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...profile }
    }))
  }

  return (
    <WorkoutContext.Provider value={{ ...data, addWorkout, updateUserProfile }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}

