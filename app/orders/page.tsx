"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OrdersTable } from "@/components/orders-table"

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
          <p className="text-muted-foreground">
            Gestiona todas las órdenes de tu tienda de TiendaNube.
          </p>
        </div>
        <OrdersTable />
      </div>
    </DashboardLayout>
  )
}
