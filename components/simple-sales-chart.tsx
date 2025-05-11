"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Loader2 } from "lucide-react"
import { getSales } from "@/lib/firebase/sales"
import { format, subDays } from "date-fns"
import { InteractiveTooltip } from "./interactive-tooltip"

interface SimpleSalesChartProps {
  selectedCategory: string
}

export function SimpleSalesChart({ selectedCategory }: SimpleSalesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        const salesData = await getSales()

        // Get the last 14 days (simplified from 30)
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), 13 - i)
          return {
            date: format(date, "MMM dd"),
            rawDate: date,
            sales: 0,
          }
        })

        // Filter sales by category if needed
        const filteredSales =
          selectedCategory === "all"
            ? salesData
            : salesData.filter((sale) => {
                return sale.items.some((item) => {
                  // This is a simplification - in a real app, you'd need to fetch product data
                  // to determine the category
                  return item.productId.includes(selectedCategory)
                })
              })

        // Aggregate sales by day
        filteredSales.forEach((sale) => {
          const saleDate = new Date(sale.date)
          const dayIndex = last14Days.findIndex(
            (day) => format(day.rawDate, "yyyy-MM-dd") === format(saleDate, "yyyy-MM-dd"),
          )

          if (dayIndex !== -1) {
            last14Days[dayIndex].sales += sale.totalAmount
          }
        })

        // Format data for chart
        const chartData = last14Days.map((day) => ({
          name: day.date,
          value: Number.parseFloat(day.sales.toFixed(2)),
        }))

        setData(chartData)
      } catch (error) {
        console.error("Error fetching sales:", error)
        // Set empty data instead of failing
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), 13 - i)
          return {
            name: format(date, "MMM dd"),
            value: 0,
          }
        })
        setData(last14Days)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSales()

    // Set up real-time updates
    const interval = setInterval(fetchSales, 30000) // Refresh every 30 seconds
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
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<InteractiveTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          name="Sales"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorSales)"
          activeDot={{ r: 8, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
