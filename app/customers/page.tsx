"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { HelpPanel } from "@/components/help-panel"
import { useHelp } from "@/components/help-context"
import { Users } from "lucide-react"

export default function CustomersPage() {
  const { isHelpOpen, closeHelp, currentHelpSteps } = useHelp()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PlaceholderSection
          title="Customers"
          description="Manage your customer database."
          icon={Users}
        />
        <HelpPanel
          isOpen={isHelpOpen}
          onClose={closeHelp}
          steps={currentHelpSteps}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
