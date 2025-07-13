"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { WelcomeDialog } from "@/components/welcome-dialog"
import { HelpPanel } from "@/components/help-panel"
import { useHelp } from "@/components/help-context"

export default function Dashboard() {
  const { isHelpOpen, closeHelp, currentHelpSteps } = useHelp()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
      <WelcomeDialog />
      <HelpPanel
        isOpen={isHelpOpen}
        onClose={closeHelp}
        steps={currentHelpSteps}
      />
    </ProtectedRoute>
  )
}
