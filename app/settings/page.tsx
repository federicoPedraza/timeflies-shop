"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { EcommerceSection } from "@/components/ecommerce-section"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your store configuration and preferences.</p>
        </div>

        <EcommerceSection />
      </div>
    </DashboardLayout>
  )
}
