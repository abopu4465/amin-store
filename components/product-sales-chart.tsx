"use client"

import { useMemo, useState, useEffect } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"
import type { Sale } from "@/types/sale"
import { ChartTooltip } from "./chart-tooltip"
import { formatCurrency } from "@/lib/utils/date-formatter"

interface ProductSalesChartProps {
  sales: Sale[]
}

export function ProductSalesChart({ sales }: ProductSalesChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [animationActive, setAnimationActive] = useState(false)

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

    const productMap = new Map<string, { name: string; value: number }>()

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (productMap.has(item.productId)) {
          const product = productMap.get(item.productId)!
          product.value += item.total
        } else {
          productMap.set(item.productId, {
            name: item.productName,
            value: item.total,
          })
        }
      })
    })

    return Array.from(productMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 products
  }, [sales])

  const COLORS = [
    "#4F46E5", // Indigo
    "#7C3AED", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#10B981", // Emerald
  ]

  if (chartData.length === 0) {
    return <div className="flex justify-center items-center h-full text-muted-foreground">No sales data available</div>
  }

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          filter="url(#shadow-pie)"
        />
      </g>
    )
  }

  return (
    <div className="w-full h-full rounded-lg p-2 transition-all duration-500 ease-in-out">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <filter id="shadow-pie" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.3" />
            </filter>
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={1500}
            animationBegin={0}
            isAnimationActive={animationActive}
            paddingAngle={4}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                strokeWidth={1}
                stroke="hsl(var(--background))"
              />
            ))}
          </Pie>
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value, name) => [
                  formatCurrency(value),
                  `${name} (${((value / totalValue) * 100).toFixed(1)}%)`,
                ]}
              />
            }
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry: any, index) => (
              <span
                className={`text-sm ${activeIndex === index ? "font-bold" : "font-medium"}`}
                style={{ color: entry.color }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
