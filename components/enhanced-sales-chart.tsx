"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from "recharts"
import { Loader2 } from "lucide-react"
import { getSales } from "@/lib/firebase/sales"
import { getAllProducts } from "@/lib/firebase/products"
import type { Sale } from "@/types/sale"
import type { Product } from "@/types/product"
import { format, subDays, isToday } from "date-fns"
import { ChartTooltip } from "./chart-tooltip"
import { formatCurrency } from "@/lib/utils/date-formatter"

interface EnhancedSalesChartProps {
  selectedCategory: string
}

export function EnhancedSalesChart({ selectedCategory }: EnhancedSalesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [averageSales, setAverageSales] = useState<number>(0)
  const [animationActive, setAnimationActive] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [salesData, productsData] = await Promise.all([getSales(), getAllProducts()])
        setProducts(productsData)

        // Get the last 30 days
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), 29 - i)
          return {
            date: format(date, "MMM dd"),
            rawDate: date,
            sales: 0,
            transactions: 0,
          }
        })

        // Filter sales by category if needed
        const filteredSales =
          selectedCategory === "all"
            ? salesData
            : salesData.filter((sale) => {
                return sale.items.some((item) => {
                  const product = productsData.find((p) => p.id === item.productId)
                  return product?.category === selectedCategory
                })
              })

        // Aggregate sales by day
        filteredSales.forEach((sale: Sale) => {
          const saleDate = new Date(sale.date)
          const dayIndex = last30Days.findIndex(
            (day) => format(day.rawDate, "yyyy-MM-dd") === format(saleDate, "yyyy-MM-dd"),
          )

          if (dayIndex !== -1) {
            last30Days[dayIndex].sales += sale.totalAmount
            last30Days[dayIndex].transactions += 1
          }
        })

        // Calculate average daily sales
        const totalSales = last30Days.reduce((sum, day) => sum + day.sales, 0)
        const avgSales = totalSales / last30Days.length
        setAverageSales(avgSales)

        // Format data for chart
        const chartData = last30Days.map((day) => ({
          name: day.date,
          total: Number.parseFloat(day.sales.toFixed(2)),
          transactions: day.transactions,
          isToday: isToday(day.rawDate),
        }))

        setData(chartData)

        // Trigger animation after data is loaded
        setTimeout(() => {
          setAnimationActive(true)
        }, 100)
      } catch (error) {
        console.error("Error fetching sales:", error)
        // Set empty data instead of failing
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), 29 - i)
          return {
            name: format(date, "MMM dd"),
            total: 0,
            transactions: 0,
            isToday: isToday(date),
          }
        })
        setData(last30Days)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time updates
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedCategory])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-lg p-2 transition-all duration-500 ease-in-out">
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          className="[&_.recharts-cartesian-grid-horizontal_line:last-child]:stroke-0"
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
            </linearGradient>
            <filter id="shadow" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#4F46E5" floodOpacity="0.3" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            dy={10}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `৳${value}`}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            width={60}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
          <ReferenceLine
            y={averageSales}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            label={{
              value: `Avg: ${formatCurrency(averageSales)}`,
              position: "right",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Sales"
            stroke="#4F46E5"
            fillOpacity={1}
            fill="url(#colorTotal)"
            strokeWidth={3}
            filter="url(#shadow)"
            activeDot={{
              r: 8,
              strokeWidth: 1,
              stroke: "hsl(var(--background))",
              style: { fill: "#4F46E5", opacity: 1 },
            }}
            dot={(props) => {
              const { cx, cy, payload } = props
              return payload.isToday ? (
                <circle cx={cx} cy={cy} r={6} fill="#4F46E5" stroke="hsl(var(--background))" strokeWidth={2} />
              ) : null
            }}
            isAnimationActive={animationActive}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
