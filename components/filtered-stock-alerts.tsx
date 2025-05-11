"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { getAllProducts } from "@/lib/firebase/products"
import type { Product } from "@/types/product"

interface FilteredStockAlertsProps {
  selectedCategory: string
}

export function FilteredStockAlerts({ selectedCategory }: FilteredStockAlertsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts()

        // Filter by category if needed
        let filteredProducts =
          selectedCategory === "all"
            ? productsData
            : productsData.filter((product) => product.category === selectedCategory)

        // Filter for low stock products (less than 10 items)
        filteredProducts = filteredProducts.filter((product) => product.stock < 10).sort((a, b) => a.stock - b.stock)

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()

    // Set up real-time updates
    const interval = setInterval(fetchProducts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedCategory])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No low stock products found in{" "}
        {selectedCategory === "all" ? "any category" : `the ${selectedCategory} category`}.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-center">Stock</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="capitalize">{product.category}</TableCell>
            <TableCell className="text-center">{product.stock}</TableCell>
            <TableCell className="text-center">
              <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                {product.stock === 0 ? "Out of Stock" : "Low Stock"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/edit-product/${product.id}`}>
                <Button variant="outline" size="sm">
                  Update Stock
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
