"use client"

import { InjuryPredictionForm } from '@/components/InjuryPredictionForm'
import { useWorkout } from '@/context/WorkoutContext'

export default function ProfilePage() {
  const { userProfile } = useWorkout()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-[28px] font-bold tracking-tight">
              Athlete Profile
            </h1>
            <p className="text-[15px] text-foreground/60 leading-relaxed">
              Assess your injury risk based on your physical metrics and training data
            </p>
          </div>

          {/* User Info Card */}
          <div className="rounded-xl bg-card shadow-sm border border-border/50 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[24px] font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                  {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-[20px] font-semibold">{userProfile.name}</h2>
                <p className="text-[15px] text-foreground/60">
                  {userProfile.fitnessLevel} • {userProfile.goals.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Injury Prediction Form */}
          <InjuryPredictionForm />

          {/* Additional Info */}
          <div className="rounded-xl bg-muted/30 p-6 space-y-3">
            <h3 className="text-[17px] font-semibold">About This Assessment</h3>
            <p className="text-[15px] text-foreground/70 leading-relaxed">
              Our AI model analyzes multiple factors including your physical attributes, training history, 
              and recovery patterns to predict potential injury risk. Use this information to adjust your 
              training intensity and prioritize recovery when needed.
            </p>
            <p className="text-[13px] text-foreground/60">
              Note: This is an AI prediction tool and should not replace professional medical advice. 
              Always consult with healthcare professionals for medical concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

