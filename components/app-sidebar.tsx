"use client"

import { BarChart3, Clock, Home, Package, Settings, ShoppingCart, TrendingUp, Users, Linkedin } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useTiendanubeStatus } from "@/hooks/use-tiendanube-status"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Overview",
    path: "/",
    icon: Home,
  },
  {
    title: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    path: "/products",
    icon: Package,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { tiendanubeStatus, loading } = useTiendanubeStatus()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  const hasTiendanubeError = !loading && tiendanubeStatus && !tiendanubeStatus.status

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Timeflies</span>
            <span className="text-xs text-muted-foreground">Clock Store</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    onClick={() => handleNavigation(item.path)}
                    className="relative"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    {item.title === "Settings" && hasTiendanubeError && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <a
          href="https://www.linkedin.com/in/federico-pedraza/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground opacity-30 hover:opacity-100 transition-opacity duration-200"
        >
          <Linkedin className="h-3 w-3" />
          <span>LinkedIn</span>
        </a>
      </SidebarFooter>
    </Sidebar>
  )
}
