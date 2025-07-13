"use client"

import { BarChart3, Clock, Home, Package, Settings, ShoppingCart, Users, Linkedin, DollarSign, Target } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTiendanubeStatus } from "@/hooks/use-tiendanube-status"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"
import { useState, useEffect } from "react"

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
    subItems: [
      {
        title: "Profits & Revenue",
        path: "/analytics#profits",
        icon: DollarSign,
      },
      {
        title: "Product Performance",
        path: "/analytics#performance",
        icon: Target,
      },
      {
        title: "Inventory",
        path: "/analytics#inventory",
        icon: Package,
      },
    ],
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
  const router = useNavigationLoading()
  const pathname = usePathname()
  const { tiendanubeStatus, loading } = useTiendanubeStatus()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Auto-expand Analytics when on analytics page
  useEffect(() => {
    if (pathname.startsWith('/analytics') && !expandedItems.has('Analytics')) {
      setExpandedItems(prev => new Set([...prev, 'Analytics']))
    }
  }, [pathname, expandedItems])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleSubItemNavigation = (path: string) => {
    router.push(path)
  }

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  const isSubItemActive = (path: string) => {
    return pathname === path || pathname.includes(path.split('#')[1] || '')
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
                  {item.subItems ? (
                    <SidebarMenuSub>
                      <SidebarMenuSubButton
                        isActive={isActive(item.path)}
                        onClick={() => toggleExpanded(item.title)}
                        className="relative border-l-0"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {item.title === "Settings" && hasTiendanubeError && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                        )}
                      </SidebarMenuSubButton>
                      {expandedItems.has(item.title) && (
                        <SidebarMenuSub className="border-l-0">
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuButton
                                isActive={isSubItemActive(subItem.path)}
                                tooltip={subItem.title}
                                onClick={() => handleSubItemNavigation(subItem.path)}
                                className="pl-6"
                              >
                                <subItem.icon />
                                <span>{subItem.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuSub>
                  ) : (
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
                  )}
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
