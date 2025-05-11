"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getProductById, updateProduct } from "@/lib/firebase/products"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, LinkIcon } from "lucide-react"
import { uploadProductImage } from "@/lib/firebase/storage"
import type { Product } from "@/types/product"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload")
  const [imageUrl, setImageUrl] = useState<string>("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(id)
        if (!productData) {
          toast({
            title: "Error",
            description: "Product not found.",
            variant: "destructive",
          })
          router.push("/view-products")
          return
        }

        setProduct(productData)

        // Determine if the existing image is a URL or an uploaded file
        if (productData.imageUrl) {
          if (productData.imageUrl.startsWith("http")) {
            setImageSource("url")
            setImageUrl(productData.imageUrl)
          } else {
            setImageSource("upload")
          }
          setImagePreview(productData.imageUrl)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        })
        router.push("/view-products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
    setImagePreview(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string
      const category = formData.get("category") as string
      const price = Number.parseFloat(formData.get("price") as string)
      const stock = Number.parseInt(formData.get("stock") as string)
      const description = formData.get("description") as string

      let finalImageUrl = product?.imageUrl || ""

      if (imageSource === "upload" && imageFile) {
        finalImageUrl = await uploadProductImage(imageFile)
      } else if (imageSource === "url" && imageUrl) {
        finalImageUrl = imageUrl
      }

      await updateProduct(id, {
        name,
        category,
        price,
        stock,
        description,
        imageUrl: finalImageUrl,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      })

      router.push("/view-products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-muted-foreground mt-2">The product you are looking for does not exist.</p>
        <Button className="mt-4" onClick={() => router.push("/view-products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Update the details of your product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" placeholder="Enter product name" defaultValue={product.name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={product.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  defaultValue={product.price}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={product.stock}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter product description"
                defaultValue={product.description || ""}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <RadioGroup
                defaultValue={imageSource}
                className="flex flex-col space-y-1"
                onValueChange={(value) => setImageSource(value as "upload" | "url")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload" className="font-normal cursor-pointer">
                    Upload Image
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="url" />
                  <Label htmlFor="url" className="font-normal cursor-pointer">
                    Image URL
                  </Label>
                </div>
              </RadioGroup>

              {imageSource === "upload" ? (
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full h-24 border-dashed flex flex-col gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>{product.imageUrl ? "Change Image" : "Upload Image"}</span>
                  </Button>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imagePreview && imageSource === "upload" && (
                    <div className="h-24 w-24 relative border rounded-md overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="pl-8"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                      />
                    </div>
                  </div>
                  {imagePreview && imageSource === "url" && (
                    <div className="h-40 w-full relative border rounded-md overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        className="h-full w-full object-contain"
                        onError={() => setImagePreview("/placeholder.svg")}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/view-products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
