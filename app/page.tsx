"use client"

import { WorkoutInputDialog } from '@/components/WorkoutInputDialog'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { MovementQualityChart } from '@/components/dashboard/MovementQualityChart'
import { RecentWorkoutsCarousel } from '@/components/dashboard/RecentWorkoutsCarousel'
import { InjuryRiskIndicators } from '@/components/dashboard/InjuryRiskIndicators'
import { RecentWorkouts } from '@/components/dashboard/RecentWorkouts'
import { AIInsights } from '@/components/dashboard/AIInsights'
import { useWorkout } from '@/context/WorkoutContext'

export default function Home() {
  const { userProfile } = useWorkout()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 lg:px-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getGreeting()}, {userProfile.name}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Track your progress and prevent injuries with AI-powered insights
              </p>
            </div>
            <WorkoutInputDialog />
          </div>

          {/* Stats Cards */}
          <div className="px-4 lg:px-6">
            <StatsCards />
          </div>

          {/* Movement Quality Chart */}
          <div className="px-4 lg:px-6 space-y-6">
            <MovementQualityChart />
            <RecentWorkoutsCarousel />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 px-4 lg:grid-cols-2 lg:gap-6 lg:px-6">
            {/* Left Column */}
            <div className="space-y-4 lg:space-y-6">
              <InjuryRiskIndicators />
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:space-y-6">
              <AIInsights />
              <RecentWorkouts />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
