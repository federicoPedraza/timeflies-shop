"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlaceholderSection } from "@/components/placeholder-section"
import { ShoppingCart } from "lucide-react"

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <PlaceholderSection
        title="Órdenes"
        description="Gestiona todas las órdenes de tu tienda."
        icon={ShoppingCart}
      />
    </DashboardLayout>
  )
}
