"use client"

import { memo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  User,
  CreditCard,
  MapPin,
  Package,
  Receipt,
  FileText,
  Calendar,
  Phone,
  Mail,
  Building,
  Truck,
  DollarSign,
  Tag,
  ShoppingCart,
  Share2,
  ExternalLink,
  Search,
  Check
} from "lucide-react"
import { format } from "date-fns"
import type { Order } from "@/components/orders-page-content"
import { capitalizeFirstLetter } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ShippingAddressMap } from "@/components/shipping-address-map"

interface OrderDetailsInlineProps {
  order: Order | null
  showShareAndOpenButtons?: boolean
  onOpenTiendaNubeCustomer?: () => void
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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

export const OrderDetailsInline = memo(function OrderDetailsInline({ order, showShareAndOpenButtons, onOpenTiendaNubeCustomer }: OrderDetailsInlineProps) {
  const [productsOpen, setProductsOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  if (!order) return null

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const handleSearchCustomer = useCallback(() => {
    // Only include real, non-empty fields
    const nameParts = order.customer.name
      ? order.customer.name.split(' ').filter(part => part.length > 0)
      : [];
    const searchParts = [
      ...nameParts,
      order.customer.email,
      order.customer.phone
    ].filter(part => part && part !== 'Phone not available' && part !== 'N/A' && part !== 'null' && part !== 'undefined');

    // Navigate to orders page with search parameter
    if (searchParts.length > 0) {
      const searchQuery = searchParts.join(', ');
      router.push(`/orders?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/orders');
    }
  }, [order.customer, router]);

  const handleOpenTiendaNubeAdmin = useCallback(() => {
    if (order.providerOrderId) {
      const tiendanubeAdminUrl = process.env.NEXT_PUBLIC_TIENDANUBE_ADMIN_DASHBOARD || "https://timefliesdemo.mitiendanube.com/admin/v2";
      const orderUrl = `${tiendanubeAdminUrl}/orders/${order.providerOrderId}`;
      window.open(orderUrl, "_blank");
    }
  }, [order]);

  const subtotal = order.products.reduce((sum, product) => sum + product.price * product.quantity, 0)
  const totalItems = order.products.reduce((sum, product) => sum + product.quantity, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <span className="text-lg font-semibold">Order Details - {order.orderNumber}</span>
            <Badge className={statusColors[order.orderStatus]}>{capitalizeFirstLetter(order.orderStatus)}</Badge>
          </div>
          {showShareAndOpenButtons && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Share'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearchCustomer}
                className="flex items-center gap-2"
              >
                <Search className="h-3 w-3" />
                Search Customer
              </Button>
              {order.providerOrderId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenTiendaNubeAdmin}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  View in TiendaNube
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Placed on {format(new Date(order.orderDate), "dd 'of' MMMM, yyyy 'at' h:mm a")}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span> {order.customer.name}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span> {order.customer.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span> {order.customer.phone}
              </div>
              {onOpenTiendaNubeCustomer && order.customer?.id && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenTiendaNubeCustomer}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View in TiendaNube
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge className={statusColors[order.paymentStatus]}>{capitalizeFirstLetter(order.paymentStatus)}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Method:</span> {paymentMethodLabels[order.paymentMethod]}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Amount:</span> ${order.totalAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingAddressMap address={order.shippingAddress} />
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge className={statusColors[order.shippingStatus]}>{capitalizeFirstLetter(order.shippingStatus)}</Badge>
              </div>
              {order.shippingInfo && (
                <>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Customer Cost:</span>
                    <span>${order.shippingInfo.consumer_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Merchant Cost:</span>
                    <span>${order.shippingInfo.merchant_cost.toFixed(2)}</span>
                  </div>
                </>
              )}
              {!order.shippingInfo && (
                <div className="text-sm text-muted-foreground">
                  No shipping cost information available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products - Collapsible */}
        <Card>
          <CardHeader>
            <Accordion type="single" collapsible>
              <AccordionItem value="products" className="border-none">
                <AccordionTrigger
                  className="p-0 hover:no-underline"
                  isOpen={productsOpen}
                  onClick={() => setProductsOpen(!productsOpen)}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <span className="text-lg font-semibold">Products ({totalItems} items)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent isOpen={productsOpen}>
                  <div className="space-y-4 pt-4">
                    {order.products.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            {product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Tag className="h-3 w-3" />
                            {product.category}
                          </p>
                          <p className="text-sm flex items-center gap-2">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            Quantity: {product.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(product.price * product.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">${product.price} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardHeader>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  Subtotal ({totalItems} items):
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  Shipping:
                </span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Tax:
                </span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Discount:
                  </span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total:
                </span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                {order.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
})
