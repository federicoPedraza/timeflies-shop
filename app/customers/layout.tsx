import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers - Timeflies",
  description: "Manage your customer database and relationships",
}

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
