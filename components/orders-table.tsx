"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { OrdersFilters } from "./orders-filters";
import { useOrdersFilters, OrderWithDetails } from "@/hooks/use-orders-filters";
import { CopyIdButton } from "./copy-id-button";
import { OrderProducts } from "./order-products";
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

export function OrdersTable() {
  const orders = useQuery(api.orders.getAllOrders);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const {
    filters,
    setFilters,
    filteredOrders,
    totalOrders,
    filteredCount,
  } = useOrdersFilters(orders as OrderWithDetails[]);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (orders === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  const getStateBadge = (state: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      unpaid: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={variants[state as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {state}
      </Badge>
    );
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount) / 100; // TiendaNube uses cents
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <OrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalOrders={totalOrders}
        filteredOrders={filteredCount}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredCount} of {totalOrders} orders
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {orders.length === 0 ? "No orders available" : "No orders found with the applied filters"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrders.has(order._id);
                    const hasProducts = order.tiendanube_details?.products;

                    return [
                      <TableRow key={order._id}>
                        <TableCell>
                          {hasProducts && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOrderExpansion(order._id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              #{order.provider_order_id}
                            </span>
                            <CopyIdButton orderId={order.provider_order_id} />
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.tiendanube_details?.contact_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.tiendanube_details?.contact_email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.tiendanube_details?.total && order.tiendanube_details?.currency
                            ? formatCurrency(order.tiendanube_details.total, order.tiendanube_details.currency)
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {getStateBadge(order.state)}
                        </TableCell>
                        <TableCell>
                          {order.tiendanube_details?.payment_status || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.tiendanube_details?.created_at
                            ? formatDate(order.tiendanube_details.created_at)
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>,
                      isExpanded && hasProducts && order.tiendanube_details && (
                        <TableRow key={`${order._id}-products`}>
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-4 bg-gray-50">
                              <OrderProducts
                                productsJson={order.tiendanube_details.products!}
                                currency={order.tiendanube_details.currency || 'USD'}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ].filter(Boolean);
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
