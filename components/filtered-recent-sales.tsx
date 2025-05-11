"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { getSales } from "@/lib/firebase/sales"
import { getAllProducts } from "@/lib/firebase/products"
import type { Sale } from "@/types/sale"
import type { Product } from "@/types/product"
import { format } from "date-fns"

interface FilteredRecentSalesProps {
  selectedCategory: string
}

export function FilteredRecentSales({ selectedCategory }: FilteredRecentSalesProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, productsData] = await Promise.all([getSales(), getAllProducts()])
        setProducts(productsData)

        // Filter sales by category if needed
        let filteredSales = salesData

        if (selectedCategory !== "all") {
          filteredSales = salesData.filter((sale) => {
            return sale.items.some((item) => {
              const product = productsData.find((p) => p.id === item.productId)
              return product?.category === selectedCategory
            })
          })
        }

        // Sort by date (newest first) and take the 5 most recent
        const recentSales = filteredSales
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        setSales(recentSales)
      } catch (error) {
        console.error("Error fetching sales:", error)
        setSales([])
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
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent sales found for {selectedCategory === "all" ? "any category" : `the ${selectedCategory} category`}.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => {
        // Get the first item for display
        const firstItem = sale.items[0]
        const additionalItems = sale.items.length - 1

        // Get the product category for the first item
        const product = products.find((p) => p.id === firstItem.productId)
        const category = product?.category || "Unknown"

        return (
          <div key={sale.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{firstItem.productName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {firstItem.productName}
                {additionalItems > 0 && ` + ${additionalItems} more`}
              </p>
              <div className="flex items-center text-xs text-muted-foreground gap-2">
                <span>{format(new Date(sale.date), "MMM dd, yyyy HH:mm")}</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                  {category}
                </span>
              </div>
            </div>
            <div className="ml-auto font-medium">+${sale.totalAmount.toFixed(2)}</div>
          </div>
        )
      })}
    </div>
  )
}
