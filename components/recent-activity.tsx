"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Package, ShoppingCart, User } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "order",
    message: "New order #1234 placed",
    time: "2 minutes ago",
    icon: ShoppingCart,
    status: "new",
  },
  {
    id: 2,
    type: "product",
    message: "Vintage Wall Clock restocked",
    time: "1 hour ago",
    icon: Package,
    status: "success",
  },
  {
    id: 3,
    type: "customer",
    message: "New customer registered",
    time: "3 hours ago",
    icon: User,
    status: "info",
  },
  {
    id: 4,
    type: "order",
    message: "Order #1230 cancelled",
    time: "5 hours ago",
    icon: Clock,
    status: "cancelled",
  },
]

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  success: "bg-green-500",
  info: "bg-gray-500",
  cancelled: "bg-red-500",
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your store</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${statusColors[activity.status]}`}>
                <activity.icon className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
