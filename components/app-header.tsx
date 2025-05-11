"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Bell, SearchIcon, Plus, ChevronDown, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"

export function AppHeader() {
  const pathname = usePathname()
  const [showSearch, setShowSearch] = useState(false)

  // Get page title based on current path
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard"
    if (pathname === "/view-products" || pathname.startsWith("/edit-product/") || pathname === "/add-product")
      return "Products"
    if (pathname === "/sales") return "Sales"
    if (pathname === "/report") return "Reports"
    if (pathname === "/stock-alerts") return "Stock Alerts"
    if (pathname === "/analytics") return "Analytics"
    if (pathname === "/settings") return "Settings"
    return "Amin Store"
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold lg:block hidden">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          {showSearch ? (
            <div className="relative w-64 animate-in fade-in slide-in-from-top-4 duration-200">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 pr-4" autoFocus onBlur={() => setShowSearch(false)} />
            </div>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="rounded-full lg:block hidden"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Button variant="default" size="sm" asChild className="gap-1 lg:block hidden">
            <Link href="/add-product">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>

          <Button variant="outline" size="icon" className="relative rounded-full lg:block hidden">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 rounded-full lg:block hidden">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-3 w-3 text-primary" />
                </div>
                <span className="font-medium">Admin</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/settings" className="flex w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
