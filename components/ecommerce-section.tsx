"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, ShoppingCart, RefreshCw, CheckCircle, AlertCircle, Webhook, Shield, Database, Link } from "lucide-react"
import { useTiendanubeStatus } from "@/hooks/use-tiendanube-status"
import { useProductSync } from "@/hooks/use-product-sync"
import { useOrderSync } from "@/hooks/use-order-sync"
import { useWebhookConfig } from "@/hooks/use-webhook-config"
import { useWebhookStatus } from "@/hooks/use-webhook-status"
import { useState } from "react"

export function EcommerceSection() {
  const { tiendanubeStatus, loading } = useTiendanubeStatus();
  const { syncing: syncingProducts, lastSyncResult: lastProductSyncResult, error: productError, syncProducts, clearError: clearProductError, clearLastSyncResult: clearLastProductSyncResult } = useProductSync();
  const { syncing: syncingOrders, lastSyncResult: lastOrderSyncResult, error: orderError, syncOrders, clearError: clearOrderError, clearLastSyncResult: clearLastOrderSyncResult } = useOrderSync();
  const { configuring, lastResult, error: webhookError, configureWebhooks, clearError: clearWebhookError, clearLastResult: clearWebhookResult } = useWebhookConfig();
  const { checking: checkingWebhookStatus, webhookStatus, error: webhookStatusError, checkWebhookStatus, clearError: clearWebhookStatusError, clearStatus: clearWebhookStatus } = useWebhookStatus();
  const [showProductSyncResult, setShowProductSyncResult] = useState(false);
  const [showOrderSyncResult, setShowOrderSyncResult] = useState(false);
  const [showWebhookResult, setShowWebhookResult] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

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

    const handleConfigureWebhooks = async () => {
    if (!webhookUrl.trim()) {
      return;
    }

    const result = await configureWebhooks(webhookUrl.trim());
    if (result) {
      setShowWebhookResult(true);
      // Ocultar el resultado después de 8 segundos
      setTimeout(() => {
        setShowWebhookResult(false);
        clearWebhookResult();
      }, 8000);
    }
  };

  const handleCheckWebhookStatus = async () => {
    await checkWebhookStatus();
  };

  const getWebhookStatusBadge = () => {
    if (checkingWebhookStatus) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
          Checking...
        </Badge>
      );
    }

    if (webhookStatusError) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
          Error
        </Badge>
      );
    }

    if (webhookStatus?.total_webhooks && webhookStatus.total_webhooks > 0) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          Active ({webhookStatus.total_webhooks})
        </Badge>
      );
    }

    // Only show "Not Configured" if we've actually checked and found no webhooks
    if (webhookStatus !== null && webhookStatus.total_webhooks === 0) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Not Configured
        </Badge>
      );
    }

    // Initial state - still loading
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
        Checking...
      </Badge>
    );
  };

  const getConfiguredWebhookUrl = () => {
    if (webhookStatus?.webhooks && webhookStatus.webhooks.length > 0) {
      return webhookStatus.webhooks[0].url;
    }
    return 'https://your-domain.com/api/webhooks/tiendanube';
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

                </div>
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
            Configure automatic synchronization via webhooks with your Tiendanube store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Webhook configuration form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-domain.com/api/webhooks/tiendanube"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleConfigureWebhooks}
                    disabled={configuring || !webhookUrl.trim() || !tiendanubeStatus?.status}
                    className="flex items-center gap-2"
                  >
                    {configuring ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link className="h-4 w-4" />
                    )}
                    {configuring ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the URL where Tiendanube should send webhook notifications
                </p>
              </div>
            </div>

            {/* Show webhook configuration errors */}
            {webhookError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Webhook Configuration Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{webhookError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearWebhookError}
                  className="mt-2 h-6 px-2 text-xs text-red-600 hover:text-red-800"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Show webhook configuration results */}
            {showWebhookResult && lastResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Webhook Configuration Completed</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Total Events:</span>
                    <span className="ml-2 text-blue-600">{lastResult.results.total}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Successfully Registered:</span>
                    <span className="ml-2 text-blue-600">{lastResult.results.successful}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Failed:</span>
                    <span className="ml-2 text-blue-600">{lastResult.results.failed}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Webhook URL:</span>
                    <span className="ml-2 text-blue-600 text-xs break-all">{lastResult.webhookUrl}</span>
                  </div>
                </div>

                {lastResult.results.errors.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <span className="font-medium">Errors:</span>
                    <ul className="mt-1 space-y-1">
                      {lastResult.results.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {lastResult.results.errors.length > 3 && (
                        <li>• ... and {lastResult.results.errors.length - 3} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Show webhook status errors */}
            {webhookStatusError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Webhook Status Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{webhookStatusError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearWebhookStatusError}
                  className="mt-2 h-6 px-2 text-xs text-red-600 hover:text-red-800"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Webhook system status */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">Webhook System</span>
                  <span className="text-sm text-muted-foreground">
                    {checkingWebhookStatus && webhookStatus === null
                      ? 'Checking webhook status...'
                      : webhookStatus?.total_webhooks
                      ? `${webhookStatus.total_webhooks} webhook events configured`
                      : 'No webhooks configured yet'
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getWebhookStatusBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckWebhookStatus}
                  disabled={checkingWebhookStatus || !tiendanubeStatus?.status}
                  className="flex items-center gap-2"
                >
                  {checkingWebhookStatus ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {checkingWebhookStatus ? 'Checking...' : 'Check Status'}
                </Button>
              </div>
            </div>

            {/* Endpoint information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Webhook URL</span>
                </div>
                <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                  {getConfiguredWebhookUrl()}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  {webhookStatus?.total_webhooks
                    ? 'Currently configured webhook endpoint'
                    : 'Default webhook endpoint URL'
                  }
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

            {/* Webhook status details */}
            {webhookStatus && webhookStatus.total_webhooks > 0 && (
              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-medium mb-3 text-green-800">Configured Webhooks</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Product Events:</span>
                    <span className="ml-2 text-green-600">{webhookStatus.summary.product_events}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Order Events:</span>
                    <span className="ml-2 text-green-600">{webhookStatus.summary.order_events}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">App Events:</span>
                    <span className="ml-2 text-green-600">{webhookStatus.summary.app_events}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Other Events:</span>
                    <span className="ml-2 text-green-600">{webhookStatus.summary.other_events + webhookStatus.summary.category_events}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
