"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useMemo, useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DayData {
  date: string
  count: number
}

const FILTERS = [
  { key: "orders", label: "Orders" },
  { key: "clocks", label: "Clocks sold" },
  { key: "activities", label: "Activities" },
]

export function ActivityChart() {
  const orders = useQuery(api.orders.getOrdersWithProviderData)
  const webhookLogsQuery = useQuery(api.products.getWebhookLogsWithInternalIds, { limit: 1000 })

  // Dynamic number of days state
  const [showLastDays, setShowLastDays] = useState(100)
  type FilterKey = 'orders' | 'clocks' | 'activities';
  const [activeFilter, setActiveFilter] = useState<FilterKey>("orders")

  const clocksSoldPerDay = useQuery(api.products.getClocksSoldPerDay, { days: showLastDays });

  const activityData = useMemo(() => {
    if (!orders) return []

    // Group orders by date
    const ordersByDate: Record<string, number> = {}
    orders.forEach(order => {
      if (order.paymentStatus !== "paid") return; // Only count paid orders
      const date = new Date(order.orderDate).toISOString().split('T')[0]
      ordersByDate[date] = (ordersByDate[date] || 0) + 1
    })

    // Activities: group webhook logs by date
    const logsByDate: Record<string, number> = {}
    if (webhookLogsQuery && webhookLogsQuery.logs) {
      webhookLogsQuery.logs.forEach(log => {
        const date = new Date(log.createdAt).toISOString().split('T')[0]
        logsByDate[date] = (logsByDate[date] || 0) + 1
      })
    }

    // Generate data for the last N days
    const data: DayData[] = []
    const today = new Date()
    for (let i = showLastDays - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      let count = 0
      if (activeFilter === "orders") count = ordersByDate[dateString] || 0
      else if (activeFilter === "clocks") count = clocksSoldPerDay ? clocksSoldPerDay[dateString] || 0 : 0
      else if (activeFilter === "activities") count = logsByDate[dateString] || 0
      data.push({
        date: dateString,
        count
      })
    }
    return data
  }, [orders, clocksSoldPerDay, webhookLogsQuery, showLastDays, activeFilter])

  // Group data into columns (arrays of N days)
  const columnsPerRow = 4;
  const columns = useMemo(() => {
    const columns: DayData[][] = [];
    for (let i = 0; i < activityData.length; i += columnsPerRow) {
      columns.push(activityData.slice(i, i + columnsPerRow));
    }
    return columns;
  }, [activityData]);

  const maxOrders = useMemo(() => {
    if (activityData.length === 0) return 1
    return Math.max(...activityData.map(day => day.count))
  }, [activityData])

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-gray-100"
    if (count <= maxOrders * 0.25) return "bg-green-200"
    if (count <= maxOrders * 0.5) return "bg-green-300"
    if (count <= maxOrders * 0.75) return "bg-green-400"
    return "bg-green-500"
  }

  const getTooltipText = (day: DayData) => {
    if (!day.date) return ''
    const todayString = new Date().toISOString().split('T')[0];
    if (day.date === todayString) {
      if (activeFilter === "orders")
        return day.count === 0 ? 'Today: No orders' : `Today: ${day.count} order${day.count === 1 ? '' : 's'}`;
      if (activeFilter === "clocks")
        return day.count === 0 ? 'Today: No clocks sold' : `Today: ${day.count} clock${day.count === 1 ? '' : 's'} sold`;
      if (activeFilter === "activities")
        return day.count === 0 ? 'Today: No activities' : `Today: ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`;
      return ''
    }
    if (activeFilter === "orders")
      return day.count === 0 ? `${day.date}: No orders` : `${day.date}: ${day.count} order${day.count === 1 ? '' : 's'}`
    if (activeFilter === "clocks")
      return day.count === 0 ? `${day.date}: No clocks sold` : `${day.date}: ${day.count} clock${day.count === 1 ? '' : 's'} sold`
    if (activeFilter === "activities")
      return day.count === 0 ? `${day.date}: No activities` : `${day.date}: ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`
    return ''
  }



  const filterLabels = {
    orders: {
      subtitle: `Order activity over the last ${showLastDays} days.`,
      total: 'Total orders',
      avg: 'Average orders per day'
    },
    clocks: {
      subtitle: `Clocks sold activity over the last ${showLastDays} days.`,
      total: 'Total clocks sold',
      avg: 'Average clocks sold per day'
    },
    activities: {
      subtitle: `Webhook activity over the last ${showLastDays} days.`,
      total: 'Total activities',
      avg: 'Average activities per day'
    }
  }

  const router = useRouter();

  if (!orders) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading activity data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>Activity Chart</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {filterLabels[activeFilter].subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="days-range" className="text-xs text-muted-foreground">Days:</label>
            <input
              id="days-range"
              type="range"
              min={7}
              max={120}
              value={showLastDays}
              onChange={e => setShowLastDays(Number(e.target.value))}
              className="w-32 h-2 rounded-lg appearance-none bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:bg-neutral-800 [&::-webkit-slider-thumb]:focus:bg-neutral-800 [&::-webkit-slider-thumb:hover]:w-4 [&::-webkit-slider-thumb:hover]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:bg-neutral-800 [&::-moz-range-thumb]:focus:bg-neutral-800 [&::-moz-range-thumb:hover]:w-4 [&::-moz-range-thumb:hover]:h-4"
            />
            <span className="text-xs w-8 text-center">{showLastDays}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-1 flex-1 min-h-0">
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-shrink-0">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>

          {/* Activity Grid */}
          <div className="flex flex-row w-full flex-1 min-h-0 gap-1">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col flex-1 justify-between">
                {col.map((day, rowIdx) => {
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  const isClickable = (activeFilter === 'orders' || activeFilter === 'clocks') && !!day.date;
                  const handleDayClick = () => {
                    if (!isClickable) return;
                    router.push(`/orders?date=${day.date}&filter=${activeFilter}`);
                  };
                  return (
                    <Tooltip key={rowIdx}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative rounded-sm border border-gray-200 ${!day.date ? 'bg-transparent border-transparent' : getIntensity(day.count)} transition-colors ${isClickable ? 'hover:scale-110 cursor-pointer' : ''}`}
                          style={{
                            width: '100%',
                            aspectRatio: '1 / 1'
                          }}
                          onClick={handleDayClick}
                        >
                          {isToday && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-1 h-1 bg-red-500 rounded-full" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>{getTooltipText(day)}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Filter Chips */}
          <div className="flex items-center justify-end gap-2 mt-4 flex-shrink-0">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as FilterKey)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border border-gray-300 transition-opacity",
                  activeFilter === filter.key ? "bg-black text-white opacity-90" : "bg-gray-200 text-gray-700 opacity-50 hover:opacity-80",
                  "focus:outline-none focus:ring-2 focus:ring-black"
                )}
                style={{ minWidth: 80 }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 flex-shrink-0">
            <span>
              {filterLabels[activeFilter].total}: {activityData.reduce((sum, day) => sum + day.count, 0)}
            </span>
            <span>
              {filterLabels[activeFilter].avg}: {(activityData.reduce((sum, day) => sum + day.count, 0) / activityData.length).toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
