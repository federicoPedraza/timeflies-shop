"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+180.1% from last month",
    icon: ShoppingCart,
    trend: "up",
  },
  {
    title: "Clocks Sold",
    value: "12,234",
    change: "+19% from last month",
    icon: Clock,
    trend: "up",
  },
  {
    title: "Active Products",
    value: "573",
    change: "-4.3% from last month",
    icon: Package,
    trend: "down",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
  )
}
