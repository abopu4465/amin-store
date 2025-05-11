"use client"

import type { Sale } from "@/types/sale"
import { formatDateForDisplay } from "@/lib/utils/date-formatter"
import { Chart, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem } from "@/components/ui/chart"
import { Area, Bar, ComposedChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface SalesChartProps {
  sales: Sale[]
}

export default function SalesChart({ sales }: SalesChartProps) {
  // Group sales by date
  const salesByDate = sales.reduce(
    (acc, sale) => {
      const date = formatDateForDisplay(sale.date, "MMM dd")

      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          items: 0,
        }
      }

      acc[date].total += sale.amount
      acc[date].items += sale.quantity || 1

      return acc
    },
    {} as Record<string, { date: string; total: number; items: number }>,
  )

  // Convert to array and sort by date
  const chartData = Object.values(salesByDate).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <Chart
      className="h-[300px]"
      config={{
        revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
        items: { label: "Items Sold", color: "hsl(var(--chart-2))" },
      }}
    >
      <ChartLegend className="justify-center gap-8">
        <ChartLegendItem>Revenue</ChartLegendItem>
        <ChartLegendItem>Items Sold</ChartLegendItem>
      </ChartLegend>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip
            content={<ChartTooltipContent className="border-none bg-background/80 backdrop-blur-sm" nameKey="name" />}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="total"
            name="Revenue"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="hsl(var(--chart-1) / 0.2)"
          />
          <Bar
            yAxisId="right"
            dataKey="items"
            name="Items Sold"
            fill="hsl(var(--chart-2))"
            radius={[4, 4, 0, 0]}
            barSize={16}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Chart>
  )
}
