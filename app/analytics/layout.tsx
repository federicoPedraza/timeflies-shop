import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics - Timeflies",
  description: "Detailed analysis and insights for your business",
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
