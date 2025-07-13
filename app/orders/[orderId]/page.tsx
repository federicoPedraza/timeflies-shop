"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { OrderDetailsInline } from "@/components/order-details-inline"
import { CopyIdButton } from "@/components/copy-id-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, ExternalLink, User } from "lucide-react"
import { useMemo, useState, useCallback } from "react"

interface OrderPageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderPage({ params }: OrderPageProps) {
  const { orderId } = use(params);
  const orders = useQuery(api.orders.getOrdersWithProviderData);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Find the order by Convex _id
  const order = useMemo(() => {
    if (!orders) return null;
    return orders.find((o) => o.id === orderId) || null;
  }, [orders, orderId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const handleBackToOrders = useCallback(() => {
    router.push("/orders");
  }, [router]);

  const handleOpenTiendaNubeAdmin = useCallback(() => {
    if (order?.providerOrderId) {
      const tiendanubeAdminUrl = process.env.NEXT_PUBLIC_TIENDANUBE_ADMIN_DASHBOARD || "https://timefliesdemo.mitiendanube.com/admin/v2";
      const orderUrl = `${tiendanubeAdminUrl}/orders/${order.providerOrderId}`;
      window.open(orderUrl, "_blank");
    }
  }, [order]);

  const handleOpenTiendaNubeCustomer = useCallback(() => {
    if (order?.customer?.id) {
      const tiendanubeAdminUrl = process.env.NEXT_PUBLIC_TIENDANUBE_ADMIN_DASHBOARD || "https://timefliesdemo.mitiendanube.com/admin/v2";
      const customerUrl = `${tiendanubeAdminUrl}/customers/${order.customer.id}`;
      window.open(customerUrl, "_blank");
    }
  }, [order]);

  if (orders === undefined) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Loading Order...</h2>
              <p className="text-muted-foreground">Fetching order details...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
              <p className="text-muted-foreground">The order you&apos;re looking for doesn&apos;t exist.</p>
              <Button onClick={handleBackToOrders} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackToOrders}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
                <p className="text-muted-foreground">
                  {order.customer?.name} • {order.customer?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyIdButton
                orderId={order.providerOrderId}
                className=""
              />
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenTiendaNubeAdmin}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View in TiendaNube
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenTiendaNubeCustomer}>
                <User className="mr-2 h-4 w-4" />
                View Customer
              </Button>
            </div>
          </div>

          {/* Order Details */}
          <OrderDetailsInline order={order} showShareAndOpenButtons={false} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
