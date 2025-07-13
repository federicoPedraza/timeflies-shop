"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, DollarSign, ShoppingCart, ArrowRight, Warehouse, AlertTriangle, ExternalLink, TrendingUp, RefreshCw, ShoppingBag, HelpCircle } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/AuthProvider"

// Loading animation component
function LoadingIndicator() {
  return (
    <span className="text-muted-foreground">-</span>
  )
}

export function StatsCards({
  hideFinancials = false,
  selectedCard,
  onCardSelect
}: {
  hideFinancials?: boolean
  selectedCard?: string | null
  onCardSelect?: (cardTitle: string | null) => void
}) {
  const router = useRouter()
  const [refreshingCheckouts, setRefreshingCheckouts] = useState(false)
  const { makeAuthenticatedRequest } = useAuth()
  const dashboardStats = useQuery(api.products.getDashboardStats)
  const revenueStats = useQuery(api.orders.getRevenueStats)
  const orderStats = useQuery(api.orders.getOrderStats)
  const trends = useQuery(api.products.getTrends)
  const inventoryCosts = useQuery(api.products.getInventoryCosts)
  const potentialRevenueStats = useQuery(api.orders.getPotentialRevenueStats)
  const checkoutStats = useQuery(api.checkouts.getCheckoutStats)

  // Debug: Log para verificar si los datos se están actualizando
  console.log("🔄 StatsCards - dashboardStats:", dashboardStats)
  console.log("🔄 StatsCards - revenueStats:", revenueStats)
  console.log("🔄 StatsCards - orderStats:", orderStats)
  console.log("🔄 StatsCards - trends:", trends)
  console.log("🔄 StatsCards - inventoryCosts:", inventoryCosts)

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
    totalRevenue: "Loading...",
    incompleteOrders: "Loading...",
    totalOrders: "Loading...",
    incompleteOrdersCount: 0,
    clocksSold: "Loading...",
    outOfStockProducts: "Loading...",
    totalProducts: "Loading...",
    profitMargin: "Loading...",
    inventoryCosts: "Loading...",
    totalBillingAmount: "Loading...",
    potentialRevenue: "Loading...",
    missingRevenuePercentage: "Loading...",
    abandonedCheckouts: "Loading...",
    totalCheckouts: "Loading...",
    abandonedCheckoutsValue: "Loading...",
    trends: {
      revenue: "+0% from last month",
      orders: "+0% from last month",
      clocks: "+0% from last month",
      products: "+0% from last month"
    }
  }

  // Check if any of the main queries are still loading
  const isLoading = dashboardStats === undefined || orderStats === undefined || revenueStats === undefined || inventoryCosts === undefined || potentialRevenueStats === undefined || checkoutStats === undefined

  // Usar datos del backend si están disponibles, sino usar valores por defecto
  const stats = dashboardStats ? {
    totalRevenue: `$${dashboardStats.totalRevenue.toLocaleString()}`,
    incompleteOrders: orderStats ? orderStats.pendingOrders.toLocaleString() : "Loading...",
    totalOrders: orderStats ? orderStats.totalOrders.toLocaleString() : "Loading...",
    incompleteOrdersCount: orderStats ? orderStats.pendingOrders : 0,
    clocksSold: dashboardStats.totalClocksSold.toLocaleString(),
    outOfStockProducts: dashboardStats.outOfStockProducts.toLocaleString(),
    totalProducts: dashboardStats.totalProducts.toLocaleString(),
    profitMargin: revenueStats ? `${revenueStats.profitMargin.toFixed(1)}%` : "Loading...",
    inventoryCosts: inventoryCosts ? `$${inventoryCosts.totalInventoryCost.toLocaleString()}` : "Loading...",
    totalBillingAmount: revenueStats ? `$${revenueStats.totalRevenue.toLocaleString()}` : "Loading...",
    potentialRevenue: potentialRevenueStats ? `$${potentialRevenueStats.potentialRevenue.toLocaleString()}` : "Loading...",
    missingRevenuePercentage: potentialRevenueStats ? `${potentialRevenueStats.missingRevenuePercentage.toFixed(1)}%` : "Loading...",
    abandonedCheckouts: checkoutStats ? checkoutStats.abandonedCheckouts.toLocaleString() : "Loading...",
    totalCheckouts: checkoutStats ? checkoutStats.totalCheckouts.toLocaleString() : "Loading...",
    abandonedCheckoutsValue: checkoutStats ? `$${checkoutStats.totalAbandonedValue.toLocaleString()}` : "Loading...",
    trends: trends || dashboardStats.trends // Usar trends reales si están disponibles
  } : defaultStats

  const handleViewIncompleteOrders = () => {
    router.push('/orders?orderStatus=pending')
  }

  const handleViewOutOfStockProducts = () => {
    router.push('/products?stockStatus=out_of_stock')
  }

  const handleGoToStore = () => {
    window.open('https://timefliesdemo.mitiendanube.com/', '_blank')
  }

  const handleRefreshCheckouts = async () => {
    if (refreshingCheckouts) return; // Prevent multiple simultaneous refreshes

    setRefreshingCheckouts(true);
    try {
      const response = await makeAuthenticatedRequest('/api/products/sync-checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'tiendanube' }),
      });

      if (!response.ok) {
        console.error('Failed to refresh checkouts');
        return;
      }

      // The data will be automatically refreshed by the Convex query
      console.log('Checkouts refreshed successfully');
    } catch (error) {
      console.error('Error refreshing checkouts:', error);
    } finally {
      setRefreshingCheckouts(false);
    }
  }

  const handleCardClick = (stat: typeof statsConfig[0]) => {
    if (refreshingCheckouts) return;

    // Handle existing click behaviors
    if (stat.title === "Incomplete Orders" && stat.hasIncompleteOrders) {
      handleViewIncompleteOrders();
      return;
    }
    if (stat.title === "Products Out of Stock" && stat.hasOutOfStockProducts) {
      handleViewOutOfStockProducts();
      return;
    }
    if (stat.title === "Abandoned Checkouts") {
      handleRefreshCheckouts();
      return;
    }
    if (stat.title === "Go to Store") {
      handleGoToStore();
      return;
    }

    // Handle selectable cards
    if (stat.selectable && onCardSelect) {
      if (selectedCard === stat.title) {
        onCardSelect(null); // Deselect if already selected
      } else {
        onCardSelect(stat.title); // Select the card
      }
    }
  }

  const getIconColor = (stat: typeof statsConfig[0]) => {
    if (stat.title === "Incomplete Orders" && stat.hasIncompleteOrders) {
      const count = parseInt(stats.incompleteOrders.replace(/,/g, ''))
      if (count > 5) return "text-red-500"
      if (count > 0) return "text-orange-500"
    }
    if (stat.title === "Products Out of Stock" && stat.hasOutOfStockProducts) {
      const count = parseInt(stats.outOfStockProducts.replace(/,/g, ''))
      if (count > 5) return "text-red-500"
      if (count > 0) return "text-orange-500"
    }
    if (stat.title === "Abandoned Checkouts") {
      if (refreshingCheckouts) return "text-blue-500"
      const count = parseInt(stats.abandonedCheckouts.replace(/,/g, ''))
      if (count > 20) return "text-red-500"
      if (count > 5) return "text-yellow-500"
      if (count === 0 && !isLoading) return "text-green-500"
    }
    return "text-muted-foreground"
  }

  const statsConfig = [
    {
      title: "Total Revenue",
      value: stats.totalBillingAmount,
      subtitle: `${revenueStats?.totalPaidOrders || 0} paid orders`,
      icon: DollarSign,
      isFinancial: true,
      selectable: true,
    },
    {
      title: "Incomplete Orders",
      value: stats.incompleteOrders,
      subtitle: `${stats.totalOrders} total orders`,
      icon: ShoppingCart,
      hasIncompleteOrders: stats.incompleteOrdersCount > 0,
      isFinancial: false,
      selectable: false,
    },
    {
      title: "Clocks Sold",
      value: stats.clocksSold,
      icon: Clock,
      isFinancial: false,
      selectable: true,
    },
    {
      title: "Products Out of Stock",
      value: stats.outOfStockProducts,
      subtitle: `${stats.totalProducts} total products`,
      icon: AlertTriangle,
      isFinancial: false,
      hasOutOfStockProducts: parseInt(stats.outOfStockProducts.replace(/,/g, '')) > 0,
      selectable: false,
    },
    {
      title: "Inventory Value",
      value: stats.inventoryCosts,
      icon: Warehouse,
      isFinancial: true,
      selectable: false,
    },
    {
      title: "Potential Revenue",
      value: stats.potentialRevenue,
      subtitle: `${stats.missingRevenuePercentage} missing revenue`,
      icon: TrendingUp,
      isFinancial: true,
      selectable: false,
    },
    {
      title: "Abandoned Checkouts",
      value: stats.abandonedCheckouts,
      subtitle: `${stats.abandonedCheckoutsValue} potential revenue`,
      icon: ShoppingBag,
      isFinancial: false,
      hasAbandonedCheckouts: parseInt(stats.abandonedCheckouts.replace(/,/g, '')) > 0,
      isRefreshable: true,
      selectable: false,
    },
    {
      title: "Go to Store",
      value: "",
      icon: ExternalLink,
      isFinancial: false,
      isActionCard: true,
      selectable: false,
    },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
          <Card
            key={stat.title}
            className={cn(
              "transition-all duration-200",
              // Existing clickable states
              ((stat.title === "Incomplete Orders" && stat.hasIncompleteOrders) ||
               (stat.title === "Products Out of Stock" && stat.hasOutOfStockProducts) ||
               (stat.title === "Abandoned Checkouts") ||
               (stat.title === "Go to Store") ||
               stat.selectable)
                ? "group cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-primary/20"
                : "",
              // Selection state for selectable cards
              stat.selectable && selectedCard === stat.title
                ? "ring-2 ring-primary border-primary shadow-lg"
                : ""
            )}
            onClick={() => handleCardClick(stat)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.title === "Abandoned Checkouts" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Abandoned checkouts are those with more than 6 hours of inactivity</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {stat.selectable && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view detailed chart for this metric</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${getIconColor(stat)}`} />
                {(stat.title === "Incomplete Orders" && stat.hasIncompleteOrders) ||
                 (stat.title === "Products Out of Stock" && stat.hasOutOfStockProducts) ||
                 (stat.title === "Go to Store") ? (
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-30 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
                ) : stat.title === "Abandoned Checkouts" ? (
                  <RefreshCw className={`h-4 w-4 text-muted-foreground transition-all duration-200 ${refreshingCheckouts ? 'opacity-100 animate-spin' : 'opacity-30 group-hover:opacity-100 group-hover:rotate-180'}`} />
                ) : stat.selectable ? (
                  <div className="w-2 h-2 rounded-full bg-primary opacity-30 transition-all duration-200 group-hover:opacity-100" />
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold relative group">
                {stat.title === "Go to Store" ? stat.value : (isLoading ? <LoadingIndicator /> : stat.value)}
                {hideFinancials && stat.isFinancial && (
                  <div className="absolute inset-0 bg-black rounded-sm group-hover:bg-transparent transition-colors duration-200"></div>
                )}
              </div>
              {stat.subtitle && (
                <div className="text-xs text-muted-foreground mt-2 relative group">
                  {stat.title === "Go to Store" ? stat.subtitle : (isLoading ? <LoadingIndicator /> : stat.subtitle)}
                  {hideFinancials && stat.isFinancial && (
                    <div className="absolute inset-0 bg-black rounded-sm group-hover:bg-transparent transition-colors duration-200"></div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </TooltipProvider>
  )
}
