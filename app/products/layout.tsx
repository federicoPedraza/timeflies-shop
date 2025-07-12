import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products - Timeflies",
  description: "Manage your product catalog and inventory",
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
