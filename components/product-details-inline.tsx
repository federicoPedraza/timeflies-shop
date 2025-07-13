"use client"

import { memo, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Share2, AlertTriangle, Package, Search, Check, Copy } from "lucide-react"
import { format } from "date-fns"
import type { Product } from "@/components/products-page-content"
import { ProductImages } from "./product-images"
import { formatPrice, numberToWords } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ProductDetailsInlineProps {
  product: Product
  showShareAndOpenButtons?: boolean
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  discontinued: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export const ProductDetailsInline = memo(function ProductDetailsInline({ product, showShareAndOpenButtons = false }: ProductDetailsInlineProps) {
  const [copied, setCopied] = useState(false)
  const [productIdCopied, setProductIdCopied] = useState(false)
  const router = useRouter()
  const isLowStock = product.stockQuantity <= product.lowStockThreshold
  const isOutOfStock = product.stockQuantity === 0

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const handleInspect = useCallback(() => {
    if (product?.id) {
      router.push(`/products/${product.id}`)
    }
  }, [product?.id, router])

  const handleOpenTiendaNubeAdmin = useCallback(() => {
    if (product?.providerProductId) {
      const tiendanubeAdminUrl = process.env.NEXT_PUBLIC_TIENDANUBE_ADMIN_DASHBOARD || "https://timefliesdemo.mitiendanube.com/admin/v2";
      const productUrl = `${tiendanubeAdminUrl}/products/${product.providerProductId}`;
      window.open(productUrl, "_blank");
    }
  }, [product]);

  const handleOpenShop = useCallback(() => {
    if (product?.handle) {
      const shopUrl = `https://timefliesdemo.mitiendanube.com/productos/${product.handle}`;
      window.open(shopUrl, "_blank");
    }
  }, [product]);

  const handleCopyProductId = useCallback(() => {
    navigator.clipboard.writeText(product.providerProductId);
    setProductIdCopied(true);
    setTimeout(() => setProductIdCopied(false), 1500);
  }, [product.providerProductId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                {isLowStock && !isOutOfStock && (
                  <AlertTriangle className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                )}
                {isOutOfStock && (
                  <AlertTriangle className="absolute -top-1 -right-1 h-4 w-4 text-red-500" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {product.name}
                  <Badge className={statusColors[product.status]}>{product.status}</Badge>
                </CardTitle>
                <CardDescription>SKU: {product.sku}</CardDescription>
              </div>
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
                  variant="default"
                  size="sm"
                  onClick={handleInspect}
                  className="flex items-center gap-2 bg-black text-white"
                >
                  <Search className="h-3 w-3" />
                  Inspect
                </Button>
                {product.providerProductId && (
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
                {product.handle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenShop}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View in shop
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h4 className="font-semibold">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{product.category} / {product.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span>{product.brand}</span>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Product ID:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={handleCopyProductId}
                        >
                          {productIdCopied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              {product.providerProductId}
                            </>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          {productIdCopied ? "Product ID copied to clipboard!" : "Click to copy Product ID"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h4 className="font-semibold">Pricing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium cursor-help">
                          {product.price === 0 ? formatPrice(product.price) : `$${formatPrice(product.price)}`}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          {product.price === 0
                            ? "Price to be determined by manufacturer"
                            : numberToWords(product.price)
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {product.compareAtPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compare At:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-through text-muted-foreground cursor-help">
                            ${formatPrice(product.compareAtPrice)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{numberToWords(product.compareAtPrice)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {product.costPrice === 0 ? formatPrice(product.costPrice) : `$${formatPrice(product.costPrice)}`}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          {product.costPrice === 0
                            ? "Cost to be determined by manufacturer"
                            : numberToWords(product.costPrice)
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit Margin:</span>
                  <span className={product.price === 0 || product.costPrice === 0 ? "text-gray-500" : product.profitMargin > 50 ? "text-green-600" : "text-yellow-600"}>
                    {product.price === 0 || product.costPrice === 0 ? "TBD" : `${product.profitMargin.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-3">
              <h4 className="font-semibold">Inventory</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-medium">{product.stockQuantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock Threshold:</span>
                  <span>{product.lowStockThreshold} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={
                      isOutOfStock
                        ? "bg-red-100 text-red-800"
                        : isLowStock
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }
                  >
                    {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className={product.weight === 999 ? "text-gray-500" : ""}>
                    {product.weight === 999 ? "TBD" : `${product.weight} kg`}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                {(product.price > 0 && product.costPrice > 0) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit per Unit:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium cursor-help">
                            ${formatPrice(product.price - product.costPrice)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {numberToWords(product.price - product.costPrice)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {product.price > 0 && product.stockQuantity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Revenue:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium cursor-help">
                            ${formatPrice(product.price * product.stockQuantity)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {numberToWords(product.price * product.stockQuantity)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                {product.costPrice > 0 && product.stockQuantity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inventory Value:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium cursor-help">
                            ${formatPrice(product.costPrice * product.stockQuantity)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {numberToWords(product.costPrice * product.stockQuantity)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description and Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* SEO Information */}
            {(product.seo_title || product.seo_description) && (
              <div>
                <h4 className="font-semibold mb-2">SEO Information</h4>
                <div className="space-y-2 text-sm">
                  {product.seo_title && (
                    <div>
                      <span className="text-muted-foreground">SEO Title:</span>
                      <p className="font-medium">{product.seo_title}</p>
                    </div>
                  )}
                  {product.seo_description && (
                    <div>
                      <span className="text-muted-foreground">SEO Description:</span>
                      <p className="font-medium">{product.seo_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* Product Status Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Published:</span>
                <Badge variant={product.published ? "default" : "secondary"}>
                  {product.published ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Free Shipping:</span>
                <Badge variant={product.free_shipping ? "default" : "secondary"}>
                  {product.free_shipping ? "Yes" : "No"}
                </Badge>
              </div>
              {product.video_url && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Video URL:</span>
                  <a
                    href={product.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Video
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <ProductImages
        productId={parseInt(product.providerProductId)}
        productName={product.name}
      />
    </div>
  )
})
