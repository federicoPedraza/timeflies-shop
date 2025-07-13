"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Users } from "lucide-react"

export default function CustomersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PlaceholderSection
          title="Customers"
          description="Manage your customer database."
          icon={Users}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
