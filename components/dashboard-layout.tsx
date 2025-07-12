"use client"


import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <div className="w-64 flex-shrink-0">
          <AppSidebar />
        </div>
        <SidebarInset className="flex-1 min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">T</span>
              </div>
              <h1 className="text-xl font-semibold">Timeflies Dashboard</h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden min-w-0">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
