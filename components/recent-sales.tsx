"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateForDisplay } from "@/lib/utils/date-formatter"
import { getSales } from "@/lib/firebase/sales"
import { getProductById } from "@/lib/firebase/products"
import type { Sale } from "@/types/sale"
import { Loader2 } from "lucide-react"

// Add a type for sale items with product image
type EnhancedSaleItem = {
  id: string
  productId: string
  productName: string
  productImage?: string
  quantity: number
  price: number
  total: number
}

type EnhancedSale = Omit<Sale, "items"> & {
  items: EnhancedSaleItem[]
}

export default function RecentSales() {
  const [sales, setSales] = useState<EnhancedSale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesData = await getSales()
        // Sort by date (newest first) and take the 5 most recent
        const recentSales = salesData
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        // Enhance sales with product images
        const enhancedSales = await Promise.all(
          recentSales.map(async (sale) => {
            const enhancedItems = await Promise.all(
              sale.items.map(async (item) => {
                // Get product details to get the image
                const product = await getProductById(item.productId)
                return {
                  ...item,
                  productImage: product?.imageUrl,
                } as EnhancedSaleItem
              }),
            )

            return {
              ...sale,
              items: enhancedItems,
            } as EnhancedSale
          }),
        )

        setSales(enhancedSales)
      } catch (error) {
        console.error("Error fetching sales:", error)
        // Just set empty sales array instead of failing
        setSales([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSales()
  }, [])

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Loading recent sales data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (sales.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>No recent sales found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent sales found. Start selling to see data here!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1 lg:col-span-2 card-hover">
      <CardHeader className="pb-3">
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>You made {sales.length} sales recently</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sales.map((sale) => {
            // Get the first item for display
            const firstItem = sale.items[0]
            const additionalItems = sale.items.length - 1

            return (
              <div key={sale.id} className="flex items-center">
                <Avatar className="h-9 w-9 border border-primary/10">
                  {firstItem?.productImage ? (
                    <AvatarImage
                      src={firstItem.productImage || "/placeholder.svg"}
                      alt={firstItem.productName}
                      onError={(e) => {
                        // If image fails to load, fallback will be shown automatically
                        console.error("Error loading product image:", e)
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {firstItem ? firstItem.productName.substring(0, 2).toUpperCase() : "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {firstItem ? firstItem.productName : "Unknown Product"}
                    {additionalItems > 0 && ` + ${additionalItems} more`}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDateForDisplay(sale.date)}</p>
                </div>
                <div className="ml-auto font-medium">+${sale.totalAmount.toFixed(2)}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
