import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { getAllProducts } from "@/lib/firebase/products"
import { getSales } from "@/lib/firebase/sales"
import { EnhancedSalesChart } from "@/components/enhanced-sales-chart"
import { FilteredRecentSales } from "@/components/filtered-recent-sales"
import { formatCurrency } from "@/lib/utils/date-formatter"
import { getStoreSettings } from "@/lib/firebase/settings"
import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default async function Home() {
  // Fetch data with proper error handling
  const productsPromise = getAllProducts().catch((error) => {
    console.error("Error fetching products:", error)
    return []
  })

  const salesPromise = getSales().catch((error) => {
    console.error("Error fetching sales:", error)
    return []
  })

  const settingsPromise = getStoreSettings().catch((error) => {
    console.error("Error fetching settings:", error)
    return {
      storeName: "Store",
      storeEmail: "",
      storePhone: "",
      storeAddress: "",
      storeCurrency: "USD",
      currencySymbol: "$",
      taxRate: 0,
      lowStockThreshold: 10,
      primaryColor: "#4f46e5",
      enableNotifications: true,
    }
  })

  // Wait for all promises to resolve
  const [products, sales, settings] = await Promise.all([productsPromise, salesPromise, settingsPromise])

  // Calculate stats with proper null checks and defaults
  const totalSales = sales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0)
  const totalProducts = products.length
  const lowStockItems = products.filter(
    (product) =>
      product.stock !== undefined && product.stock !== null && product.stock < (settings.lowStockThreshold || 10),
  ).length
  const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0

  // Calculate sales growth with proper date handling
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthSales = sales
    .filter((sale) => {
      if (!sale.date) return false
      try {
        const saleDate = new Date(sale.date)
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
      } catch (error) {
        console.error("Error parsing sale date:", error)
        return false
      }
    })
    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

  const previousMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear

  const previousMonthSales = sales
    .filter((sale) => {
      if (!sale.date) return false
      try {
        const saleDate = new Date(sale.date)
        return saleDate.getMonth() === previousMonth && saleDate.getFullYear() === previousYear
      } catch (error) {
        console.error("Error parsing sale date:", error)
        return false
      }
    })
    .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

  // Calculate growth percentage with safeguards against division by zero
  const salesGrowth =
    previousMonthSales === 0
      ? currentMonthSales > 0
        ? 100
        : 0
      : ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100

  // Get total customers with proper null checks
  const uniqueCustomers = new Set(
    sales.map((sale) => sale.customerId).filter((id) => id !== undefined && id !== null && id !== ""),
  ).size

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your {settings.storeName} monitoring dashboard.</p>
        </div>
        <Link href="/add-product">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats
          totalSales={totalSales}
          totalProducts={totalProducts}
          lowStockItems={lowStockItems}
          averageOrderValue={averageOrderValue}
          salesGrowth={salesGrowth}
          uniqueCustomers={uniqueCustomers}
          currencySymbol={settings.currencySymbol || "$"}
        />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5 card-hover">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Your sales performance for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <Suspense fallback={<div className="h-full flex items-center justify-center">Loading chart...</div>}>
              <EnhancedSalesChart selectedCategory="all" />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 card-hover">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">This Month</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(currentMonthSales, settings.currencySymbol || "$")}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Total Customers</p>
                  <p className="text-2xl font-bold">{uniqueCustomers}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Total Orders</p>
                  <p className="text-2xl font-bold">{sales.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent-sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-sales">Recent Sales</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="recent-sales" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Sales History</CardTitle>
              <CardDescription>Your most recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="py-6">Loading recent sales...</div>}>
                <FilteredRecentSales selectedCategory="all" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Products that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products
                  .filter(
                    (product) =>
                      product.stock !== undefined &&
                      product.stock !== null &&
                      product.stock < (settings.lowStockThreshold || 10),
                  )
                  .slice(0, 8)
                  .map((product) => (
                    <div key={product.id} className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          product.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        <span className="text-sm font-medium">{product.stock}</span>
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="ml-auto font-medium">
                        {formatCurrency(product.price || 0, settings.currencySymbol || "$")}
                      </div>
                    </div>
                  ))}
                {products.filter(
                  (product) =>
                    product.stock !== undefined &&
                    product.stock !== null &&
                    product.stock < (settings.lowStockThreshold || 10),
                ).length > 8 && (
                  <Link href="/stock-alerts">
                    <Button variant="outline" className="w-full">
                      View All Alerts
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
