"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, LineChart, PieChart } from "lucide-react"
import { useEffect } from "react"
import { getAllProducts } from "@/lib/firebase/products"
import { getSales } from "@/lib/firebase/sales"
import { EnhancedSalesChart } from "@/components/enhanced-sales-chart"
import { ProductSalesChart } from "@/components/product-sales-chart"
import { SalesReportChart } from "@/components/sales-report-chart"
import type { Product } from "@/types/product"
import type { Sale } from "@/types/sale"

export default function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [reportType, setReportType] = useState("daily")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, salesData] = await Promise.all([getAllProducts(), getSales()])
        setProducts(productsData)
        setSales(salesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate some basic analytics
  const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0)
  const totalProducts = products.length
  const totalTransactions = sales.length
  const averageOrderValue = totalSales / (totalTransactions || 1)

  // Get categories for analysis
  const categories = [...new Set(products.map((product) => product.category))]

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Analyze your store performance and make data-driven decisions</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <LineChart className="h-4 w-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime sales</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>Your sales performance over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">Loading...</div>
              ) : (
                <SalesReportChart sales={sales} reportType={reportType} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top selling products by revenue</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">Loading...</div>
                ) : (
                  <ProductSalesChart sales={sales} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
                <CardDescription>Distribution of products across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                    {categories.map((category) => {
                      const count = products.filter((p) => p.category === category).length
                      const percentage = ((count / totalProducts) * 100).toFixed(1)
                      return (
                        <div key={category} className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <span className="capitalize font-medium">{category}</span>
                            <div className="text-xs text-muted-foreground mt-1">{percentage}% of inventory</div>
                          </div>
                          <Badge variant="secondary">{count} products</Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Overview of your current inventory levels</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">Loading...</div>
              ) : (
                <EnhancedSalesChart selectedCategory={selectedCategory} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
