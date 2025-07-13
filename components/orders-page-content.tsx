"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "../convex/_generated/api"
import { OrdersFilters } from "@/components/orders-filters-new"
import { OrdersDataTable } from "@/components/orders-data-table"
import { OrderDetailsDialog } from "@/components/order-details-dialog"
import { OrderDetailsInline } from "@/components/order-details-inline"
import { Package, Filter, Eye, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type Order = {
  id: string
  provider: string
  providerOrderId: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
    id?: string | null
  }
  products: {
    id: string
    _id: string
    providerProductId: string
    name: string
    category: string
    price: number
    quantity: number
    image: string
  }[]
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partial"
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "cash_on_delivery"
  shippingStatus: "unshipped" | "shipped" | "unpacked" | "delivered"
  totalAmount: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  orderDate: string
  shippingAddress: {
    street: string
    number?: string
    floor?: string
    apartment?: string
    neighborhood?: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  shippingInfo?: {
    consumer_cost: number
    merchant_cost: number
  } | null
  notes?: string
}

interface OrdersPageContentProps {
  initialOrderId?: string | null
  initialSearch?: string | null
  initialOrderStatus?: string | null
}

export function OrdersPageContent({ initialOrderId, initialSearch, initialOrderStatus }: OrdersPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ordersFromDB = useQuery(api.orders.getOrdersWithProviderData)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isOptionsCollapsed, setIsOptionsCollapsed] = useState(true)

  // Helper to parse YYYY-MM-DD as local date
  function parseLocalDate(str?: string | null): Date | undefined {
    if (!str) return undefined;
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }

  // Parse date filters from URL
  const urlDate = searchParams.get('date')
  const urlDateFrom = searchParams.get('date_from')
  const urlDateTo = searchParams.get('date_to')
  let initialDateFrom: Date | undefined = undefined
  let initialDateTo: Date | undefined = undefined
  if (urlDate) {
    // If 'date' is present, filter for that day only
    initialDateFrom = parseLocalDate(urlDate)
    initialDateTo = parseLocalDate(urlDate)
  } else {
    if (urlDateFrom) initialDateFrom = parseLocalDate(urlDateFrom)
    if (urlDateTo) initialDateTo = parseLocalDate(urlDateTo)
  }

  // Filter state for badge and clear
  const [searchTerm, setSearchTerm] = useState(initialSearch || "")
  const [orderStatus, setOrderStatus] = useState<string>(initialOrderStatus || "all")
  const [paymentStatus, setPaymentStatus] = useState<string>("all")
  const [paymentMethod, setPaymentMethod] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDateFrom)
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDateTo)
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  const activeFiltersCount = [
    searchTerm,
    orderStatus !== "all" ? orderStatus : null,
    paymentStatus !== "all" ? paymentStatus : null,
    paymentMethod !== "all" ? paymentMethod : null,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearchTerm("")
    setOrderStatus("all")
    setPaymentStatus("all")
    setPaymentMethod("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    setMinAmount("")
    setMaxAmount("")
  }

  // Update URL when inspected order changes
  const updateURL = useCallback((orderId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (orderId) {
      params.set('order', orderId)
    } else {
      params.delete('order')
    }

    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/orders${newURL}`, { scroll: false })
  }, [router, searchParams])

  // Use database data only
  useEffect(() => {
    if (ordersFromDB && ordersFromDB.length > 0) {
      setOrders(ordersFromDB as Order[])
      setFilteredOrders(ordersFromDB as Order[])
    } else {
      setOrders([])
      setFilteredOrders([])
    }
  }, [ordersFromDB])

    // Handle initial order ID from URL
  useEffect(() => {
    if (initialOrderId && ordersFromDB !== undefined) {
      if (orders.length > 0) {
        const order = orders.find(o => o.id === initialOrderId)
        if (order) {
          setInspectedOrder(order)
        } else {
          // If order not found, remove the invalid order ID from URL
          updateURL(null)
        }
      } else if (ordersFromDB.length === 0) {
        // If orders are loaded but empty, remove the invalid order ID from URL
        updateURL(null)
      }
      // If ordersFromDB is still undefined (loading), wait for it to load
    }
  }, [initialOrderId, orders, ordersFromDB, updateURL])

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }, [])

  const handleInspectedOrderChange = useCallback((order: Order | null) => {
    setInspectedOrder(order)
    updateURL(order?.id || null)
  }, [updateURL])

  // Get the order for display - prioritize inspected order over selected order
  const orderForDisplay = useMemo(() => {
    return inspectedOrder || null
  }, [inspectedOrder])

  if (ordersFromDB === undefined) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage and track all your orders with advanced filters and detailed views.</p>
        </div>
        <div className="text-muted-foreground">
          Loading orders...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
        <p className="text-muted-foreground text-sm">Manage and track all your orders with advanced filters and detailed views.</p>
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Filters & Search</h2>
            {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOptionsCollapsed(!isOptionsCollapsed)}
              className="p-2"
              aria-label={isOptionsCollapsed ? "Expand filter options" : "Collapse filter options"}
            >
              {isOptionsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <OrdersFilters
          orders={orders}
          onFilteredOrdersChange={setFilteredOrders}
          initialSearch={initialSearch}
          initialOrderStatus={initialOrderStatus}
          initialDateFrom={initialDateFrom}
          initialDateTo={initialDateTo}
          isOptionsCollapsed={isOptionsCollapsed}
          setIsOptionsCollapsed={setIsOptionsCollapsed}
          activeFiltersCount={activeFiltersCount}
          clearFilters={clearFilters}
        />
      </div>

      {/* Orders Table Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Orders Table</h2>
        </div>
        <OrdersDataTable
          orders={filteredOrders}
          onViewOrder={handleViewOrder}
          onInspectedOrderChange={handleInspectedOrderChange}
          collapseOnOrderInspect={!!initialOrderId}
        />
      </div>

      {/* Selected Order Details Section */}
      {orderForDisplay && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Order Details</h2>
          </div>
          <OrderDetailsInline order={orderForDisplay} showShareAndOpenButtons={!!orderForDisplay} />
        </div>
      )}

      {/* Details Dialog (kept for backward compatibility with action button) */}
      <OrderDetailsDialog order={selectedOrder} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
    </div>
  )
}
