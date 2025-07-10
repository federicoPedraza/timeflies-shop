"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, X, CheckCircle } from "lucide-react"

const initialOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    product: "Vintage Wall Clock",
    amount: "$89.99",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    product: "Modern Desk Clock",
    amount: "$45.50",
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    product: "Antique Grandfather Clock",
    amount: "$299.99",
    status: "processing",
    date: "2024-01-13",
  },
  {
    id: "ORD-004",
    customer: "Alice Brown",
    product: "Digital Alarm Clock",
    amount: "$25.99",
    status: "cancelled",
    date: "2024-01-12",
  },
  {
    id: "ORD-005",
    customer: "Charlie Wilson",
    product: "Cuckoo Clock",
    amount: "$156.75",
    status: "pending",
    date: "2024-01-11",
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export function OrdersTable() {
  const [orders, setOrders] = useState(initialOrders)

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Manage and track your clock orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {order.status === "pending" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Processing
                        </DropdownMenuItem>
                      )}
                      {order.status === "processing" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "completed")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Completed
                        </DropdownMenuItem>
                      )}
                      {(order.status === "pending" || order.status === "processing") && (
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          className="text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel Order
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
