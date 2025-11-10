"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
}

export interface MovementQuality {
  date: string
  flexibility: number
  strength: number
  balance: number
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

// Mock data generator
const generateMockData = () => {
  const today = new Date()
  const workouts: Workout[] = []
  const movementQuality: MovementQuality[] = []
  
  // Generate last 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Generate workouts (not every day)
    if (Math.random() > 0.4) {
      workouts.push({
        id: `workout-${i}`,
        date: dateStr,
        exercises: [
          {
            name: ['Squats', 'Lunges', 'Deadlifts', 'Bench Press', 'Pull-ups'][Math.floor(Math.random() * 5)],
            sets: Math.floor(Math.random() * 3) + 2,
            reps: Math.floor(Math.random() * 8) + 8,
            formScore: Math.floor(Math.random() * 20) + 75
          },
          {
            name: ['Planks', 'Push-ups', 'Rows', 'Shoulder Press', 'Leg Press'][Math.floor(Math.random() * 5)],
            sets: Math.floor(Math.random() * 3) + 2,
            reps: Math.floor(Math.random() * 8) + 8,
            formScore: Math.floor(Math.random() * 20) + 75
          }
        ],
        duration: Math.floor(Math.random() * 30) + 30,
        difficulty: ['easy', 'moderate', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'moderate' | 'hard',
        notes: ''
      })
    }
    
    // Generate movement quality data
    const baseFlexibility = 70
    const baseStrength = 65
    const baseBalance = 75
    const trend = i / 30 * 15 // Improving trend
    
    movementQuality.push({
      date: dateStr,
      flexibility: Math.min(95, baseFlexibility + trend + (Math.random() * 10 - 5)),
      strength: Math.min(95, baseStrength + trend + (Math.random() * 10 - 5)),
      balance: Math.min(95, baseBalance + trend + (Math.random() * 10 - 5))
    })
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
        level: 'medium',
        description: 'Slight compensation detected in single-leg movements'
      },
      {
        area: 'Shoulders',
        level: 'low',
        description: 'Good mobility and stability'
      },
      {
        area: 'Lower Back',
        level: 'low',
        description: 'Proper form maintained during compound lifts'
      },
      {
        area: 'Hips',
        level: 'medium',
        description: 'Could benefit from additional mobility work'
      }
    ],
    aiInsights: [
      {
        id: '1',
        title: 'Hip Mobility Improvement Needed',
        description: 'Your squat depth has improved 15% this month, but hip flexor tightness is limiting your range. Add 5 minutes of dynamic hip stretches before workouts.',
        priority: 'high',
        category: 'mobility'
      },
      {
        id: '2',
        title: 'Excellent Form Consistency',
        description: 'Your deadlift form score has remained above 90% for 3 weeks straight. Great job maintaining proper technique even under fatigue.',
        priority: 'medium',
        category: 'form'
      },
      {
        id: '3',
        title: 'Recovery Optimization',
        description: 'Detected minor form degradation in your last 2 sessions. Consider adding an extra rest day this week to prevent overtraining.',
        priority: 'high',
        category: 'recovery'
      },
      {
        id: '4',
        title: 'Balanced Development',
        description: 'Your push-to-pull ratio is excellent at 1:1.2, reducing shoulder injury risk. Continue this balanced approach.',
        priority: 'low',
        category: 'strength'
      }
    ]
  }
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Omit<WorkoutContextType, 'addWorkout' | 'updateUserProfile'>>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored data:', e)
        }
      }
    }
    return generateMockData()
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

