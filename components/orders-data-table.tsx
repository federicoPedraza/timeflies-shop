"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Settings2, ArrowUpDown, ChevronDown, ChevronUp, ChevronRight, Copy, Check } from "lucide-react"
import { format } from "date-fns"
import type { Order } from "@/components/orders-page-content"
import { capitalizeFirstLetter, formatPrice } from "@/lib/utils"


interface OrdersDataTableProps {
  orders: Order[]
  onViewOrder: (order: Order) => void
  onInspectedOrderChange?: (order: Order | null) => void
  filtersComponent?: React.ReactNode
  collapseOnOrderInspect?: boolean
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
  // Shipping Status
  unshipped: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  unpacked: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
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
  onInspectedOrderChange,
  filtersComponent,
  collapseOnOrderInspect = false,
}: OrdersDataTableProps) {

  // Set responsive defaults - hide less important columns on smaller screens
  const [visibleColumns, setVisibleColumns] = useState({
    orderId: true,
    customer: true,
    products: true,
    orderStatus: true,
    paymentStatus: true,
    paymentMethod: true,
    shippingStatus: true,
    totalAmount: true,
    orderDate: true,
    providerItemId: true,
    provider: true,
    actions: true,
  })

  // State to track which orders have expanded product lists
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  // State to track inspected order (for row click)
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null)

  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-collapse table when an order is inspected (from click or from URL)
  useEffect(() => {
    if (inspectedOrder && collapseOnOrderInspect) {
      setIsCollapsed(true)
    }
  }, [inspectedOrder, collapseOnOrderInspect])

  // Notify parent component when inspected order changes
  useEffect(() => {
    if (onInspectedOrderChange) {
      onInspectedOrderChange(inspectedOrder)
    }
  }, [inspectedOrder, onInspectedOrderChange])

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

  // Function to handle row click for inspection
  const handleRowClick = (order: Order, event: React.MouseEvent) => {
    // Don't trigger row click if clicking on buttons or interactive elements
    const target = event.target as HTMLElement
    if (target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('select') ||
        target.closest('[data-copy-button]')) {
      return
    }

    // Toggle inspection - if same order is clicked, deselect it
    if (inspectedOrder?.id === order.id) {
      setInspectedOrder(null)
    } else {
      setInspectedOrder(order)
    }
  }

  // Function to copy order ID to clipboard
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)

  const copyOrderId = async (orderId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      await navigator.clipboard.writeText(orderId)
      setCopiedOrderId(orderId)
      setTimeout(() => {
        setCopiedOrderId((prev) => (prev === orderId ? null : prev))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy order ID:', err)
    }
  }

  // Function to truncate order ID for display
  const truncateOrderId = (orderId: string, maxLength: number = 12) => {
    if (orderId.length <= maxLength) return orderId
    return orderId.substring(0, maxLength) + "..."
  }

  // Set columns based on screen size
  useEffect(() => {
    const updateColumnVisibility = () => {
      const isLargeScreen = window.innerWidth >= 1024
      const isMediumScreen = window.innerWidth >= 768
      const isSmallScreen = window.innerWidth < 640

      setVisibleColumns({
        orderId: true,
        customer: true,
        products: isLargeScreen,
        orderStatus: true,
        paymentStatus: isMediumScreen,
        paymentMethod: isLargeScreen,
        shippingStatus: true,
        totalAmount: true,
        orderDate: !isSmallScreen,
        providerItemId: true,
        provider: true,
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

    if (sortField === "id") {
      aValue = a.id
      bValue = b.id
    }
    if (sortField === "providerOrderId") {
      aValue = a.providerOrderId
      bValue = b.providerOrderId
    }
    if (sortField === "provider") {
      aValue = a.provider
      bValue = b.provider
    }
    if (sortField === "shippingStatus") {
      aValue = a.shippingStatus
      bValue = b.shippingStatus
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
          <div className="text-sm min-w-0 flex-1">
            <div className="font-medium truncate" title={order.products[0].name}>{order.products[0].name}</div>
            <div className="text-muted-foreground">
              {formatPrice(order.products[0].price)} × {order.products[0].quantity}
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
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium truncate" title={product.name}>{product.name}</div>
                          <div className="text-muted-foreground">
              {formatPrice(product.price)} × {product.quantity}
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
            <CardTitle>
              Orders List ({orders.length})
              {inspectedOrder && (
                <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
                  • Inspecting {inspectedOrder.orderNumber}
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {inspectedOrder
                ? `Inspecting order ${inspectedOrder.orderNumber} - click the expand button to return to full view`
                : "Complete view of all orders with detailed information"
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
                    {key === "orderId" && "Order ID"}
                    {key === "customer" && "Customer"}
                    {key === "products" && "Products"}
                    {key === "orderStatus" && "Order Status"}
                    {key === "paymentStatus" && "Payment Status"}
                    {key === "paymentMethod" && "Payment Method"}
                    {key === "shippingStatus" && "Shipping Status"}
                    {key === "totalAmount" && "Total Amount"}
                    {key === "orderDate" && "Order Date"}
                    {key === "providerItemId" && "Provider Item ID"}
                    {key === "provider" && "Provider"}
                    {key === "actions" && "Actions"}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCollapsed(!isCollapsed)
                // If expanding and there's an inspected order, clear it
                if (isCollapsed && inspectedOrder) {
                  setInspectedOrder(null)
                }
              }}
              className="p-2"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {/* Filters - hidden when order is inspected */}
      {filtersComponent && !inspectedOrder && (
        <div className="px-4">
          {filtersComponent}
        </div>
      )}
      {/* Table collapsible only */}
      {!isCollapsed && (
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full border-t">
            <div className="w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    {visibleColumns.orderId && (
                      <TableHead className="w-[140px] text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("id")}
                          className="h-auto p-0 font-semibold"
                        >
                          Order ID
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
                    {visibleColumns.products && <TableHead className="w-[250px] max-w-[250px]">Products</TableHead>}
                    {visibleColumns.orderStatus && <TableHead className="min-w-[150px]">Order Status</TableHead>}
                    {visibleColumns.paymentStatus && <TableHead className="min-w-[150px]">Payment Status</TableHead>}
                    {visibleColumns.paymentMethod && <TableHead className="min-w-[160px]">Payment Method</TableHead>}
                    {visibleColumns.shippingStatus && (
                      <TableHead className="min-w-[150px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("shippingStatus")}
                          className="h-auto p-0 font-semibold"
                        >
                          Shipping Status
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                    )}
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
                    {visibleColumns.providerItemId && (
                      <TableHead className="min-w-[140px] text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("providerOrderId")}
                          className="h-auto p-0 font-semibold"
                        >
                          Provider Item ID
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.provider && (
                      <TableHead className="min-w-[120px] text-center">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("provider")}
                          className="h-auto p-0 font-semibold"
                        >
                          Provider
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.actions && <TableHead className="text-center min-w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                        inspectedOrder?.id === order.id ? "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={(event) => handleRowClick(order, event)}
                    >
                      {visibleColumns.orderId && (
                        <TableCell className="text-center w-[140px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                data-copy-button
                                onClick={(e) => copyOrderId(order.id, e)}
                                className="inline-flex items-center gap-1 p-1 rounded hover:bg-muted/50 transition-colors group"
                              >
                                <Chip variant="readonly" size="sm" className="max-w-[100px]">
                                  <span className="truncate">{truncateOrderId(order.id)}</span>
                                </Chip>
                                {copiedOrderId === order.id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{order.id}</p>
                              <p className="text-xs text-muted-foreground">Click to copy</p>
                            </TooltipContent>
                          </Tooltip>
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
                        <TableCell className="w-[250px] max-w-[250px]">
                          {renderProducts(order)}
                        </TableCell>
                      )}
                      {visibleColumns.orderStatus && (
                        <TableCell>
                          <Chip variant="readonly" size="sm" className={statusColors[order.orderStatus]}>
                            {capitalizeFirstLetter(order.orderStatus)}
                          </Chip>
                        </TableCell>
                      )}
                      {visibleColumns.paymentStatus && (
                        <TableCell>
                          <Chip variant="readonly" size="sm" className={statusColors[order.paymentStatus]}>
                            {capitalizeFirstLetter(order.paymentStatus)}
                          </Chip>
                        </TableCell>
                      )}
                      {visibleColumns.paymentMethod && <TableCell>{paymentMethodLabels[order.paymentMethod]}</TableCell>}
                      {visibleColumns.shippingStatus && (
                        <TableCell>
                          <Chip variant="readonly" size="sm" className={statusColors[order.shippingStatus]}>
                            {capitalizeFirstLetter(order.shippingStatus)}
                          </Chip>
                        </TableCell>
                      )}
                      {visibleColumns.totalAmount && (
                        <TableCell className="font-medium">{formatPrice(order.totalAmount)}</TableCell>
                      )}
                      {visibleColumns.orderDate && (
                        <TableCell>{format(new Date(order.orderDate), "dd MMM, yyyy")}</TableCell>
                      )}
                      {visibleColumns.providerItemId && (
                        <TableCell className="text-center">
                          <Chip variant="readonly" size="sm">
                            {order.providerOrderId}
                          </Chip>
                        </TableCell>
                      )}
                      {visibleColumns.provider && (
                        <TableCell className="text-center">
                          <Chip variant="readonly" size="sm">
                            {order.provider}
                          </Chip>
                        </TableCell>
                      )}
                      {visibleColumns.actions && (
                        <TableCell className="text-center">
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
      )}
    </Card>
  )
}
