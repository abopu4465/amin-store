export interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  currencySymbol: string
  taxRate: number
  primaryColor: string
  enableNotifications: boolean
  lowStockThreshold: number
  createdAt?: number
  updatedAt?: number
}

export const defaultSettings: StoreSettings = {
  storeName: "Amin Store",
  storeEmail: "contact@aminstore.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Store Street, City, Country",
  currency: "BDT",
  currencySymbol: "৳",
  taxRate: 7.5,
  primaryColor: "#0f766e", // Teal-700
  enableNotifications: true,
  lowStockThreshold: 5,
}
