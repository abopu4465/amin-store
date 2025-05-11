import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { getAllProducts } from "@/lib/firebase/products"

export default async function StockAlertsPage() {
  const products = await getAllProducts()
  const lowStockProducts = products.filter((product) => product.stock < 10)
  const outOfStockProducts = products.filter((product) => product.stock === 0)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Alerts</h1>
        <p className="text-muted-foreground">Monitor and manage products that need attention</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-amber-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" /> +2
              </span>
              from last week
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-destructive flex items-center">
                <ArrowUpRight className="h-3 w-3" /> +1
              </span>
              from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>Products with stock levels below the threshold (10 items)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-5 p-4 font-medium border-b">
              <div className="col-span-2">Product</div>
              <div className="text-center">Category</div>
              <div className="text-center">Stock</div>
              <div className="text-right">Action</div>
            </div>
            <div className="divide-y">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="grid grid-cols-5 p-4 items-center">
                    <div className="col-span-2 font-medium">{product.name}</div>
                    <div className="text-center capitalize">{product.category}</div>
                    <div className="text-center">
                      <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <Link href={`/edit-product/${product.id}`}>
                        <Button variant="outline" size="sm">
                          Update Stock
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">No low stock products found</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
