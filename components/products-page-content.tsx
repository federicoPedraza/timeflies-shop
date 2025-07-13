"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useQuery } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "../convex/_generated/api"
import { ProductsFilters } from "@/components/products-filters"
import { ProductsDataTable } from "@/components/products-data-table"
import { ProductDetailsDialog } from "@/components/product-details-dialog"
import { ProductDetailsInline } from "./product-details-inline"

export type Product = {
  id: string
  provider: string
  providerProductId: string
  sku: string
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  compareAtPrice: number | null
  costPrice: number
  stockQuantity: number
  lowStockThreshold: number
  status: "active" | "inactive" | "discontinued"
  images: string[]
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  materials: string[]
  features: string[]
  warranty: string
  brand: string
  createdAt: string
  updatedAt: string
  tags: string[]
  profitMargin: number
  stockStatus: "in_stock" | "low_stock" | "out_of_stock"
  // Additional detailed fields
  handle: string | null
  seo_title: string | null
  seo_description: string | null
  published: boolean | null
  free_shipping: boolean | null
  video_url: string | null
}

interface ProductsPageContentProps {
  initialProductId?: string | null
  initialSearch?: string | null
  initialStockStatus?: string | null
}

export function ProductsPageContent({ initialProductId, initialSearch, initialStockStatus }: ProductsPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productsFromDB = useQuery(api.products.getProductsWithProviderData)
  const productSalesStats = useQuery(api.products.getProductSalesStats)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const productDetailsRef = useRef<HTMLDivElement>(null)

  // Update URL when inspected product changes
  const updateURL = useCallback((productId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (productId) {
      params.set('product', productId)
    } else {
      params.delete('product')
    }

    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/products${newURL}`, { scroll: false })
  }, [router, searchParams])

  // Use database data only
  useEffect(() => {
    if (productsFromDB && productsFromDB.length > 0) {
      setProducts(productsFromDB as Product[])
      setFilteredProducts(productsFromDB as Product[])
    } else {
      setProducts([])
      setFilteredProducts([])
    }
  }, [productsFromDB])

  // Handle initial product ID from URL
  useEffect(() => {
    if (initialProductId && productsFromDB !== undefined) {
      if (products.length > 0) {
        const product = products.find(p => p.id === initialProductId)
        if (product) {
          setInspectedProduct(product)
        } else {
          // If product not found, remove the invalid product ID from URL
          updateURL(null)
        }
      } else if (productsFromDB.length === 0) {
        // If products are loaded but empty, remove the invalid product ID from URL
        updateURL(null)
      }
      // If productsFromDB is still undefined (loading), wait for it to load
    }
  }, [initialProductId, products, productsFromDB, updateURL])

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsDetailsOpen(true)
  }, [])

  const handleInspectedProductChange = useCallback((product: Product | null) => {
    setInspectedProduct(product)
    updateURL(product?.id || null)
  }, [updateURL])

  // Get the product for display - prioritize inspected product over selected product
  const productForDisplay = useMemo(() => {
    return inspectedProduct || null
  }, [inspectedProduct])

  // Scroll to top when product details are displayed
  useEffect(() => {
    if (productForDisplay) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [productForDisplay])

  // Scroll to product details when displayed
  useEffect(() => {
    if (productForDisplay && productDetailsRef.current) {
      setTimeout(() => {
        productDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [productForDisplay])

  if (productsFromDB === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground">
            Loading products...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Products Management</h2>
        <p className="text-muted-foreground">
          Manage your clock inventory with detailed product information and stock tracking.
        </p>
      </div>

      {/* Products Section with Filters and Table */}
      <ProductsDataTable
        products={filteredProducts}
        onViewProduct={handleViewProduct}
        onInspectedProductChange={handleInspectedProductChange}
        filtersComponent={
          <ProductsFilters
            products={products}
            onFilteredProductsChange={setFilteredProducts}
            initialSearch={initialSearch}
            initialStockStatus={initialStockStatus}
          />
        }
        collapseOnProductInspect={!!initialProductId}
        productSalesStats={productSalesStats}
      />

      {/* Inline Product Details */}
      {productForDisplay && (
        <div ref={productDetailsRef}>
          <ProductDetailsInline product={productForDisplay} showShareAndOpenButtons={!!productForDisplay} />
        </div>
      )}

      {/* Details Dialog (kept for backward compatibility with action button) */}
      <ProductDetailsDialog product={selectedProduct} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
    </div>
  )
}
