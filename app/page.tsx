"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="h-8 w-8 hover:bg-accent hover:text-accent-foreground" />
          <div className="h-6 w-px bg-border mx-2" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">T</span>
            </div>
            <h1 className="text-xl font-semibold">Timeflies Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <DashboardContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
