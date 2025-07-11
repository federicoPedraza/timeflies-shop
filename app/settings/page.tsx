"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { EcommerceSection } from "@/components/ecommerce-section"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">Gestiona la configuración de tu tienda y preferencias.</p>
        </div>

        <EcommerceSection />
      </div>
    </DashboardLayout>
  )
}
