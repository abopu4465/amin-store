"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Package,
  ShoppingCart,
  Settings,
  AlertTriangle,
  TrendingUp,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  PlusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSettings } from "@/contexts/settings-context"
import { useSidebar } from "@/hooks/use-sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const { isOpen, setIsOpen, isCollapsed, isMobile, toggleCollapse, toggleOpen } = useSidebar({
    localStorageKey: "aminstore-sidebar",
  })

  const sidebarRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Handle clicks outside the sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside, { passive: true })

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen, isMobile, setIsOpen])

  // Close sidebar on navigation for mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile, setIsOpen])

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/add-product",
      label: "Add Product",
      icon: PlusCircle,
      active: pathname === "/add-product",
    },
    {
      href: "/view-products",
      label: "Products",
      icon: Package,
      active: pathname === "/view-products" || pathname.startsWith("/edit-product/"),
    },
    {
      href: "/sales",
      label: "Sales",
      icon: ShoppingCart,
      active: pathname === "/sales",
    },
    {
      href: "/report",
      label: "Reports",
      icon: FileText,
      active: pathname === "/report",
    },
    {
      href: "/stock-alerts",
      label: "Stock Alerts",
      icon: AlertTriangle,
      active: pathname === "/stock-alerts",
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: TrendingUp,
      active: pathname === "/analytics",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            ref={toggleButtonRef}
            variant="outline"
            size="icon"
            onClick={toggleOpen}
            className="min-h-[44px] min-w-[44px]"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{settings.storeName || "Amin Store"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        data-sidebar={isMobile ? (isOpen ? "open" : "closed") : isCollapsed ? "collapsed" : "expanded"}
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 border-r bg-card transition-all duration-300 ease-in-out will-change-transform",
          // Mobile styles
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : // Desktop styles
              "lg:translate-x-0",
          // Collapsed state (desktop only)
          !isMobile && isCollapsed ? "w-[70px]" : "w-64",
        )}
        style={
          {
            "--primary-color": settings.primaryColor || "#10b981",
          } as React.CSSProperties
        }
        aria-hidden={isMobile && !isOpen}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="sticky top-0 z-10 flex h-16 items-center border-b bg-card px-4">
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                !isMobile && isCollapsed ? "justify-center w-full" : "",
              )}
            >
              <Package className="h-6 w-6 text-primary flex-shrink-0" />
              {!isMobile && !isCollapsed && (
                <span className="font-bold text-xl whitespace-nowrap overflow-hidden transition-all duration-300">
                  {settings.storeName || "Amin Store"}
                </span>
              )}
            </div>
          </div>

          {/* Collapse Toggle Button - Only visible on desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 -right-3 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent hidden lg:flex"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          )}

          {/* Search - Hidden when collapsed */}
          {!isMobile && !isCollapsed && (
            <div className="px-4 py-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Search..." className="pl-8 bg-background/50 border-border h-10" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-auto py-4">
            <TooltipProvider delayDuration={0}>
              <ul className={cn("grid gap-1", !isMobile && isCollapsed ? "px-2" : "px-3")}>
                {routes.map((route) => (
                  <li key={route.href}>
                    {!isMobile && isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={route.href}
                            className={cn(
                              "flex items-center justify-center rounded-md p-2 text-sm font-medium transition-all hover:bg-accent min-h-[44px]",
                              route.active
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={() => isMobile && setIsOpen(false)}
                            aria-current={route.active ? "page" : undefined}
                          >
                            <route.icon className="h-5 w-5" />
                            <span className="sr-only">{route.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {route.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all min-h-[44px]",
                          route.active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                        onClick={() => isMobile && setIsOpen(false)}
                        aria-current={route.active ? "page" : undefined}
                      >
                        <route.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{route.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          </nav>

          {/* Sidebar Footer */}
          <div className="sticky bottom-0 border-t bg-card p-4">
            <div className={cn("flex items-center", !isMobile && isCollapsed ? "justify-center" : "gap-2")}>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-primary" />
              </div>
              {!isMobile && !isCollapsed && (
                <div className="overflow-hidden transition-all duration-300">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Store Manager</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Padding - Only apply on desktop */}
      <div className={cn("transition-all duration-300", !isMobile && (isCollapsed ? "lg:pl-[70px]" : "lg:pl-64"))} />
    </>
  )
}
