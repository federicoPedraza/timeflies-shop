"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { RevenueChart, useRevenueMetrics } from "@/components/revenue-chart"
import { ProductPerformanceAnalytics } from "@/components/product-performance-analytics"
import { StockAnalytics } from "@/components/stock-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, BarChart3, TrendingDown, Minus, Package } from "lucide-react"
import { formatPrice, numberToWords } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

interface MaxRevenueDay {
  date: string;
  revenue: number;
}

interface AnalyticsContentProps {
  profitsLoading: boolean;
  performanceLoaded: boolean;
  inventoryLoaded: boolean;
  setPerformanceLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setInventoryLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  profitsRef: React.RefObject<HTMLDivElement | null>;
  performanceRef: React.RefObject<HTMLDivElement | null>;
  inventoryRef: React.RefObject<HTMLDivElement | null>;
  maxRevenueDay: MaxRevenueDay | null;
  revenueTrend: string;
  profitMargin: number;
  totalProfit: number;
  totalCost: number;
}

function AnalyticsContent({
  profitsLoading,
  performanceLoaded,
  inventoryLoaded,
  setPerformanceLoaded,
  setInventoryLoaded,
  profitsRef,
  performanceRef,
  inventoryRef,
  maxRevenueDay,
  revenueTrend,
  profitMargin,
  totalProfit,
  totalCost
}: AnalyticsContentProps) {
  const searchParams = useSearchParams();

  // Handle scrolling to sections based on URL hash, only after all sections are loaded
  useEffect(() => {
    if (profitsLoading || !performanceLoaded || !inventoryLoaded) return
    const hash = window.location.hash
    if (!hash) return

    const scrollToSection = () => {
      let targetRef: React.RefObject<HTMLDivElement | null> | null = null

      switch (hash) {
        case '#profits':
          targetRef = profitsRef
          break
        case '#performance':
          targetRef = performanceRef
          break
        case '#inventory':
          targetRef = inventoryRef
          break
      }

      if (targetRef?.current) {
        setTimeout(() => {
          targetRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 100) // Small delay to ensure content is rendered
      }
    }

    scrollToSection()
  }, [profitsLoading, performanceLoaded, inventoryLoaded, searchParams, profitsRef, performanceRef, inventoryRef])

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
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-gray-600" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>
      {/* Profits Section */}
      <div ref={profitsRef} className="space-y-4">
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
                        {profitsLoading ? '--' : `${profitMargin.toFixed(1)}%`}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{profitsLoading ? '--' : `${numberToWords(profitMargin)} percent`}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Total Profit</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-2xl font-bold text-green-700 cursor-help">
                        {profitsLoading ? '--' : formatPrice(totalProfit)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{profitsLoading ? '--' : numberToWords(totalProfit)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Top Performing Day</div>
                <div className="text-lg font-semibold">
                  {profitsLoading || !maxRevenueDay ? '--' : (
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
                      {profitsLoading ? '--' : formatPrice(totalCost)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{profitsLoading ? '--' : numberToWords(totalCost)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Product Performance Analytics */}
      <div ref={performanceRef} className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Product Performance Analytics</h2>
        </div>
        <ProductPerformanceAnalytics onLoaded={() => setPerformanceLoaded(true)} />
      </div>
      {/* Stock Analytics */}
      <div ref={inventoryRef} className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Stock Analytics</h2>
        </div>
        <StockAnalytics onLoaded={() => setInventoryLoaded(true)} />
      </div>
      {/* Future Sections Placeholder */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <Card className="p-6 text-center">
            <div className="text-muted-foreground mb-2">📈</div>
            <h3 className="font-medium">Advanced Analytics</h3>
            <p className="text-sm text-muted-foreground mt-1">Predictive analytics and trends</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const {
    maxRevenueDay,
    revenueTrend,
    profitMargin,
    totalProfit,
    totalCost,
    isLoading: profitsLoading
  } = useRevenueMetrics()

  const [performanceLoaded, setPerformanceLoaded] = useState(false)
  const [inventoryLoaded, setInventoryLoaded] = useState(false)

  const profitsRef = useRef<HTMLDivElement | null>(null)
  const performanceRef = useRef<HTMLDivElement | null>(null)
  const inventoryRef = useRef<HTMLDivElement | null>(null)

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <DashboardLayout>
          <Suspense fallback={<div>Loading analytics...</div>}>
            <AnalyticsContent
              profitsLoading={profitsLoading}
              performanceLoaded={performanceLoaded}
              inventoryLoaded={inventoryLoaded}
              setPerformanceLoaded={setPerformanceLoaded}
              setInventoryLoaded={setInventoryLoaded}
              profitsRef={profitsRef}
              performanceRef={performanceRef}
              inventoryRef={inventoryRef}
              maxRevenueDay={maxRevenueDay}
              revenueTrend={revenueTrend}
              profitMargin={profitMargin}
              totalProfit={totalProfit}
              totalCost={totalCost}
            />
          </Suspense>
        </DashboardLayout>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
