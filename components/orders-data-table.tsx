"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Eye, MoreHorizontal, Settings2, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import type { Order } from "@/components/orders-page-content"

interface OrdersDataTableProps {
  orders: Order[]
  onViewOrder: (order: Order) => void
  onUpdateOrderStatus: (orderId: string, status: Order["orderStatus"]) => void
  onUpdatePaymentStatus: (orderId: string, status: Order["paymentStatus"]) => void
}

const statusColors = {
  // Order Status
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  // Payment Status
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  partial: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
}

const paymentMethodLabels = {
  credit_card: "Credit Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
  cash_on_delivery: "Cash on Delivery",
}

export function OrdersDataTable({
  orders,
  onViewOrder,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
}: OrdersDataTableProps) {
  // Set responsive defaults - hide less important columns on smaller screens
  const [visibleColumns, setVisibleColumns] = useState({
    orderNumber: true,
    customer: true,
    products: false, // Hide by default - can be toggled
    orderStatus: true,
    paymentStatus: false, // Hide by default - can be toggled
    paymentMethod: false, // Hide by default - can be toggled
    totalAmount: true,
    orderDate: true,
    actions: true,
  })

  // State to track which orders have expanded product lists
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  // Function to toggle product list expansion for an order
  const toggleProductExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

    // Set columns based on screen size
  useEffect(() => {
    const updateColumnVisibility = () => {
      const isLargeScreen = window.innerWidth >= 1024
      const isMediumScreen = window.innerWidth >= 768
      const isSmallScreen = window.innerWidth < 640

      setVisibleColumns({
        orderNumber: true,
        customer: true,
        products: isLargeScreen,
        orderStatus: true,
        paymentStatus: isMediumScreen,
        paymentMethod: isLargeScreen,
        totalAmount: true,
        orderDate: !isSmallScreen,
        actions: true,
      })
    }

    updateColumnVisibility()
    window.addEventListener('resize', updateColumnVisibility)
    return () => window.removeEventListener('resize', updateColumnVisibility)
  }, [])

  const [sortField, setSortField] = useState<keyof Order | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortField) return 0

    let aValue = a[sortField]
    let bValue = b[sortField]

    if (sortField === "orderDate") {
      aValue = new Date(a.orderDate).getTime()
      bValue = new Date(b.orderDate).getTime()
    }

    if (sortField === "customer") {
      aValue = a.customer.name
      bValue = b.customer.name
    }

    if (aValue && bValue && aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue && bValue && aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Function to render products for an order
  const renderProducts = (order: Order) => {
    const isExpanded = expandedOrders.has(order.id)
    const hasMoreProducts = order.products.length > 1

    if (order.products.length === 0) {
      return <div className="text-muted-foreground text-sm">No products</div>
    }

    return (
      <div className="space-y-1">
        {/* Always show the first product */}
        <div className="flex items-center gap-2">
          <img
            src={order.products[0].image || "/placeholder.svg"}
            alt={order.products[0].name}
            className="h-8 w-8 rounded object-cover flex-shrink-0"
          />
          <div className="text-sm">
            <div className="font-medium">{order.products[0].name}</div>
            <div className="text-muted-foreground">
              ${order.products[0].price} × {order.products[0].quantity}
            </div>
          </div>
        </div>

        {/* Show additional products if expanded */}
        {isExpanded && order.products.slice(1).map((product) => (
          <div key={product.id} className="flex items-center gap-2">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="h-8 w-8 rounded object-cover flex-shrink-0"
            />
            <div className="text-sm">
              <div className="font-medium">{product.name}</div>
              <div className="text-muted-foreground">
                ${product.price} × {product.quantity}
              </div>
            </div>
          </div>
        ))}

        {/* Show expand/collapse button if there are more products */}
        {hasMoreProducts && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleProductExpansion(order.id)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide {order.products.length - 1} more
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                View {order.products.length - 1} more
              </>
            )}
          </Button>
        )}
      </div>
    )
  }


  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orders ({orders.length})</CardTitle>
            <CardDescription>Complete view of all orders with detailed information</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(visibleColumns).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={value}
                  onCheckedChange={(checked) => setVisibleColumns((prev) => ({ ...prev, [key]: checked }))}
                >
                  {key === "orderNumber" && "Order Number"}
                  {key === "customer" && "Customer"}
                  {key === "products" && "Products"}
                  {key === "orderStatus" && "Order Status"}
                  {key === "paymentStatus" && "Payment Status"}
                  {key === "paymentMethod" && "Payment Method"}
                  {key === "totalAmount" && "Total Amount"}
                  {key === "orderDate" && "Order Date"}
                  {key === "actions" && "Actions"}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full border-t">
          <div className="min-w-max w-full">
            <Table className="min-w-max w-full">
                <TableHeader>
                <TableRow>
                  {visibleColumns.orderNumber && (
                    <TableHead className="min-w-[140px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("orderNumber")}
                        className="h-auto p-0 font-semibold"
                      >
                        Order Number
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.customer && (
                    <TableHead className="min-w-[200px]">
                      <Button variant="ghost" onClick={() => handleSort("customer")} className="h-auto p-0 font-semibold">
                        Customer
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.products && <TableHead className="min-w-[300px]">Products</TableHead>}
                  {visibleColumns.orderStatus && <TableHead className="min-w-[150px]">Order Status</TableHead>}
                  {visibleColumns.paymentStatus && <TableHead className="min-w-[150px]">Payment Status</TableHead>}
                  {visibleColumns.paymentMethod && <TableHead className="min-w-[160px]">Payment Method</TableHead>}
                  {visibleColumns.totalAmount && (
                    <TableHead className="min-w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("totalAmount")}
                        className="h-auto p-0 font-semibold"
                      >
                        Total Amount
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.orderDate && (
                    <TableHead className="min-w-[130px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("orderDate")}
                        className="h-auto p-0 font-semibold"
                      >
                        Order Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                  )}
                  {visibleColumns.actions && <TableHead className="text-right min-w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    {visibleColumns.orderNumber && (
                      <TableCell className="font-medium">
                        <Chip variant="readonly" size="sm">
                          {order.orderNumber}
                        </Chip>
                      </TableCell>
                    )}
                    {visibleColumns.customer && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.products && (
                      <TableCell>
                        {renderProducts(order)}
                      </TableCell>
                    )}
                    {visibleColumns.orderStatus && (
                      <TableCell>
                        <Select
                          value={order.orderStatus}
                          onValueChange={(value) => onUpdateOrderStatus(order.id, value as Order["orderStatus"])}
                        >
                          <SelectTrigger className="w-full">
                            <Badge className={statusColors[order.orderStatus]}>{order.orderStatus}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                    {visibleColumns.paymentStatus && (
                      <TableCell>
                        <Select
                          value={order.paymentStatus}
                          onValueChange={(value) => onUpdatePaymentStatus(order.id, value as Order["paymentStatus"])}
                        >
                          <SelectTrigger className="w-full">
                            <Badge className={statusColors[order.paymentStatus]}>{order.paymentStatus}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                    {visibleColumns.paymentMethod && <TableCell>{paymentMethodLabels[order.paymentMethod]}</TableCell>}
                    {visibleColumns.totalAmount && (
                      <TableCell className="font-medium">${order.totalAmount.toFixed(2)}</TableCell>
                    )}
                    {visibleColumns.orderDate && (
                      <TableCell>{format(new Date(order.orderDate), "dd MMM, yyyy")}</TableCell>
                    )}
                    {visibleColumns.actions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewOrder(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      </Card>
  )
}
