"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { format, subDays } from "date-fns"
import { getAllProducts } from "@/lib/firebase/products"
import { getSales } from "@/lib/firebase/sales"
import { SalesReportChart } from "@/components/sales-report-chart"
import { ProductSalesChart } from "@/components/product-sales-chart"
import { ReportExport } from "@/components/report-export"
import { formatCurrency } from "@/lib/utils/date-formatter"
import type { Sale } from "@/types/sale"
import type { Product } from "@/types/product"

export default function ReportPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("daily")
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [salesData, productsData] = await Promise.all([getSales(), getAllProducts()])

      // Filter sales by date range
      const filteredSales = salesData.filter((sale) => {
        const saleDate = new Date(sale.date)
        return saleDate >= dateRange.from && saleDate <= dateRange.to
      })

      setSales(filteredSales)
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange({
      from: range.from || dateRange.from,
      to: range.to || dateRange.to,
    })
  }

  const applyFilters = () => {
    fetchData()
  }

  // Calculate summary statistics
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalTransactions = sales.length
  const averageOrderValue = totalSales / (totalTransactions || 1)

  // Get categories for filtering
  const categories = products.length > 0 ? ["all", ...new Set(products.map((product) => product.category))] : ["all"]

  // Filter sales by category if needed
  const filteredSales =
    selectedCategory === "all"
      ? sales
      : sales.filter((sale) => {
          return sale.items.some((item) => {
            const product = products.find((p) => p.id === item.productId)
            return product?.category === selectedCategory
          })
        })

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and analyze sales reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="grid gap-2 flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal sm:w-[300px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          handleDateRangeChange(range)
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full sm:w-auto" onClick={applyFilters}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportExport sales={filteredSales} products={products} dateRange={dateRange} />

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Trends</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                {reportType === "daily"
                  ? "Daily sales breakdown"
                  : reportType === "weekly"
                    ? "Weekly sales breakdown"
                    : "Monthly sales breakdown"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <SalesReportChart sales={filteredSales} reportType={reportType} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Top selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ProductSalesChart sales={filteredSales} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
