"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Package, Grid3X3, List, SortAsc, Eye, Edit, Trash2, MoreHorizontal, AlertTriangle, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react"
import type { Product } from "./products-page-content"
import { formatPrice, numberToWords } from "@/lib/utils"

interface ProductsDataTableProps {
  products: Product[]
  onViewProduct: (product: Product) => void
  onInspectedProductChange: (product: Product | null) => void
  filtersComponent?: React.ReactNode
  collapseOnProductInspect?: boolean
  productSalesStats?: Record<string, number>
}

type ViewMode = "grid" | "list"
type SortOption = "name" | "price" | "stock" | "created" | "updated"

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  discontinued: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function ProductsDataTable({
  products,
  onViewProduct,
  onInspectedProductChange,
  filtersComponent,
  collapseOnProductInspect = false,
  productSalesStats,
}: ProductsDataTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Find the productId with the highest sales
  const bestSellerProductId = useMemo(() => {
    if (!productSalesStats) return null;
    let maxSales = -1;
    let bestId: string | null = null;
    for (const [id, qty] of Object.entries(productSalesStats)) {
      if (qty > maxSales) {
        maxSales = qty;
        bestId = id;
      }
    }
    return bestId;
  }, [productSalesStats]);

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800", icon: AlertTriangle }
    if (product.stockQuantity <= product.lowStockThreshold)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    return { label: "In Stock", color: "bg-green-100 text-green-800", icon: Package }
  }

  const getProfitMargin = (product: Product) => {
    return ((product.price - product.costPrice) / product.price) * 100
  }

  const getProductBadges = (product: Product) => {
    const badges = []
    const profitMargin = getProfitMargin(product)

    if (profitMargin > 60) badges.push({ label: "High Margin", color: "bg-green-500 text-white" })
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      badges.push({ label: "On Sale", color: "bg-red-500 text-white" })
    }
    // Best Seller by sales
    if (
      bestSellerProductId &&
      product.providerProductId === bestSellerProductId
    ) {
      badges.push({ label: "Best Seller", color: "bg-blue-500 text-white" })
    }
    // Too Much Stock
    if (product.stockQuantity > 50) {
      badges.push({ label: "Too Much Stock", color: "bg-yellow-500 text-white" })
    }
    return badges
  }

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "price":
        aValue = a.price
        bValue = b.price
        break
      case "stock":
        aValue = a.stockQuantity
        bValue = b.stockQuantity
        break
      case "created":
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case "updated":
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      {filtersComponent && !collapseOnProductInspect && (
        <div className="space-y-4">
          {filtersComponent}
        </div>
      )}

      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products Collection ({products.length})
              </CardTitle>
              <CardDescription>Discover and manage your exclusive timepiece collection</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Products Display */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const profitMargin = getProfitMargin(product)
            const badges = getProductBadges(product)
            const StockIcon = stockStatus.icon

            return (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer"
                onClick={() => onInspectedProductChange(product)}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={statusColors[product.status]}>{product.status}</Badge>
                  </div>

                  {/* Product Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {badges.slice(0, 2).map((badge, index) => (
                      <Badge key={index} className={badge.color}>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>

                  {/* TiendaNube Link Button */}
                  {product.handle && (
                    <div className="absolute bottom-3 right-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://timefliesdemo.mitiendanube.com/productos/${product.handle}`, '_blank')
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View in Shop</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.subcategory}
                    </Badge>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-2xl font-bold text-primary cursor-help">
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
                      {product.compareAtPrice && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-muted-foreground line-through cursor-help">
                                ${formatPrice(product.compareAtPrice)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{numberToWords(product.compareAtPrice)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Profit: {product.price === 0 || product.costPrice === 0 ? "TBD" : `${profitMargin.toFixed(1)}%`}</span>
                      <span>Cost: {product.costPrice === 0 ? formatPrice(product.costPrice) : `$${formatPrice(product.costPrice)}`}</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StockIcon className="h-4 w-4" />
                      <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                    </div>
                    <span className="text-sm font-medium">{product.stockQuantity} units</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {sortedProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const profitMargin = getProfitMargin(product)
            const badges = getProductBadges(product)
            const StockIcon = stockStatus.icon

            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onInspectedProductChange(product)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className={`${statusColors[product.status]} text-xs`}>
                          {product.status}
                        </Badge>
                      </div>

                      {/* TiendaNube Link Button */}
                      {product.handle && (
                        <div className="absolute bottom-2 right-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(`https://timefliesdemo.mitiendanube.com/productos/${product.handle}`, '_blank')
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View on TiendaNube</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <p className="text-muted-foreground">
                            {product.brand} • {product.sku}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{product.category}</Badge>
                        <Badge variant="outline">{product.subcategory}</Badge>
                        {badges.map((badge, index) => (
                          <Badge key={index} className={badge.color}>
                            {badge.label}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-2xl font-bold text-primary cursor-help">
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
                              {product.compareAtPrice && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-sm text-muted-foreground line-through cursor-help">
                                        ${formatPrice(product.compareAtPrice)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-sm">{numberToWords(product.compareAtPrice)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Profit: {product.price === 0 || product.costPrice === 0 ? "TBD" : `${profitMargin.toFixed(1)}%`} • Cost: {product.costPrice === 0 ? formatPrice(product.costPrice) : `$${formatPrice(product.costPrice)}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StockIcon className="h-4 w-4" />
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                            <span className="text-sm font-medium">{product.stockQuantity} units</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {products.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or add some products to get started.</p>
        </Card>
      )}
    </div>
  )
}
