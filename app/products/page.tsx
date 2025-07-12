"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { Package } from "lucide-react"

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <PlaceholderSection
        title="Products"
        description="Manage your product catalog."
        icon={Package}
      />
    </DashboardLayout>
  )
}
