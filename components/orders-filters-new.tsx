"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Order } from "@/components/orders-page-content"

interface Product {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  image: string
}

interface OrdersFiltersProps {
  orders: Order[]
  onFilteredOrdersChange: (filteredOrders: Order[]) => void
}

export function OrdersFilters({ orders, onFilteredOrdersChange }: OrdersFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [orderStatus, setOrderStatus] = useState<string>("all")
  const [paymentStatus, setPaymentStatus] = useState<string>("all")
  const [paymentMethod, setPaymentMethod] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  useEffect(() => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.products.some((product: Product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Status filters
    if (orderStatus !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === orderStatus)
    }

    if (paymentStatus !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentStatus)
    }

    if (paymentMethod !== "all") {
      filtered = filtered.filter((order) => order.paymentMethod === paymentMethod)
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((order) => new Date(order.orderDate) >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter((order) => new Date(order.orderDate) <= dateTo)
    }

    // Amount range filter
    if (minAmount) {
      filtered = filtered.filter((order) => order.totalAmount >= Number.parseFloat(minAmount))
    }

    if (maxAmount) {
      filtered = filtered.filter((order) => order.totalAmount <= Number.parseFloat(maxAmount))
    }

    onFilteredOrdersChange(filtered)
  }, [
    orders,
    searchTerm,
    orderStatus,
    paymentStatus,
    paymentMethod,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    onFilteredOrdersChange,
  ])

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Order number, customer, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Order Status</Label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAmount">Minimum Amount ($)</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0.00"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Maximum Amount ($)</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="1000.00"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
