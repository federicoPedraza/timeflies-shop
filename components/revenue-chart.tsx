"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { format } from "date-fns"
import { formatPrice, numberToWords } from "@/lib/utils"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RevenueData {
  date: string
  revenue: number
}

export function RevenueChart() {
  const dailyRevenueData = useQuery(api.orders.getDailyRevenueData, { days: 7 })

  const chartData = useMemo(() => {
    if (!dailyRevenueData) return []

    return dailyRevenueData.map((item: RevenueData) => ({
      ...item,
      formattedDate: format(new Date(item.date), 'MMM dd'),
      revenueFormatted: formatPrice(item.revenue)
    }))
  }, [dailyRevenueData])

  const totalRevenue = useMemo(() => {
    if (!dailyRevenueData) return 0
    return dailyRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  }, [dailyRevenueData])

  const averageRevenue = useMemo(() => {
    if (!dailyRevenueData || dailyRevenueData.length === 0) return 0
    return totalRevenue / dailyRevenueData.length
  }, [dailyRevenueData, totalRevenue])

  const maxRevenue = useMemo(() => {
    if (!dailyRevenueData || dailyRevenueData.length === 0) return 0
    return Math.max(...dailyRevenueData.map(item => item.revenue))
  }, [dailyRevenueData])



  if (!dailyRevenueData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading revenue data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Daily revenue over the last 7 days
              </p>
            </div>
            <div className="text-right">
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="text-2xl font-bold text-green-600 cursor-help">
                    {formatPrice(totalRevenue)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{numberToWords(totalRevenue)}</p>
                </TooltipContent>
              </UITooltip>
              <div className="text-sm text-muted-foreground">
                Total Revenue
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Average Daily Revenue</div>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="text-xl font-semibold cursor-help">
                    {formatPrice(averageRevenue)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{numberToWords(averageRevenue)}</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Peak Daily Revenue</div>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="text-xl font-semibold cursor-help">
                    {formatPrice(maxRevenue)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{numberToWords(maxRevenue)}</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>

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
    </TooltipProvider>
  )
}

// Export the computed values for use in the parent component
export function useRevenueMetrics() {
  const dailyRevenueData = useQuery(api.orders.getDailyRevenueData, { days: 7 })
  const revenueStats = useQuery(api.orders.getRevenueStats)

  const totalRevenue = useMemo(() => {
    if (!dailyRevenueData) return 0
    return dailyRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  }, [dailyRevenueData])

  const maxRevenueDay = useMemo(() => {
    if (!dailyRevenueData || dailyRevenueData.length === 0) return null
    const maxItem = dailyRevenueData.reduce((max, item) =>
      item.revenue > max.revenue ? item : max
    )
    return {
      date: format(new Date(maxItem.date), 'MMM dd, yyyy'),
      revenue: maxItem.revenue
    }
  }, [dailyRevenueData])

  const revenueTrend = useMemo(() => {
    if (!dailyRevenueData || dailyRevenueData.length < 7) return 'stable'

    const last7Days = dailyRevenueData.slice(-7)
    const firstHalf = last7Days.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0) / 3
    const secondHalf = last7Days.slice(-3).reduce((sum, item) => sum + item.revenue, 0) / 3

    const change = ((secondHalf - firstHalf) / firstHalf) * 100

    if (change > 10) return 'increasing'
    if (change < -10) return 'decreasing'
    return 'stable'
  }, [dailyRevenueData])

  return {
    totalRevenue,
    maxRevenueDay,
    revenueTrend,
    profitMargin: revenueStats?.profitMargin || 0,
    totalProfit: revenueStats?.totalProfit || 0,
    totalCost: revenueStats?.totalCost || 0,
    isLoading: !dailyRevenueData || !revenueStats
  }
}
