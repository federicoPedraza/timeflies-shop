"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown, Percent } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function StatsCards() {
  const dashboardStats = useQuery(api.products.getDashboardStats)
  const revenueStats = useQuery(api.orders.getRevenueStats)
  const trends = useQuery(api.products.getTrends)

  // Debug: Log para verificar si los datos se están actualizando
  console.log("🔄 StatsCards - dashboardStats:", dashboardStats)
  console.log("🔄 StatsCards - revenueStats:", revenueStats)
  console.log("🔄 StatsCards - trends:", trends)

  // Debug: Mostrar información detallada de revenue si está disponible
  if (revenueStats) {
    console.log("💰 Revenue Debug Info:", {
      totalRevenue: revenueStats.totalRevenue,
      totalCost: revenueStats.totalCost,
      totalProfit: revenueStats.totalProfit,
      profitMargin: revenueStats.profitMargin,
      totalPaidOrders: revenueStats.totalPaidOrders,
      averageOrderValue: revenueStats.averageOrderValue,
      totalClocksSold: revenueStats.totalClocksSold,
    })
  }

  // Valores por defecto mientras se cargan los datos
  const defaultStats = {
    totalRevenue: "$0.00",
    orders: "0",
    clocksSold: "0",
    activeProducts: "0",
    profitMargin: "0%",
    trends: {
      revenue: "+0% from last month",
      orders: "+0% from last month",
      clocks: "+0% from last month",
      products: "+0% from last month"
    }
  }

  // Usar datos del backend si están disponibles, sino usar valores por defecto
  const stats = dashboardStats ? {
    totalRevenue: `$${dashboardStats.totalRevenue.toLocaleString()}`,
    orders: dashboardStats.totalOrders.toLocaleString(),
    clocksSold: dashboardStats.totalClocksSold.toLocaleString(),
    activeProducts: dashboardStats.activeProducts.toLocaleString(),
    profitMargin: revenueStats ? `${revenueStats.profitMargin.toFixed(1)}%` : "0%",
    trends: trends || dashboardStats.trends // Usar trends reales si están disponibles
  } : defaultStats

  const statsConfig = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      change: stats.trends.revenue,
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Orders",
      value: stats.orders,
      change: stats.trends.orders,
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Clocks Sold",
      value: stats.clocksSold,
      change: stats.trends.clocks,
      icon: Clock,
      trend: "up",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      change: stats.trends.products,
      icon: Package,
      trend: "down",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Details Section */}
      {revenueStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueStats.profitMargin.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                ${revenueStats.totalProfit.toLocaleString()} profit
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueStats.averageOrderValue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {revenueStats.totalPaidOrders} paid orders
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueStats.totalCost.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                Product costs
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
