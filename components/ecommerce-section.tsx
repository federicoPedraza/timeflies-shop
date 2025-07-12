"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShoppingCart, RefreshCw, CheckCircle, AlertCircle, Webhook, Shield, Database } from "lucide-react"
import { useTiendanubeStatus } from "@/hooks/use-tiendanube-status"
import { useProductSync } from "@/hooks/use-product-sync"
import { useOrderSync } from "@/hooks/use-order-sync"
import { useState } from "react"

export function EcommerceSection() {
  const { tiendanubeStatus, loading } = useTiendanubeStatus();
  const { syncing: syncingProducts, lastSyncResult: lastProductSyncResult, error: productError, syncProducts, clearError: clearProductError, clearLastSyncResult: clearLastProductSyncResult } = useProductSync();
  const { syncing: syncingOrders, lastSyncResult: lastOrderSyncResult, error: orderError, syncOrders, clearError: clearOrderError, clearLastSyncResult: clearLastOrderSyncResult } = useOrderSync();
  const [showProductSyncResult, setShowProductSyncResult] = useState(false);
  const [showOrderSyncResult, setShowOrderSyncResult] = useState(false);

  const getStatusBadge = () => {
    if (loading) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
          Checking...
        </Badge>
      );
    }

    if (tiendanubeStatus?.status) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
        Disconnected
      </Badge>
    );
  };

  const handleSyncProducts = async () => {
    const result = await syncProducts('tiendanube');
    if (result) {
      setShowProductSyncResult(true);
      // Ocultar el resultado después de 5 segundos
      setTimeout(() => {
        setShowProductSyncResult(false);
        clearLastProductSyncResult();
      }, 5000);
    }
  };

  const handleSyncOrders = async () => {
    const result = await syncOrders('tiendanube');
    if (result) {
      setShowOrderSyncResult(true);
      // Ocultar el resultado después de 5 segundos
      setTimeout(() => {
        setShowOrderSyncResult(false);
        clearLastOrderSyncResult();
      }, 5000);
    }
  };

  const getProductSyncButtonText = () => {
    if (syncingProducts) return 'Syncing...';
    return 'Sync Products';
  };

  const getProductSyncButtonIcon = () => {
    if (syncingProducts) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  const getOrderSyncButtonText = () => {
    if (syncingOrders) return 'Syncing...';
    return 'Sync Orders';
  };

  const getOrderSyncButtonIcon = () => {
    if (syncingOrders) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Sección de Conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            E-Commerce Connection
          </CardTitle>
          <CardDescription>
            Manage your online store connections and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">Tiendanube</span>
                  <span className="text-sm text-muted-foreground">
                    {tiendanubeStatus?.store_info?.name?.en || 'Online store platform'}
                  </span>
                  {tiendanubeStatus?.error && (
                    <span className="text-xs text-red-600">{tiendanubeStatus.error}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncProducts}
                  disabled={syncingProducts || !tiendanubeStatus?.status}
                  className="flex items-center gap-2"
                >
                  {getProductSyncButtonIcon()}
                  {getProductSyncButtonText()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncOrders}
                  disabled={syncingOrders || !tiendanubeStatus?.status}
                  className="flex items-center gap-2"
                >
                  {getOrderSyncButtonIcon()}
                  {getOrderSyncButtonText()}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://timefliesdemo.mitiendanube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Go to shop
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Mostrar errores de sincronización de productos */}
            {productError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Product Sync Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{productError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearProductError}
                  className="mt-2 h-6 px-2 text-xs text-red-600 hover:text-red-800"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Mostrar errores de sincronización de órdenes */}
            {orderError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Order Sync Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{orderError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearOrderError}
                  className="mt-2 h-6 px-2 text-xs text-red-600 hover:text-red-800"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Mostrar resultados de sincronización de productos */}
            {showProductSyncResult && lastProductSyncResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Product Sync Completed Successfully</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Total Products:</span>
                    <span className="ml-2 text-green-600">{lastProductSyncResult.summary.total_products}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Added:</span>
                    <span className="ml-2 text-green-600">{lastProductSyncResult.summary.added}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Updated:</span>
                    <span className="ml-2 text-green-600">{lastProductSyncResult.summary.updated}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Products Synced:</span>
                    <span className="ml-2 text-green-600">{lastProductSyncResult.summary.products_synced}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Deleted:</span>
                    <span className="ml-2 text-green-600">{lastProductSyncResult.summary.deleted}</span>
                  </div>
                </div>

                {lastProductSyncResult.summary.errors > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <span className="font-medium">Warnings:</span> {lastProductSyncResult.summary.errors} errors occurred during sync
                  </div>
                )}
              </div>
            )}

            {/* Mostrar resultados de sincronización de órdenes */}
            {showOrderSyncResult && lastOrderSyncResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Order Sync Completed Successfully</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Total Orders:</span>
                    <span className="ml-2 text-blue-600">{lastOrderSyncResult.summary.total}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Added:</span>
                    <span className="ml-2 text-blue-600">{lastOrderSyncResult.summary.added}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Updated:</span>
                    <span className="ml-2 text-blue-600">{lastOrderSyncResult.summary.updated}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Orders Synced:</span>
                    <span className="ml-2 text-blue-600">{lastOrderSyncResult.summary.orders_synced}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Products Processed:</span>
                    <span className="ml-2 text-blue-600">{lastOrderSyncResult.summary.products_processed}</span>
                  </div>
                </div>

                {/* Show duplicate cleanup information */}
                {lastOrderSyncResult.summary.cleanup && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Duplicate Cleanup</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-orange-700 font-medium">Total Orders:</span>
                        <span className="ml-1 text-orange-600">{lastOrderSyncResult.summary.cleanup.total_orders}</span>
                      </div>
                      <div>
                        <span className="text-orange-700 font-medium">Duplicates Removed:</span>
                        <span className="ml-1 text-orange-600">{lastOrderSyncResult.summary.cleanup.duplicates_removed}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show local refresh information */}
                {lastOrderSyncResult.summary.local_refresh && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm font-medium">Local Orders Refreshed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-700 font-medium">Total Processed:</span>
                        <span className="ml-1 text-green-600">{lastOrderSyncResult.summary.local_refresh.total_processed}</span>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Created:</span>
                        <span className="ml-1 text-green-600">{lastOrderSyncResult.summary.local_refresh.created}</span>
                      </div>
                    </div>
                  </div>
                )}

                {lastOrderSyncResult.summary.errors > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <span className="font-medium">Warnings:</span> {lastOrderSyncResult.summary.errors} errors occurred during sync
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks Configuration
          </CardTitle>
          <CardDescription>
            Automatic product synchronization via webhooks (configure in Tiendanube panel)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Webhook system status */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">Webhook System</span>
                  <span className="text-sm text-muted-foreground">
                    Endpoint ready to receive webhooks from Tiendanube
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </div>

            {/* Endpoint information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Webhook URL</span>
                </div>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  https://your-domain.com/api/webhooks/tiendanube
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure this URL in your Tiendanube app settings
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Security Features</span>
                </div>
                <ul className="text-xs space-y-1">
                  <li>• HMAC-SHA256 verification</li>
                  <li>• Idempotency handling</li>
                  <li>• LGPD compliance</li>
                  <li>• Detailed logging</li>
                </ul>
              </div>
            </div>

            {/* Supported events */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Supported Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-blue-600 mb-2">Product Events</h5>
                  <ul className="text-xs space-y-1">
                    <li>• product/created</li>
                    <li>• product/updated</li>
                    <li>• product/deleted</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-green-600 mb-2">Order Events</h5>
                  <ul className="text-xs space-y-1">
                    <li>• order/created</li>
                    <li>• order/updated</li>
                    <li>• order/cancelled</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-orange-600 mb-2">LGPD Events (Required)</h5>
                  <ul className="text-xs space-y-1">
                    <li>• store/redact</li>
                    <li>• customers/redact</li>
                    <li>• customers/data_request</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Configuration instructions */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Configuration Required</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Webhooks must be configured from your Tiendanube app panel, not from this application.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-yellow-700">
                      <strong>Steps:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                      <li>Go to your Tiendanube app settings</li>
                      <li>Navigate to Webhooks section</li>
                      <li>Add the webhook URL above</li>
                      <li>Select the required events</li>
                      <li>Save the configuration</li>
                    </ol>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    asChild
                  >
                    <a
                      href="/docs/webhooks-setup.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View Setup Guide
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Useful links */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="/api/webhooks/tiendanube/info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  System Info
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="/api/webhooks/tiendanube/logs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  View Logs
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
