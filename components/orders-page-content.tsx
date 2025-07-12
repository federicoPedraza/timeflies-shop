"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { OrdersFilters } from "@/components/orders-filters-new"
import { OrdersDataTable } from "@/components/orders-data-table"
import { OrderDetailsDialog } from "@/components/order-details-dialog"
import { OrderChart } from "@/components/order-chart"

export type Order = {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
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
  totalAmount: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  orderDate: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  notes?: string
}

// Sample data for when there are no real orders
const sampleOrders: Order[] = [
  {
    id: "1",
    orderNumber: "TF-2024-001",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 555 123-4567",
    },
    products: [
      {
        id: "p1",
        name: "Vintage Wall Clock",
        category: "Wall Clocks",
        price: 89.99,
        quantity: 1,
        image: "/placeholder.svg?height=60&width=60",
      },
      {
        id: "p2",
        name: "Clock Batteries (4 pack)",
        category: "Accessories",
        price: 12.99,
        quantity: 1,
        image: "/placeholder.svg?height=60&width=60",
      },
    ],
    orderStatus: "processing",
    paymentStatus: "paid",
    paymentMethod: "credit_card",
    totalAmount: 112.47,
    shippingCost: 9.99,
    taxAmount: 8.24,
    discountAmount: 0,
    orderDate: "2024-01-15T10:30:00Z",
    shippingAddress: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
    notes: "Please handle with care - fragile items",
  },
  {
    id: "2",
    orderNumber: "TF-2024-002",
    customer: {
      name: "Mary Johnson",
      email: "mary.johnson@email.com",
      phone: "+1 555 987-6543",
    },
    products: [
      {
        id: "p3",
        name: "Modern Desk Clock",
        category: "Desk Clocks",
        price: 45.5,
        quantity: 2,
        image: "/placeholder.svg?height=60&width=60",
      },
    ],
    orderStatus: "delivered",
    paymentStatus: "paid",
    paymentMethod: "paypal",
    totalAmount: 98.49,
    shippingCost: 7.49,
    taxAmount: 7.28,
    discountAmount: 5.0,
    orderDate: "2024-01-14T14:22:00Z",
    shippingAddress: {
      street: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "United States",
    },
  },
  {
    id: "3",
    orderNumber: "TF-2024-003",
    customer: {
      name: "Carl Rodriguez",
      email: "carl.rodriguez@email.com",
      phone: "+1 555 456-7890",
    },
    products: [
      {
        id: "p4",
        name: "Antique Grandfather Clock",
        category: "Floor Clocks",
        price: 1299.99,
        quantity: 1,
        image: "/placeholder.svg?height=60&width=60",
      },
    ],
    orderStatus: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "bank_transfer",
    totalAmount: 1389.98,
    shippingCost: 49.99,
    taxAmount: 104.0,
    discountAmount: 65.0,
    orderDate: "2024-01-13T09:15:00Z",
    shippingAddress: {
      street: "789 Pine Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "United States",
    },
    notes: "White glove delivery required",
  },
  {
    id: "4",
    orderNumber: "TF-2024-004",
    customer: {
      name: "Anna Martinez",
      email: "anna.martinez@email.com",
      phone: "+1 555 321-0987",
    },
    products: [
      {
        id: "p5",
        name: "Digital Alarm Clock",
        category: "Alarm Clocks",
        price: 25.99,
        quantity: 3,
        image: "/placeholder.svg?height=60&width=60",
      },
    ],
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "credit_card",
    totalAmount: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    orderDate: "2024-01-12T16:45:00Z",
    shippingAddress: {
      street: "321 Elm Street",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "United States",
    },
    notes: "Customer requested cancellation - product out of stock",
  },
  {
    id: "5",
    orderNumber: "TF-2024-005",
    customer: {
      name: "Luis Fernandez",
      email: "luis.fernandez@email.com",
      phone: "+1 555 654-3210",
    },
    products: [
      {
        id: "p6",
        name: "Cuckoo Clock",
        category: "Specialty Clocks",
        price: 156.75,
        quantity: 1,
        image: "/placeholder.svg?height=60&width=60",
      },
      {
        id: "p7",
        name: "Clock Maintenance Kit",
        category: "Accessories",
        price: 29.99,
        quantity: 1,
        image: "/placeholder.svg?height=60&width=60",
      },
    ],
    orderStatus: "shipped",
    paymentStatus: "paid",
    paymentMethod: "credit_card",
    totalAmount: 201.72,
    shippingCost: 12.99,
    taxAmount: 14.95,
    discountAmount: 0,
    orderDate: "2024-01-11T11:20:00Z",
    shippingAddress: {
      street: "654 Maple Drive",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "United States",
    },
  },
]

export function OrdersPageContent() {
  const ordersFromDB = useQuery(api.orders.getOrdersForNewDesign)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Use database data if available, otherwise use sample data
  useEffect(() => {
    if (ordersFromDB && ordersFromDB.length > 0) {
      // Ensure types match the Order type
      const typedOrders = ordersFromDB as Order[]
      setOrders(typedOrders)
      setFilteredOrders(typedOrders)
    } else {
      setOrders(sampleOrders)
      setFilteredOrders(sampleOrders)
    }
  }, [ordersFromDB])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["orderStatus"]) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, orderStatus: newStatus } : order))
    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders)
  }

  const handleUpdatePaymentStatus = (orderId: string, newStatus: Order["paymentStatus"]) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, paymentStatus: newStatus } : order))
    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders)
  }

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

      {/* Order Chart */}
      <OrderChart />

      {/* Filters */}
      <OrdersFilters orders={orders} onFilteredOrdersChange={setFilteredOrders} />

      {/* Data Table */}
      <OrdersDataTable orders={filteredOrders} onViewOrder={handleViewOrder} onUpdateOrderStatus={handleUpdateOrderStatus} onUpdatePaymentStatus={handleUpdatePaymentStatus} />

      {/* Details Dialog */}
      <OrderDetailsDialog order={selectedOrder} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
    </div>
  )
}
