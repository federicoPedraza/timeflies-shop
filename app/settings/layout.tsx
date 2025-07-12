import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings - Timeflies",
  description: "Manage your store configuration and preferences",
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
