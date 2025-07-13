"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Filter, Eye, EyeOff, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { useState, useMemo, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { formatPrice, numberToWords } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Color palette for the pie chart
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#14b8a6', '#fbbf24', '#f43f5e', '#a855f7', '#0ea5e9'
];

export function StockAnalytics({ onLoaded }: { onLoaded?: () => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyWithStock, setShowOnlyWithStock] = useState(true)
  const [minStockThreshold, setMinStockThreshold] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  const stockData = useQuery(api.products.getStockAnalytics)

  useEffect(() => {
    if (stockData && onLoaded) {
      onLoaded()
    }
  }, [stockData, onLoaded])

  // Filter and process data based on user selections
  const filteredData = useMemo(() => {
    if (!stockData?.stockData) return []

    return stockData.stockData.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase())

      // Stock threshold filter
      const meetsThreshold = product.stock >= minStockThreshold

      // Show only with stock filter
      const hasStock = !showOnlyWithStock || product.stock > 0

      return matchesSearch && meetsThreshold && hasStock
    })
  }, [stockData?.stockData, searchTerm, showOnlyWithStock, minStockThreshold])

  // Prepare data for pie chart (top 10 products + "Others")
  const chartData = useMemo(() => {
    if (!filteredData.length) return []

    const topProducts = filteredData.slice(0, 10)
    const otherProducts = filteredData.slice(10)

    const chartItems = topProducts.map((product, index) => ({
      name: product.name,
      value: product.stock,
      percentage: product.percentage,
      sku: product.sku,
      color: COLORS[index % COLORS.length],
      productId: product.productId,
    }))

    // Add "Others" category if there are more than 10 products
    if (otherProducts.length > 0) {
      const othersStock = otherProducts.reduce((sum, product) => sum + product.stock, 0)
      const othersPercentage = otherProducts.reduce((sum, product) => sum + product.percentage, 0)

      chartItems.push({
        name: `Others (${otherProducts.length} products)`,
        value: othersStock,
        percentage: othersPercentage,
        sku: 'OTHERS',
        color: '#94a3b8',
        productId: 'others',
      })
    }

    return chartItems
  }, [filteredData])

  // Toggle product selection for chart
  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts)
    if (newSelection.has(productId)) {
      newSelection.delete(productId)
    } else {
      newSelection.add(productId)
    }
    setSelectedProducts(newSelection)
  }

  // Get visible chart data (only selected products)
  const visibleChartData = useMemo(() => {
    if (selectedProducts.size === 0) return chartData // Show all if none selected
    return chartData.filter(item => selectedProducts.has(item.productId))
  }, [chartData, selectedProducts])

  if (!stockData) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Stock Analytics</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading stock data...
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header and Summary Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle>Stock Analytics</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Inventory distribution and stock value analysis across all products
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Total Stock</div>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="text-2xl font-bold text-blue-700 cursor-help">
                      {stockData.totalStock.toLocaleString()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{numberToWords(stockData.totalStock)} units</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Stock Value</div>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="text-2xl font-bold text-green-700 cursor-help">
                      {formatPrice(stockData.totalStockValue)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{numberToWords(stockData.totalStockValue)}</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Products with Stock</div>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="text-2xl font-bold text-purple-700 cursor-help">
                      {stockData.productsWithStock}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{numberToWords(stockData.productsWithStock)} products</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Out of Stock</div>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <div className="text-2xl font-bold text-orange-700 cursor-help">
                      {stockData.productsWithoutStock}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{numberToWords(stockData.productsWithoutStock)} products</p>
                  </TooltipContent>
                </UITooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search Products</label>
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Minimum Stock</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minStockThreshold}
                  onChange={(e) => setMinStockThreshold(Number(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant={showOnlyWithStock ? "default" : "outline"}
                  onClick={() => setShowOnlyWithStock(!showOnlyWithStock)}
                  className="w-full"
                >
                  {showOnlyWithStock ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Only With Stock
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Show All Products
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <CardTitle>Product Selection</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts(new Set())}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts(new Set())}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Select products to include in the chart. Leave empty to show all.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {filteredData.map((product) => (
                <div
                  key={product.productId}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedProducts.has(product.productId) || selectedProducts.size === 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200 opacity-50"
                  )}
                  onClick={() => toggleProductSelection(product.productId)}
                >
                  <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product.name}</div>
                    <div className="text-xs text-gray-500 truncate">{product.sku}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {product.stock} units
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Inventory Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Stock distribution across selected products
            </p>
          </CardHeader>
          <CardContent>
            {visibleChartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visibleChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {visibleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-blue-600 font-semibold">
                                Stock: {data.value.toLocaleString()}
                              </p>
                              <p className="text-green-600 font-semibold">
                                Percentage: {data.percentage.toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                SKU: {data.sku}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Package className="h-16 w-16 text-gray-300 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-500">No Data to Display</h3>
                    <p className="text-sm text-gray-400 max-w-md">
                      No products match the current filters. Try adjusting your search criteria or stock threshold.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Stock List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Stock Value Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData.slice(0, 20).map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{product.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold">{product.stock.toLocaleString()} units</div>
                    <div className="text-xs text-muted-foreground">{product.percentage.toFixed(1)}%</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-green-600">
                      {formatPrice(product.stockValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.costValue > 0 ? `Cost: ${formatPrice(product.costValue)}` : 'No cost data'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
