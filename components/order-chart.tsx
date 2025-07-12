"use client"

import { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", orders: 65, revenue: 4000 },
  { name: "Feb", orders: 59, revenue: 3000 },
  { name: "Mar", orders: 80, revenue: 5000 },
  { name: "Apr", orders: 81, revenue: 4500 },
  { name: "May", orders: 56, revenue: 3500 },
  { name: "Jun", orders: 55, revenue: 3200 },
  { name: "Jul", orders: 40, revenue: 2800 },
]

export const OrderChart = memo(function OrderChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Trends</CardTitle>
        <CardDescription>Monthly order volume and revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#8884d8" animationDuration={0} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
})
