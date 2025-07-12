"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OrdersPageContent } from "@/components/orders-page-content"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [initialSearch, setInitialSearch] = useState<string | null>(null)

  useEffect(() => {
    setOrderId(searchParams.get('order'))
    setInitialSearch(searchParams.get('search'))
  }, [searchParams])

  return (
    <DashboardLayout>
      <OrdersPageContent initialOrderId={orderId} initialSearch={initialSearch} />
    </DashboardLayout>
  )
}
