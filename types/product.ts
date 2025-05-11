export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}
