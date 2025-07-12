"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductsPageContent } from "@/components/products-page-content"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function ProductsPageWithSearchParams() {
  const searchParams = useSearchParams()
  const [productId, setProductId] = useState<string | null>(null)
  const [initialSearch, setInitialSearch] = useState<string | null>(null)

  useEffect(() => {
    setProductId(searchParams.get('product'))
    setInitialSearch(searchParams.get('search'))
  }, [searchParams])

  return <ProductsPageContent initialProductId={productId} initialSearch={initialSearch} />
}

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsPageWithSearchParams />
      </Suspense>
    </DashboardLayout>
  )
}
