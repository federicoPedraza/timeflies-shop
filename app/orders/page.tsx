"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OrdersPageContent } from "@/components/orders-page-content"

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <OrdersPageContent />
    </DashboardLayout>
  )
}
