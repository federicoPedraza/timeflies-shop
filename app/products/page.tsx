"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductsPageContent } from "@/components/products-page-content"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { HelpPanel } from "@/components/help-panel"
import { useHelp } from "@/components/help-context"

function ProductsPageWithSearchParams() {
  const searchParams = useSearchParams()
  const [productId, setProductId] = useState<string | null>(null)
  const [initialSearch, setInitialSearch] = useState<string | null>(null)
  const [initialStockStatus, setInitialStockStatus] = useState<string | null>(null)

  useEffect(() => {
    setProductId(searchParams.get('product'))
    setInitialSearch(searchParams.get('search'))
    setInitialStockStatus(searchParams.get('stockStatus'))
  }, [searchParams])

  return <ProductsPageContent
    initialProductId={productId}
    initialSearch={initialSearch}
    initialStockStatus={initialStockStatus}
  />
}

export default function ProductsPage() {
  const { isHelpOpen, closeHelp, currentHelpSteps } = useHelp()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<div>Loading...</div>}>
          <ProductsPageWithSearchParams />
        </Suspense>
        <HelpPanel
          isOpen={isHelpOpen}
          onClose={closeHelp}
          steps={currentHelpSteps}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
