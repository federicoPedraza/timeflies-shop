"use client"
import { StatsCards } from "@/components/stats-cards"
import { RecentActivity } from "@/components/recent-activity"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your clock store today.</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {/* Removed OrderChart - orders trends */}
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
