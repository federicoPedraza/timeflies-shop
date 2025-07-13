"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useMemo, useState } from "react"
import { DollarSign, TrendingUp, BarChart3, Calendar, Package } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { cn, formatPrice, numberToWords } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"

interface RevenueData {
  date: string
  revenue: number
  potentialRevenue: number
  orders: number
  products: Array<{
    productId: string
    name: string
    sku: string
    quantity: number
    revenue: number
    price: number
  }>
}

const CHART_TYPES = [
  { key: "daily", label: "Daily Revenue", icon: Calendar },
  { key: "products", label: "Top Products", icon: Package },
  { key: "trends", label: "Revenue Trends", icon: TrendingUp },
]

export function InventoryRevenueChart() {
  // Use backend analytics only
  const dailyRevenueData = useQuery(api.orders.getDailyRevenueData, { days: 7 })
  const dailyPotentialRevenueData = useQuery(api.orders.getDailyPotentialRevenueData, { days: 7 })
  const salesRanking = useQuery(api.products.getProductSalesRanking)
  const router = useRouter()
  type ChartType = 'daily' | 'products';
  const [activeChartType, setActiveChartType] = useState<ChartType>("daily")

  // Compute trends from daily data
  const revenueTrends = useMemo(() => {
    if (!dailyRevenueData || dailyRevenueData.length < 7) return null
    const last7Days = dailyRevenueData.slice(-7)
    const previous7Days = dailyRevenueData.slice(-14, -7)
    const currentAvg = last7Days.reduce((sum, day) => sum + day.revenue, 0) / 7
    const previousAvg = previous7Days.length === 7 ? previous7Days.reduce((sum, day) => sum + day.revenue, 0) / 7 : 0
    const change = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0
    return {
      currentAvg,
      previousAvg,
      change,
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable'
    }
  }, [dailyRevenueData])

  // Combine daily revenue and potential revenue data
  const dailyAnalytics = useMemo(() => {
    if (!dailyRevenueData || !dailyPotentialRevenueData) return []

    // Create a map of potential revenue by date
    const potentialRevenueMap = new Map(
      dailyPotentialRevenueData.map(item => [item.date, item.potentialRevenue])
    )

    // Combine the data
    return dailyRevenueData.map(day => ({
      ...day,
      potentialRevenue: potentialRevenueMap.get(day.date) || 0,
      orders: null,
      productsSold: null
    }))
  }, [dailyRevenueData, dailyPotentialRevenueData])

  // Top products from backend
  const topProducts = useMemo(() => {
    if (!salesRanking) return []
    return salesRanking
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(product => ({
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        revenue: product.revenue,
        quantity: product.quantitySold,
        price: product.price
      }))
  }, [salesRanking])

  if (!dailyRevenueData || !dailyPotentialRevenueData || !salesRanking) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Inventory Revenue Chart</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/analytics#profits')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading revenue data...
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

  // Totals
  const totalRevenue = dailyRevenueData.reduce((sum, day) => sum + day.revenue, 0)
  const totalPotentialRevenue = dailyPotentialRevenueData.reduce((sum, day) => sum + day.potentialRevenue, 0)
  const averageRevenue = dailyRevenueData.length > 0 ? totalRevenue / dailyRevenueData.length : 0
  const averagePotentialRevenue = dailyPotentialRevenueData.length > 0 ? totalPotentialRevenue / dailyPotentialRevenueData.length : 0

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Inventory Revenue Chart</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Daily revenue vs potential revenue over the last 7 days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/analytics#profits')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Chart Type Selector */}
            <div className="flex items-center justify-end gap-2 mt-4 flex-shrink-0">
              {[{ key: "daily", label: "Daily Revenue", icon: Calendar }, { key: "products", label: "Top Products", icon: Package }].map((chartType) => {
                const Icon = chartType.icon
                return (
                  <button
                    key={chartType.key}
                    onClick={() => setActiveChartType(chartType.key as ChartType)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border border-gray-300 transition-opacity",
                      activeChartType === chartType.key ? "bg-black text-white opacity-90" : "bg-gray-200 text-gray-700 opacity-50 hover:opacity-80",
                      "focus:outline-none focus:ring-2 focus:ring-black"
                    )}
                    style={{ minWidth: 80 }}
                  >
                    {chartType.label}
                  </button>
                )
              })}
            </div>
            {/* Chart Content */}
            <div className="flex-1 min-h-0">
              {activeChartType === "daily" && (
                <div className="h-full flex flex-col">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyAnalytics} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={d => formatDate(String(d))}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 'dataMax + 10%']}
                          tickFormatter={formatLargeNumber}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const revenue = payload.find(p => p.dataKey === 'revenue')?.value as number || 0
                              const potentialRevenue = payload.find(p => p.dataKey === 'potentialRevenue')?.value as number || 0
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-medium">{formatDate(String(label))}</p>
                                  <p className="text-green-600 font-semibold">
                                    Revenue: {formatPrice(revenue)}
                                  </p>
                                  <p className="text-blue-600 font-semibold">
                                    Potential: {formatPrice(potentialRevenue)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {numberToWords(revenue)} actual / {numberToWords(potentialRevenue)} potential
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconType="line"
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Actual Revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="potentialRevenue"
                          name="Potential Revenue"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {activeChartType === "products" && (
                <div className="h-full flex flex-col">
                  {/* Product Revenue Bars */}
                  <div className="flex-1 min-h-0 space-y-3 overflow-y-auto">
                    {topProducts.map((product, index) => {
                      const maxProductRevenue = Math.max(...topProducts.map(p => p.revenue))
                      const barWidth = `${(product.revenue / maxProductRevenue) * 100}%`
                      return (
                        <div key={product.productId} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate flex-1">{product.name}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground ml-2 cursor-help">${formatLargeNumber(product.revenue)}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatPrice(product.revenue)}</p>
                                <p className="text-xs text-muted-foreground">{numberToWords(product.revenue)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                                index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                                index === 2 ? "bg-gradient-to-r from-amber-500 to-amber-700" :
                                "bg-gradient-to-r from-blue-400 to-blue-600"
                              )}
                              style={{ width: barWidth }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{product.quantity} units</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">${formatLargeNumber(product.revenue / product.quantity)} avg</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{formatPrice(product.revenue / product.quantity)}</p>
                                <p className="text-xs text-muted-foreground">{numberToWords(product.revenue / product.quantity)} average per unit</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Summary Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-gray-200 flex-shrink-0">
              <span>
                Total revenue: <Tooltip><TooltipTrigger asChild><span className="cursor-help">${formatLargeNumber(totalRevenue)}</span></TooltipTrigger><TooltipContent><p>{formatPrice(totalRevenue)}</p><p className="text-xs text-muted-foreground">{numberToWords(totalRevenue)}</p></TooltipContent></Tooltip>
              </span>
              <span>
                Total potential: <Tooltip><TooltipTrigger asChild><span className="cursor-help">${formatLargeNumber(totalPotentialRevenue)}</span></TooltipTrigger><TooltipContent><p>{formatPrice(totalPotentialRevenue)}</p><p className="text-xs text-muted-foreground">{numberToWords(totalPotentialRevenue)}</p></TooltipContent></Tooltip>
              </span>
              <span>
                Avg daily revenue: <Tooltip><TooltipTrigger asChild><span className="cursor-help">${formatLargeNumber(averageRevenue)}</span></TooltipTrigger><TooltipContent><p>{formatPrice(averageRevenue)}</p><p className="text-xs text-muted-foreground">{numberToWords(averageRevenue)}</p></TooltipContent></Tooltip>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

function formatLargeNumber(num: number) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toFixed(0)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
