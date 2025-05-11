"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { BarChart3, Home, Package, ShoppingCart } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/view-products",
      label: "Products",
      icon: Package,
      active: pathname === "/view-products" || pathname.startsWith("/edit-product/") || pathname === "/add-product",
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
      icon: BarChart3,
      active: pathname === "/report",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">Amin Store</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4 mr-2" />
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ModeToggle />
          </nav>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="ml-2">
              <Package className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {routes.map((route) => (
              <DropdownMenuItem key={route.href} asChild>
                <Link
                  href={route.href}
                  className={cn("flex items-center", route.active ? "text-primary" : "text-muted-foreground")}
                >
                  <route.icon className="h-4 w-4 mr-2" />
                  {route.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
