"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { OrdersPageContent } from "@/components/orders-page-content"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function OrdersPageWithSearchParams() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [initialSearch, setInitialSearch] = useState<string | null>(null)

  useEffect(() => {
    setOrderId(searchParams.get('order'))
    setInitialSearch(searchParams.get('search'))
  }, [searchParams])

  return <OrdersPageContent initialOrderId={orderId} initialSearch={initialSearch} />
}

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <OrdersPageWithSearchParams />
      </Suspense>
    </DashboardLayout>
  )
}
