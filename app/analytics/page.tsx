"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <PlaceholderSection
        title="Analytics"
        description="Análisis detallado de tu negocio."
        icon={BarChart3}
      />
    </DashboardLayout>
  )
}
