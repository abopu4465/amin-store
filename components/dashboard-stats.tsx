"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils/date-formatter"

interface DashboardStatsProps {
  totalSales: number
  totalProducts: number
  lowStockItems: number
  averageOrderValue: number
  salesGrowth: number
  uniqueCustomers: number
  currencySymbol: string
}

export function DashboardStats({
  totalSales,
  totalProducts,
  lowStockItems,
  averageOrderValue,
  salesGrowth,
  uniqueCustomers,
  currencySymbol = "$",
}: DashboardStatsProps) {
  // Format numbers with proper error handling
  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === undefined || num === null) return "0"
    return num.toFixed(2)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="total-sales">
            {formatCurrency(totalSales, currencySymbol)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className={`flex items-center ${salesGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
              <ArrowUpRight className="h-3 w-3" /> {formatNumber(salesGrowth)}%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="total-products">
            {totalProducts}
          </div>
          <p className="text-xs text-muted-foreground mt-1">in inventory</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="low-stock-items">
            {lowStockItems}
          </div>
          <p className="text-xs text-muted-foreground mt-1">need attention</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="avg-order-value">
            {formatCurrency(averageOrderValue, currencySymbol)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">per transaction</p>
        </CardContent>
      </Card>
    </div>
  )
}
