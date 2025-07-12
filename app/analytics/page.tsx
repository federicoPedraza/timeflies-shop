"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <PlaceholderSection
        title="Analytics"
        description="Detailed analysis of your business."
        icon={BarChart3}
      />
    </DashboardLayout>
  )
}
