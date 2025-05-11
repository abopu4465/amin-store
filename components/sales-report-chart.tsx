"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
  Cell,
} from "recharts"
import type { Sale } from "@/types/sale"
import { format, getWeek, parseISO, isThisWeek, isThisMonth, isToday } from "date-fns"
import { ChartTooltip } from "./chart-tooltip"
import { formatCurrency } from "@/lib/utils/date-formatter"

interface SalesReportChartProps {
  sales: Sale[]
  reportType: string
}

export function SalesReportChart({ sales, reportType }: SalesReportChartProps) {
  const [animationActive, setAnimationActive] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimationActive(true)
    }, 100)
  }, [])

  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) {
      return []
    }

    const dataMap = new Map()

    sales.forEach((sale) => {
      const date = parseISO(sale.date)
      let key
      let isCurrent = false

      if (reportType === "daily") {
        key = format(date, "MMM dd")
        isCurrent = isToday(date)
      } else if (reportType === "weekly") {
        const weekNumber = getWeek(date)
        key = `Week ${weekNumber}`
        isCurrent = isThisWeek(date)
      } else if (reportType === "monthly") {
        key = format(date, "MMM yyyy")
        isCurrent = isThisMonth(date)
      }

      if (dataMap.has(key)) {
        const existing = dataMap.get(key)
        dataMap.set(key, {
          ...existing,
          total: existing.total + sale.totalAmount,
          isCurrent: existing.isCurrent || isCurrent,
        })
      } else {
        dataMap.set(key, {
          name: key,
          total: sale.totalAmount,
          isCurrent,
        })
      }
    })

    return Array.from(dataMap.values())
      .map((item) => ({
        ...item,
        total: Number.parseFloat(item.total.toFixed(2)),
      }))
      .sort((a, b) => {
        // Sort by date for daily reports
        if (reportType === "daily") {
          return new Date(a.name).getTime() - new Date(b.name).getTime()
        }
        // Sort by week number for weekly reports
        if (reportType === "weekly") {
          return Number.parseInt(a.name.split(" ")[1]) - Number.parseInt(b.name.split(" ")[1])
        }
        // Sort by month for monthly reports
        return 0
      })
  }, [sales, reportType])

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        No sales data available for the selected period
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-lg p-2 transition-all duration-500 ease-in-out">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          className="[&_.recharts-cartesian-grid-horizontal_line:last-child]:stroke-0"
          onMouseMove={(e) => {
            if (e.activeTooltipIndex !== undefined) {
              setHoveredIndex(e.activeTooltipIndex)
            }
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8} />
            </linearGradient>
            <filter id="shadow-bar" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.3" />
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
          <Tooltip
            content={
              <ChartTooltip
                labelFormatter={(label) => {
                  if (reportType === "daily") return `Date: ${label}`
                  if (reportType === "weekly") return `${label}`
                  return `Month: ${label}`
                }}
              />
            }
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
          <Bar
            dataKey="total"
            name="Revenue"
            radius={[6, 6, 0, 0]}
            barSize={reportType === "monthly" ? 40 : 30}
            animationDuration={1500}
            animationBegin={0}
            isAnimationActive={animationActive}
            filter="url(#shadow-bar)"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isCurrent ? "#4F46E5" : hoveredIndex === index ? "#7C3AED" : "url(#barGradient)"}
                className="transition-all duration-300"
              />
            ))}
            <LabelList
              dataKey="total"
              position="top"
              formatter={(value: number) => formatCurrency(value)}
              style={{ fontSize: "10px", fill: "hsl(var(--foreground))" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
