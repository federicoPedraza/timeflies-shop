"use client"
import { StatsCards } from "@/components/stats-cards"
import { RecentActivity } from "@/components/recent-activity"
import { ActivityChart } from "@/components/activity-chart"
import { ClocksSoldFameChart } from "@/components/clocks-sold-fame-chart"
import { InventoryRevenueChart } from "@/components/inventory-revenue-chart"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function DashboardContent() {
  const [hideFinancials, setHideFinancials] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
            <button
              onClick={() => setHideFinancials(!hideFinancials)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={hideFinancials ? "Show financial information" : "Hide financial information"}
            >
              {hideFinancials ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your clock store today.</p>
        </div>
      </div>

      <div className="flex-shrink-0">
        <StatsCards
          hideFinancials={hideFinancials}
          selectedCard={selectedCard}
          onCardSelect={setSelectedCard}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
        <div className="col-span-4 h-full">
          {selectedCard === "Clocks Sold" ? (
            <ClocksSoldFameChart />
          ) : selectedCard === "Total Revenue" ? (
            <InventoryRevenueChart />
          ) : (
            <ActivityChart />
          )}
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
