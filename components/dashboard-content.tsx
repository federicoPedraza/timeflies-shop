"use client"
import { OrdersTable } from "@/components/orders-table"
import { StatsCards } from "@/components/stats-cards"
import { OrderChart } from "@/components/order-chart"
import { RecentActivity } from "@/components/recent-activity"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your clock store today.</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <OrderChart />
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>

      <OrdersTable />
    </div>
  )
}
