"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, MinusCircle, PlusCircle, Search } from "lucide-react"
import { getAllProducts } from "@/lib/firebase/products"
import { addSale, updateProductStock } from "@/lib/firebase/sales"
import type { Product } from "@/types/product"
import { useCrossPlatform } from "@/hooks/use-cross-platform"

type CartItem = {
  product: Product
  quantity: number
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { deviceType, isTouchDevice } = useCrossPlatform()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts()
        // Only show products with stock > 0
        const inStockProducts = productsData.filter((p) => p.stock > 0)
        setProducts(inStockProducts)
        setFilteredProducts(inStockProducts)
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(
        (product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [products, searchQuery])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)

      if (existingItem) {
        // Don't exceed available stock
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Maximum Stock Reached",
            description: `You can't add more than ${product.stock} units of this product.`,
            variant: "destructive",
          })
          return prevCart
        }

        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId)

    if (!product) return

    if (newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available.`,
        variant: "destructive",
      })
      return
    }

    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add products to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Create sale record
      const saleData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
        totalAmount: calculateTotal(),
        date: new Date().toISOString(),
      }

      await addSale(saleData)

      // Update product stock
      for (const item of cart) {
        const newStock = item.product.stock - item.quantity
        await updateProductStock(item.product.id, newStock)
      }

      // Update local products state
      setProducts(
        (prevProducts) =>
          prevProducts
            .map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id)
              if (cartItem) {
                return {
                  ...product,
                  stock: product.stock - cartItem.quantity,
                }
              }
              return product
            })
            .filter((product) => product.stock > 0), // Remove out of stock products
      )

      // Clear cart
      setCart([])

      toast({
        title: "Sale Completed",
        description: `Sale of $${calculateTotal().toFixed(2)} has been recorded.`,
      })
    } catch (error) {
      console.error("Error processing sale:", error)
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Determine if we should use larger touch targets
  const buttonSize = isTouchDevice ? "lg" : "default"
  const iconButtonClass = isTouchDevice ? "h-10 w-10" : "h-8 w-8"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sales</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:order-2">
          <CardHeader>
            <CardTitle>Shopping Cart</CardTitle>
            <CardDescription>Items ready for checkout</CardDescription>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Your cart is empty. Add products from the list.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className={`rounded-r-none ${iconButtonClass}`}
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.product.stock}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product.id, Number.parseInt(e.target.value) || 1)}
                              className="h-10 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              aria-label="Quantity"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className={`rounded-l-none ${iconButtonClass}`}
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`text-destructive ${iconButtonClass}`}
                            onClick={() => removeFromCart(item.product.id)}
                            aria-label="Remove item"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-between w-full text-lg font-semibold">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              size={buttonSize}
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Sale"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:order-1">
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Select products to add to the cart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products found. Try adjusting your search.
                </div>
              ) : (
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md border overflow-hidden flex-shrink-0">
                                {product.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={product.imageUrl || "/placeholder.svg"}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/placeholder.svg?height=40&width=40"
                                    }}
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                    No image
                                  </div>
                                )}
                              </div>
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{product.category}</TableCell>
                          <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{product.stock}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={iconButtonClass}
                              onClick={() => addToCart(product)}
                              aria-label={`Add ${product.name} to cart`}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
