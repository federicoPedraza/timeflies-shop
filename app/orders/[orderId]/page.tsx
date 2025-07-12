"use client"

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OrderDetailsInline } from "@/components/order-details-inline";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Loading Order...</h2>
            <p className="text-muted-foreground">Fetching order details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
            <p className="text-muted-foreground">No order found with the provided ID.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full py-8 px-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBackToOrders}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            {order.providerOrderId && (
              <Button
                variant="outline"
                onClick={handleOpenTiendaNubeAdmin}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Order in TiendaNube
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>

        <OrderDetailsInline
          order={order}
          onOpenTiendaNubeCustomer={handleOpenTiendaNubeCustomer}
        />
      </div>
    </DashboardLayout>
  );
}
