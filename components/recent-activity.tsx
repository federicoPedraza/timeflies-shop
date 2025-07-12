"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  ShoppingCart,
  AlertCircle,
  Truck,
  Box,
  DollarSign,
  XCircle,
  Edit,
  Clock,
  Tag,
  Archive,
  FileText
} from "lucide-react"
import { useWebhookLogs } from "@/hooks/use-webhook-logs"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react";

const eventIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Product events
  "product/created": Package,
  "product/updated": Edit,
  "product/deleted": Archive,
  // Order events
  "order/created": ShoppingCart,
  "order/updated": Edit,
  "order/paid": DollarSign,
  "order/packed": Box,
  "order/fulfilled": Truck,
  "order/cancelled": XCircle,
  "order/voided": XCircle,
  "order/edited": Edit,
  "order/pending": Clock,
  // Fulfillment
  "fulfillment/updated": Truck,
  // Product variant
  "product_variant/custom_fields_updated": Tag,
  // Order custom field
  "order_custom_field/created": FileText,
  "order_custom_field/updated": FileText,
  "order_custom_field/deleted": FileText,
  // Default
  default: AlertCircle,
}

const getEventIcon = (event: string) => {
  return eventIconMap[event] || eventIconMap.default;
};

const eventMessageMap: Record<string, (id?: number | null) => string> = {
  // Product events
  "product/created": (id) => `New product created${id ? ` (ID: ${id})` : ''}`,
  "product/updated": (id) => `Product updated${id ? ` (ID: ${id})` : ''}`,
  "product/deleted": (id) => `Product deleted${id ? ` (ID: ${id})` : ''}`,
  // Order events
  "order/created": () => "New order received",
  "order/updated": () => "Order updated",
  "order/paid": () => "Order payment received",
  "order/packed": () => "Order packed",
  "order/fulfilled": () => "Order fulfilled",
  "order/cancelled": () => "Order cancelled",
  "order/voided": () => "Order voided",
  "order/edited": () => "Order edited",
  "order/pending": () => "Order pending",
  // Fulfillment
  "fulfillment/updated": () => "Order fulfillment updated",
  // Product variant
  "product_variant/custom_fields_updated": () => "Product variant custom fields updated",
  // Order custom field
  "order_custom_field/created": () => "Order custom field created",
  "order_custom_field/updated": () => "Order custom field updated",
  "order_custom_field/deleted": () => "Order custom field deleted",
};

const getEventMessage = (event: string, id?: number | null) => {
  if (eventMessageMap[event]) {
    return eventMessageMap[event](id);
  }
  return `Event: ${event}`;
};

const eventColorMap: Record<string, string> = {
  // Éxito/positivo
  "product/created": "bg-green-500",
  "product/fulfilled": "bg-green-500",
  "order/created": "bg-green-500",
  "order/paid": "bg-green-500",
  "order/packed": "bg-green-500",
  "order/fulfilled": "bg-green-500",
  "fulfillment/updated": "bg-green-500",
  // Informativo/modificatorio
  "product/updated": "bg-blue-500",
  "order/updated": "bg-blue-500",
  "order/pending": "bg-blue-500",
  "order/edited": "bg-blue-500",
  "product_variant/custom_fields_updated": "bg-blue-500",
  "order_custom_field/created": "bg-blue-500",
  "order_custom_field/updated": "bg-blue-500",
  "order_custom_field/deleted": "bg-blue-500",
  // Negativo/cancelación
  "product/deleted": "bg-red-500",
  "order/cancelled": "bg-red-500",
  "order/voided": "bg-red-500",
  // Fallback
  default: "bg-gray-500",
};

const getEventColor = (event: string, status: string) => {
  return eventColorMap[event] ||
    (status === 'unhandled' ? 'bg-yellow-500' :
     status === 'error' ? 'bg-red-500' :
     eventColorMap.default);
};

export function RecentActivity() {
  const [visibleCount, setVisibleCount] = useState(5);
  const { logs = [], hasMore } = useWebhookLogs(visibleCount, 0) || {};

  // Show loading state while data is being fetched
  if (logs === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest webhook events from your store</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs mt-1">Webhook events will appear here when your store receives updates</p>
            </div>
          ) : (
            logs.map((log) => {
              const Icon = getEventIcon(log.event);
              const message = getEventMessage(log.event, log.productId);
              const timeAgo = formatDistanceToNow(new Date(log.processedAt), { addSuffix: true });

              return (
                <div key={log.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getEventColor(log.event, log.status)}`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{message}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Botón para cargar más logs */}
        {logs.length >= 5 && visibleCount < 10 && hasMore && (
          <button
            className="mt-4 w-full text-sm text-blue-600 hover:underline"
            onClick={() => setVisibleCount(10)}
          >
            Show more activity
          </button>
        )}
        {/* Si hay más de 10 logs, mostrar botón See activity sin función */}
        {visibleCount === 10 && hasMore && (
          <button
            className="mt-2 w-full text-sm text-muted-foreground cursor-not-allowed border border-gray-200 rounded py-1"
            disabled
          >
            See activity
          </button>
        )}
      </CardContent>
    </Card>
  )
}
