"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp, Award, DollarSign, BarChart3, Package, Target, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { useState, useMemo, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts"
import { format } from "date-fns"
import { formatPrice, numberToWords } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ProductPerformanceAnalytics({ onLoaded }: { onLoaded?: () => void }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const salesRanking = useQuery(api.products.getProductSalesRanking)
  const selectedProductData = useQuery(
    api.products.getProductPerformanceData,
    selectedProductId ? { productId: selectedProductId } : "skip"
  )

  // Auto-select the first product (top performer) when data loads
  useEffect(() => {
    if (salesRanking && salesRanking.length > 0 && !selectedProductId) {
      setSelectedProductId(salesRanking[0].productId)
    }
  }, [salesRanking, selectedProductId])

  // Call onLoaded when both salesRanking and selectedProductData are loaded
  useEffect(() => {
    if (salesRanking && selectedProductData && onLoaded) {
      onLoaded()
    }
  }, [salesRanking, selectedProductData, onLoaded])

  const chartData = useMemo(() => {
    if (!selectedProductData?.dailySales) return []

    return selectedProductData.dailySales.map((item) => ({
      ...item,
      formattedDate: format(new Date(item.date), 'MMM dd'),
      revenueFormatted: formatPrice(item.revenue)
    }))
  }, [selectedProductData])

  if (!salesRanking) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Product Performance Analytics</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading sales data for the last 6 months...
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

  if (salesRanking.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Product Performance Analytics</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            No sales data available for the last 6 months.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">No Sales Data</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No products were sold in the last 6 months. This chart will show the most popular products once sales data is available.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Product Selection Chart */}
        <Card className="h-full flex flex-col" data-testid="product-performance-selection">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Product Performance Analytics</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Select a product to view detailed performance analytics. Top selling products over the last 6 months (non-cancelled orders).
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="space-y-3 overflow-y-auto flex-1" data-testid="product-ranking-list">
              {salesRanking.map((product, index) => (
                <div
                  key={product.productId}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                    selectedProductId === product.productId
                      ? "bg-blue-50 border-blue-200 ring-2 ring-blue-200" :
                    index === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:from-yellow-100 hover:to-orange-100" :
                    index === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:from-gray-100 hover:to-slate-100" :
                    index === 2 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:from-amber-100 hover:to-yellow-100" :
                    "bg-white border-gray-100 hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedProductId(product.productId)}
                  data-testid={`product-rank-${index + 1}`}
                >
                  {/* Rank */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                    selectedProductId === product.productId ? "bg-blue-500 text-white" :
                    index === 0 ? "bg-yellow-500 text-white" :
                    index === 1 ? "bg-gray-400 text-white" :
                    index === 2 ? "bg-amber-600 text-white" :
                    "bg-gray-200 text-gray-700"
                  )}>
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "w-full h-full flex items-center justify-center bg-gray-200",
                      product.images && product.images.length > 0 ? "hidden" : ""
                    )}>
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{product.sku}</p>
                  </div>

                  {/* Sales Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      {product.quantitySold}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(product.revenue)}
                    </div>
                  </div>

                  {/* Award Icon for Top 3 */}
                  {index < 3 && (
                    <div className="flex-shrink-0">
                      <Award className={cn(
                        "h-5 w-5",
                        selectedProductId === product.productId ? "text-blue-500" :
                        index === 0 ? "text-yellow-500" :
                        index === 1 ? "text-gray-400" :
                        "text-amber-600"
                      )} />
                    </div>
                  )}
                </div>
              ))}
            </div>

                         {/* Summary Stats */}
             <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0" data-testid="product-performance-summary">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                 <div data-testid="products-sold-count">
                   <div className="text-lg font-bold text-gray-900">
                     {salesRanking.length}
                   </div>
                   <div className="text-xs text-muted-foreground">Products Sold</div>
                 </div>
                 <div data-testid="total-units-sold">
                   <div className="text-lg font-bold text-green-600">
                     {salesRanking.reduce((sum, p) => sum + p.quantitySold, 0)}
                   </div>
                   <div className="text-xs text-muted-foreground">Total Units</div>
                 </div>
                 <div data-testid="total-revenue">
                   <div className="text-lg font-bold text-blue-600">
                     {formatPrice(salesRanking.reduce((sum, p) => sum + p.revenue, 0))}
                   </div>
                   <div className="text-xs text-muted-foreground">Total Revenue</div>
                 </div>
                 <div data-testid="total-stock">
                   <div className="text-lg font-bold text-indigo-600">
                     {salesRanking.reduce((sum, p) => sum + (p.stock || 0), 0)}
                   </div>
                   <div className="text-xs text-muted-foreground">Total Stock</div>
                 </div>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Selected Product Performance Details */}
        {selectedProductId && selectedProductData && (
          <Card className="h-full flex flex-col" data-testid="product-detail-analysis">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle>{selectedProductData.product.name} - Performance Analytics</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Detailed performance data for the last 30 days
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg" data-testid="product-info-card">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedProductData.product.images && selectedProductData.product.images.length > 0 ? (
                    <img
                      src={selectedProductData.product.images[0]}
                      alt={selectedProductData.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedProductData.product.name}</h3>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProductData.product.sku}</p>
                                     <div className="flex items-center gap-4 mt-2">
                     <div className="flex items-center gap-1">
                       <DollarSign className="h-4 w-4 text-green-600" />
                       <span className="text-sm font-medium">Price: {formatPrice(selectedProductData.product.price)}</span>
                     </div>
                     {selectedProductData.product.cost > 0 && (
                       <div className="flex items-center gap-1">
                         <Package className="h-4 w-4 text-orange-600" />
                         <span className="text-sm font-medium">Cost: {formatPrice(selectedProductData.product.cost)}</span>
                       </div>
                     )}
                     <div className="flex items-center gap-1">
                       <Package className="h-4 w-4 text-blue-600" />
                       <span className="text-sm font-medium">Stock: {selectedProductData.product.stock}</span>
                     </div>
                   </div>
                </div>
              </div>

                             {/* Performance Metrics */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="product-performance-metrics">
                 <div className="bg-blue-50 p-4 rounded-lg" data-testid="total-units-sold-metric">
                   <div className="text-sm text-blue-600 font-medium">Total Units Sold</div>
                   <UITooltip>
                     <TooltipTrigger asChild>
                       <div className="text-2xl font-bold text-blue-700 cursor-help">
                         {selectedProductData.summary.totalQuantity}
                       </div>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>{numberToWords(selectedProductData.summary.totalQuantity)} units</p>
                     </TooltipContent>
                   </UITooltip>
                 </div>
                 <div className="bg-green-50 p-4 rounded-lg" data-testid="total-revenue-metric">
                   <div className="text-sm text-green-600 font-medium">Total Revenue</div>
                   <UITooltip>
                     <TooltipTrigger asChild>
                       <div className="text-2xl font-bold text-green-700 cursor-help">
                         {formatPrice(selectedProductData.summary.totalRevenue)}
                       </div>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>{numberToWords(selectedProductData.summary.totalRevenue)}</p>
                     </TooltipContent>
                   </UITooltip>
                 </div>
                 <div className="bg-purple-50 p-4 rounded-lg" data-testid="total-orders-metric">
                   <div className="text-sm text-purple-600 font-medium">Total Orders</div>
                   <UITooltip>
                     <TooltipTrigger asChild>
                       <div className="text-2xl font-bold text-purple-700 cursor-help">
                         {selectedProductData.summary.totalOrders}
                       </div>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>{numberToWords(selectedProductData.summary.totalOrders)} orders</p>
                     </TooltipContent>
                   </UITooltip>
                 </div>
                 <div className="bg-orange-50 p-4 rounded-lg" data-testid="average-price-metric">
                   <div className="text-sm text-orange-600 font-medium">Average Price</div>
                   <UITooltip>
                     <TooltipTrigger asChild>
                       <div className="text-2xl font-bold text-orange-700 cursor-help">
                         {formatPrice(selectedProductData.summary.averagePrice)}
                       </div>
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>{numberToWords(selectedProductData.summary.averagePrice)}</p>
                     </TooltipContent>
                   </UITooltip>
                 </div>
               </div>

               {/* Stock Analysis & Demand Insights */}
               <div className="space-y-4" data-testid="stock-analysis-section">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                   <Package className="h-5 w-5 text-blue-600" />
                   Stock Analysis & Demand Insights
                 </h3>

                 {/* Stock Status Alert */}
                 <div className={cn(
                   "p-4 rounded-lg border-l-4",
                   selectedProductData.stockAnalysis.stockStatus === 'low' ? "bg-red-50 border-red-400" :
                   selectedProductData.stockAnalysis.stockStatus === 'high' ? "bg-yellow-50 border-yellow-400" :
                   "bg-green-50 border-green-400"
                 )} data-testid="stock-status-alert">
                   <div className="flex items-start gap-3">
                     {selectedProductData.stockAnalysis.stockStatus === 'low' ? (
                       <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                     ) : selectedProductData.stockAnalysis.stockStatus === 'high' ? (
                       <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                     ) : (
                       <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                     )}
                     <div className="flex-1">
                       <h4 className="font-medium text-sm">
                         {selectedProductData.stockAnalysis.stockStatus === 'low' ? 'Low Stock Alert' :
                          selectedProductData.stockAnalysis.stockStatus === 'high' ? 'High Stock Warning' :
                          'Optimal Stock Level'}
                       </h4>
                       <p className="text-sm text-gray-600 mt-1">
                         {selectedProductData.stockAnalysis.stockRecommendation}
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Stock Metrics Grid */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stock-metrics-grid">
                   <div className="bg-indigo-50 p-4 rounded-lg" data-testid="current-stock-metric">
                     <div className="text-sm text-indigo-600 font-medium">Current Stock</div>
                     <UITooltip>
                       <TooltipTrigger asChild>
                         <div className="text-xl font-bold text-indigo-700 cursor-help">
                           {selectedProductData.stockAnalysis.currentStock}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>{numberToWords(selectedProductData.stockAnalysis.currentStock)} units in stock</p>
                       </TooltipContent>
                     </UITooltip>
                   </div>
                   <div className="bg-emerald-50 p-4 rounded-lg" data-testid="sell-rate-metric">
                     <div className="text-sm text-emerald-600 font-medium">Sell Rate (7 days)</div>
                     <UITooltip>
                       <TooltipTrigger asChild>
                         <div className="text-xl font-bold text-emerald-700 cursor-help">
                           {selectedProductData.stockAnalysis.sellRatePerDay.toFixed(1)}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>{numberToWords(selectedProductData.stockAnalysis.sellRatePerDay)} units per day</p>
                       </TooltipContent>
                     </UITooltip>
                   </div>
                   <div className="bg-amber-50 p-4 rounded-lg" data-testid="days-of-stock-left-metric">
                     <div className="text-sm text-amber-600 font-medium">Days of Stock Left</div>
                     <UITooltip>
                       <TooltipTrigger asChild>
                         <div className="text-xl font-bold text-amber-700 cursor-help">
                           {selectedProductData.stockAnalysis.daysOfStockRemaining.toFixed(1)}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>{numberToWords(selectedProductData.stockAnalysis.daysOfStockRemaining)} days remaining</p>
                       </TooltipContent>
                     </UITooltip>
                   </div>
                   <div className="bg-rose-50 p-4 rounded-lg" data-testid="stock-efficiency-metric">
                     <div className="text-sm text-rose-600 font-medium">Stock Efficiency</div>
                     <UITooltip>
                       <TooltipTrigger asChild>
                         <div className="text-xl font-bold text-rose-700 cursor-help">
                           {selectedProductData.stockAnalysis.stockEfficiency.toFixed(1)}%
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Efficiency: {selectedProductData.stockAnalysis.stockEfficiency.toFixed(1)}%</p>
                       </TooltipContent>
                     </UITooltip>
                   </div>
                 </div>

                 {/* Demand Analysis */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="demand-analysis">
                   <div className="bg-slate-50 p-4 rounded-lg" data-testid="demand-score">
                     <div className="text-sm text-slate-600 font-medium">Demand Score</div>
                     <UITooltip>
                       <TooltipTrigger asChild>
                         <div className="text-lg font-semibold cursor-help">
                           {formatPrice(selectedProductData.stockAnalysis.demandScore)}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Daily revenue potential: {numberToWords(selectedProductData.stockAnalysis.demandScore)}</p>
                       </TooltipContent>
                     </UITooltip>
                     <p className="text-xs text-slate-500 mt-1">
                       Daily revenue potential based on current sell rate
                     </p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg" data-testid="stock-turnover-rate">
                     <div className="text-sm text-slate-600 font-medium">Stock Turnover Rate</div>
                     <UITooltip>
                       <TooltipTrigger asChild>
                         <div className="text-lg font-semibold cursor-help">
                           {selectedProductData.stockAnalysis.stockTurnoverRate.toFixed(2)}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Turnover rate: {selectedProductData.stockAnalysis.stockTurnoverRate.toFixed(2)}</p>
                       </TooltipContent>
                     </UITooltip>
                     <p className="text-xs text-slate-500 mt-1">
                       How quickly stock is sold (6-month average)
                     </p>
                   </div>
                 </div>
               </div>

              {/* Daily Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="daily-performance-charts">
                {/* Revenue Chart */}
                <Card data-testid="daily-revenue-chart">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Daily Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 'dataMax + 10%']}
                            tickFormatter={(value) => {
                              if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`
                              } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`
                              }
                              return formatPrice(value)
                            }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const revenue = payload[0].value as number
                                return (
                                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                    <p className="font-medium">{label}</p>
                                    <p className="text-green-600 font-semibold">
                                      Revenue: {formatPrice(revenue)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {numberToWords(revenue)}
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Quantity Chart */}
                <Card data-testid="daily-quantity-chart">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Daily Units Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 'dataMax + 1']}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const quantity = payload[0].value as number
                                return (
                                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                    <p className="font-medium">{label}</p>
                                    <p className="text-blue-600 font-semibold">
                                      Units: {quantity}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {numberToWords(quantity)} units
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar
                            dataKey="quantity"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="additional-metrics">
                <div className="bg-gray-50 p-4 rounded-lg" data-testid="peak-daily-revenue">
                  <div className="text-sm text-gray-600 font-medium">Peak Daily Revenue</div>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="text-lg font-semibold cursor-help">
                        {formatPrice(selectedProductData.summary.maxDailyRevenue)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{numberToWords(selectedProductData.summary.maxDailyRevenue)}</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg" data-testid="peak-daily-units">
                  <div className="text-sm text-gray-600 font-medium">Peak Daily Units</div>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="text-lg font-semibold cursor-help">
                        {selectedProductData.summary.maxDailyQuantity}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{numberToWords(selectedProductData.summary.maxDailyQuantity)} units</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg" data-testid="average-daily-revenue">
                  <div className="text-sm text-gray-600 font-medium">Average Daily Revenue</div>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="text-lg font-semibold cursor-help">
                        {formatPrice(selectedProductData.summary.averageDailyRevenue)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{numberToWords(selectedProductData.summary.averageDailyRevenue)}</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
