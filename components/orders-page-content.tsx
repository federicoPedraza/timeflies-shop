"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "convex/react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "../convex/_generated/api"
import { OrdersFilters } from "@/components/orders-filters-new"
import { OrdersDataTable } from "@/components/orders-data-table"
import { OrderDetailsDialog } from "@/components/order-details-dialog"
import { OrderDetailsInline } from "@/components/order-details-inline"

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
}

export function OrdersPageContent({ initialOrderId, initialSearch }: OrdersPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ordersFromDB = useQuery(api.orders.getOrdersWithProviderData)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">
            Loading orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
        <p className="text-muted-foreground">
          Manage and track all your clock orders with advanced filters and detailed views.
        </p>
      </div>

                  {/* Orders Section with Filters and Table */}
      <OrdersDataTable
        orders={filteredOrders}
        onViewOrder={handleViewOrder}
        onInspectedOrderChange={handleInspectedOrderChange}
        filtersComponent={
          <OrdersFilters
            orders={orders}
            onFilteredOrdersChange={setFilteredOrders}
            initialSearch={initialSearch}
          />
        }
        collapseOnOrderInspect={!!initialOrderId}
      />

      {/* Inline Order Details */}
      {orderForDisplay && (
        <OrderDetailsInline order={orderForDisplay} showShareAndOpenButtons={!!orderForDisplay} />
      )}

      {/* Details Dialog (kept for backward compatibility with action button) */}
      <OrderDetailsDialog order={selectedOrder} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
    </div>
  )
}
