export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Sale {
  id: string
  items: SaleItem[]
  totalAmount: number
  date: string
}
