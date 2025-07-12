"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { Users } from "lucide-react"

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <PlaceholderSection
        title="Customers"
        description="Manage your customer database."
        icon={Users}
      />
    </DashboardLayout>
  )
}
