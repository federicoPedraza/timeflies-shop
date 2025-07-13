"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RevenueChart, useRevenueMetrics } from "@/components/revenue-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, BarChart3, TrendingDown, Minus } from "lucide-react"
import { formatPrice, numberToWords } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AnalyticsPage() {
  const {
    totalRevenue,
    maxRevenueDay,
    revenueTrend,
    profitMargin,
    totalProfit,
    totalCost,
    isLoading
  } = useRevenueMetrics()

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Increasing'
      case 'decreasing':
        return 'Decreasing'
      default:
        return 'Stable'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>

          {/* Profits Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Profits & Revenue</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <RevenueChart />

              {/* Additional Metrics Card */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">Profit Margin</div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-2xl font-bold text-blue-700 cursor-help">
                            {isLoading ? '--' : `${profitMargin.toFixed(1)}%`}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isLoading ? '--' : `${numberToWords(profitMargin)} percent`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Total Profit</div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-2xl font-bold text-green-700 cursor-help">
                            {isLoading ? '--' : formatPrice(totalProfit)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isLoading ? '--' : numberToWords(totalProfit)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Top Performing Day</div>
                    <div className="text-lg font-semibold">
                      {isLoading || !maxRevenueDay ? '--' : (
                        <div>
                          <div>{maxRevenueDay.date}</div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-sm text-green-600 cursor-help">
                                {formatPrice(maxRevenueDay.revenue)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{numberToWords(maxRevenueDay.revenue)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Revenue Trend</div>
                    <div className={`text-lg font-semibold ${getTrendColor(revenueTrend)} flex items-center gap-2`}>
                      {getTrendIcon(revenueTrend)}
                      {getTrendText(revenueTrend)}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Total Costs</div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-lg font-semibold text-orange-700 cursor-help">
                          {isLoading ? '--' : formatPrice(totalCost)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isLoading ? '--' : numberToWords(totalCost)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Future Sections Placeholder */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-muted-foreground mb-2">📊</div>
                <h3 className="font-medium">Product Performance</h3>
                <p className="text-sm text-muted-foreground mt-1">Best selling products analysis</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-muted-foreground mb-2">👥</div>
                <h3 className="font-medium">Customer Insights</h3>
                <p className="text-sm text-muted-foreground mt-1">Customer behavior and demographics</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-muted-foreground mb-2">🚚</div>
                <h3 className="font-medium">Shipping Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">Delivery performance and costs</p>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}
