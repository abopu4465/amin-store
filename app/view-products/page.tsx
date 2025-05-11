"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react"
import { deleteProduct, getAllProducts } from "@/lib/firebase/products"
import type { Product } from "@/types/product"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ViewProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts()
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let result = [...products]

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query),
      )
    }

    setFilteredProducts(result)
  }, [products, searchQuery, categoryFilter])

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    setIsDeleting(true)
    try {
      await deleteProduct(deleteProductId)
      setProducts(products.filter((product) => product.id !== deleteProductId))
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteProductId(null)
    }
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/edit-product/${productId}`)
  }

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Out of Stock", variant: "destructive" }
    if (stock < 10) return { label: "Low Stock", variant: "warning" }
    return { label: "In Stock", variant: "success" }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "electronics":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "furniture":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "clothing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "food":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "home":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      case "beauty":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => router.push("/add-product")} className="z-10">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage your product inventory, edit details, or remove products.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="food">Food & Beverages</SelectItem>
                <SelectItem value="home">Home & Kitchen</SelectItem>
                <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found. Try adjusting your filters or add a new product.
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock)
                    const categoryClass = getCategoryBadgeColor(product.category)

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-12 w-12 rounded-md border overflow-hidden">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg"
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryClass}`}
                          >
                            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{product.stock}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              stockStatus.variant === "success"
                                ? "default"
                                : stockStatus.variant === "warning"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(product.id)}
                              className="mr-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteProductId(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
