import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders - Timeflies",
  description: "Manage and track your store orders",
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
