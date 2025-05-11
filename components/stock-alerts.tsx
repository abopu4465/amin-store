"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/product"
import { AlertTriangle } from "lucide-react"

interface StockAlertsProps {
  products: Product[]
  lowStockThreshold?: number
}

export default function StockAlerts({ products, lowStockThreshold = 10 }: StockAlertsProps) {
  const lowStockProducts = products.filter((product) => product.quantity <= lowStockThreshold)

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Stock Alerts</CardTitle>
          <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20">
            {lowStockProducts.length} Items
          </Badge>
        </div>
        <CardDescription>Products that need restocking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <Badge variant={product.quantity <= 5 ? "destructive" : "secondary"} className="ml-auto">
                  {product.quantity} left
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No low stock items</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
