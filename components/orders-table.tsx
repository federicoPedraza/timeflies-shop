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

export function OrdersTable() {
  const orders = useQuery(api.orders.getAllOrders);

  const {
    filters,
    setFilters,
    filteredOrders,
    totalOrders,
    filteredCount,
  } = useOrdersFilters(orders as OrderWithDetails[]);

  if (orders === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Cargando órdenes...</div>
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
    const numAmount = parseFloat(amount) / 100; // TiendaNube usa centavos
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <OrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalOrders={totalOrders}
        filteredOrders={filteredCount}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Órdenes</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredCount} de {totalOrders} órdenes
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {orders.length === 0 ? "No hay órdenes disponibles" : "No se encontraron órdenes con los filtros aplicados"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
