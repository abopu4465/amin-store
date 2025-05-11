import { db } from "./config"
import { ref, get, set, push, update, onValue, off, query, orderByChild, startAt, endAt } from "firebase/database"
import type { Sale } from "@/types/sale"

// Add a new sale
export const addSale = async (saleData: Omit<Sale, "id">): Promise<string> => {
  try {
    const salesRef = ref(db, "sales")
    const newSaleRef = push(salesRef)
    await set(newSaleRef, {
      ...saleData,
      date: saleData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
    return newSaleRef.key as string
  } catch (error) {
    console.error("Error adding sale:", error)
    throw error
  }
}

// Get all sales
export const getSales = async (): Promise<Sale[]> => {
  try {
    const salesRef = ref(db, "sales")
    const snapshot = await get(salesRef)

    if (!snapshot.exists()) {
      return []
    }

    const salesData = snapshot.val()
    return Object.entries(salesData).map(([id, data]) => {
      const saleData = data as Omit<Sale, "id">
      return {
        id,
        customerId: saleData.customerId || "",
        customerName: saleData.customerName || "",
        items: saleData.items || [],
        totalAmount: saleData.totalAmount || 0,
        date: saleData.date || new Date().toISOString(),
        paymentMethod: saleData.paymentMethod || "cash",
        status: saleData.status || "completed",
        notes: saleData.notes || "",
        createdAt: saleData.createdAt || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return []
  }
}

// Get sales by date range
export const getSalesByDateRange = async (startDate: string, endDate: string): Promise<Sale[]> => {
  try {
    const salesRef = ref(db, "sales")
    const salesQuery = query(salesRef, orderByChild("date"), startAt(startDate), endAt(endDate))

    const snapshot = await get(salesQuery)

    if (!snapshot.exists()) {
      return []
    }

    const salesData = snapshot.val()
    return Object.entries(salesData).map(([id, data]) => {
      const saleData = data as Omit<Sale, "id">
      return {
        id,
        customerId: saleData.customerId || "",
        customerName: saleData.customerName || "",
        items: saleData.items || [],
        totalAmount: saleData.totalAmount || 0,
        date: saleData.date || new Date().toISOString(),
        paymentMethod: saleData.paymentMethod || "cash",
        status: saleData.status || "completed",
        notes: saleData.notes || "",
        createdAt: saleData.createdAt || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching sales by date range:", error)
    return []
  }
}

// Update product stock after a sale
export const updateProductStock = async (productId: string, newStock: number): Promise<void> => {
  try {
    const productRef = ref(db, `products/${productId}`)
    await update(productRef, {
      stock: newStock,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw error
  }
}

// Subscribe to real-time sales updates
export const subscribeToSales = (callback: (sales: Sale[]) => void) => {
  const salesRef = ref(db, "sales")

  const handleSnapshot = (snapshot: any) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const salesData = snapshot.val()
    const sales = Object.entries(salesData).map(([id, data]) => {
      const saleData = data as Omit<Sale, "id">
      return {
        id,
        customerId: saleData.customerId || "",
        customerName: saleData.customerName || "",
        items: saleData.items || [],
        totalAmount: saleData.totalAmount || 0,
        date: saleData.date || new Date().toISOString(),
        paymentMethod: saleData.paymentMethod || "cash",
        status: saleData.status || "completed",
        notes: saleData.notes || "",
        createdAt: saleData.createdAt || new Date().toISOString(),
      }
    })

    callback(sales)
  }

  onValue(salesRef, handleSnapshot)

  // Return unsubscribe function
  return () => off(salesRef, "value", handleSnapshot)
}

// Subscribe to sales by date range
export const subscribeToSalesByDateRange = (startDate: string, endDate: string, callback: (sales: Sale[]) => void) => {
  const salesRef = ref(db, "sales")
  const salesQuery = query(salesRef, orderByChild("date"), startAt(startDate), endAt(endDate))

  const handleSnapshot = (snapshot: any) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const salesData = snapshot.val()
    const sales = Object.entries(salesData).map(([id, data]) => {
      const saleData = data as Omit<Sale, "id">
      return {
        id,
        customerId: saleData.customerId || "",
        customerName: saleData.customerName || "",
        items: saleData.items || [],
        totalAmount: saleData.totalAmount || 0,
        date: saleData.date || new Date().toISOString(),
        paymentMethod: saleData.paymentMethod || "cash",
        status: saleData.status || "completed",
        notes: saleData.notes || "",
        createdAt: saleData.createdAt || new Date().toISOString(),
      }
    })

    callback(sales)
  }

  onValue(salesQuery, handleSnapshot)

  // Return unsubscribe function
  return () => off(salesQuery, "value", handleSnapshot)
}
