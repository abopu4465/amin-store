"use client"

import { useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays } from "date-fns"
import { getSales } from "@/lib/firebase/sales"
import { getAllProducts } from "@/lib/firebase/products"
import { formatCurrency } from "@/lib/utils/date-formatter"
import { useSettings } from "@/app/settings-provider"
import { ChartTooltip } from "./chart-tooltip"
import { Loader2, CalendarIcon, BarChart3, LineChartIcon, PieChart } from "lucide-react"

export function InteractiveSalesChart() {
  const { settings } = useSettings()
  const [chartType, setChartType] = useState<"line" | "area" | "bar" | "composed">("area")
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly">("daily")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>(["all"])
  const [isLoading, setIsLoading] = useState(true)
  const [salesData, setSalesData] = useState<any[]>([])
  const [rawSales, setRawSales] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [animationActive, setAnimationActive] = useState(false)

  // Fetch sales and product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [salesResult, productsResult] = await Promise.all([getSales(), getAllProducts()])
        setRawSales(salesResult)
        setProducts(productsResult)

        // Extract categories
        const productCategories = ["all", ...new Set(productsResult.map((product) => product.category))]
        setCategories(productCategories)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Process sales data based on filters
  useEffect(() => {
    if (rawSales.length === 0) return

    const processData = () => {
      // Filter sales by date range
      const filteredByDate = rawSales.filter((sale) => {
        const saleDate = new Date(sale.date)
        return saleDate >= dateRange.from && saleDate <= dateRange.to
      })

      // Filter by category if needed
      const filteredSales =
        selectedCategory === "all"
          ? filteredByDate
          : filteredByDate.filter((sale) => {
              return sale.items.some((item: any) => {
                const product = products.find((p) => p.id === item.productId)
                return product?.category === selectedCategory
              })
            })

      // Group by timeframe
      const groupedData: Record<string, { date: string; sales: number; transactions: number; items: number }> = {}

      filteredSales.forEach((sale) => {
        const saleDate = new Date(sale.date)
        let dateKey

        if (timeFrame === "daily") {
          dateKey = format(saleDate, "yyyy-MM-dd")
        } else if (timeFrame === "weekly") {
          // Get the week number
          const weekNumber = Math.ceil(saleDate.getDate() / 7)
          dateKey = `${format(saleDate, "yyyy-MM")}-W${weekNumber}`
        } else {
          // Monthly
          dateKey = format(saleDate, "yyyy-MM")
        }

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date:
              timeFrame === "daily"
                ? format(saleDate, "MMM dd")
                : timeFrame === "weekly"
                  ? `Week ${Math.ceil(saleDate.getDate() / 7)}, ${format(saleDate, "MMM")}`
                  : format(saleDate, "MMM yyyy"),
            sales: 0,
            transactions: 0,
            items: 0,
          }
        }

        groupedData[dateKey].sales += sale.totalAmount
        groupedData[dateKey].transactions += 1
        groupedData[dateKey].items += sale.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      })

      // Convert to array and sort
      const result = Object.values(groupedData).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

      setSalesData(result)

      // Trigger animation after data is loaded
      setTimeout(() => {
        setAnimationActive(true)
      }, 100)
    }

    processData()
  }, [rawSales, dateRange, selectedCategory, timeFrame, products])

  // Custom tooltip formatter
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "sales") {
      return [formatCurrency(value, settings.currencySymbol, settings.currency), "Sales"]
    }
    return [value.toString(), name]
  }

  // Render the appropriate chart based on type
  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    const commonProps = {
      data: salesData,
      margin: { top: 20, right: 30, left: 20, bottom: 10 },
    }

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${settings.currencySymbol}${value}`}
              />
              <Tooltip content={<ChartTooltip />} formatter={formatTooltipValue} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, fill: "#4F46E5" }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                isAnimationActive={animationActive}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${settings.currencySymbol}${value}`}
              />
              <Tooltip content={<ChartTooltip />} formatter={formatTooltipValue} />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#colorSales)"
                strokeWidth={3}
                activeDot={{ r: 8, strokeWidth: 0 }}
                isAnimationActive={animationActive}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${settings.currencySymbol}${value}`}
              />
              <Tooltip content={<ChartTooltip />} formatter={formatTooltipValue} />
              <Legend />
              <Bar
                dataKey="sales"
                name="Sales"
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
                isAnimationActive={animationActive}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case "composed":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${settings.currencySymbol}${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} formatter={formatTooltipValue} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.2}
                isAnimationActive={animationActive}
                animationDuration={1500}
              />
              <Bar
                yAxisId="right"
                dataKey="transactions"
                name="Transactions"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                isAnimationActive={animationActive}
                animationDuration={1500}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="items"
                name="Items Sold"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, fill: "#F59E0B" }}
                isAnimationActive={animationActive}
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription>
              {timeFrame === "daily"
                ? "Daily sales performance"
                : timeFrame === "weekly"
                  ? "Weekly sales breakdown"
                  : "Monthly sales overview"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area" className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  <span>Area Chart</span>
                </SelectItem>
                <SelectItem value="line" className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  <span>Line Chart</span>
                </SelectItem>
                <SelectItem value="bar" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Bar Chart</span>
                </SelectItem>
                <SelectItem value="composed" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Composed</span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeFrame} onValueChange={(value: any) => setTimeFrame(value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Time Frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[130px]">
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
                    if (range?.from) {
                      setDateRange({
                        from: range.from,
                        to: range.to || range.from,
                      })
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
