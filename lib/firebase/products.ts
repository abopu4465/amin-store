import { db } from "./config"
import { ref, get, set, push, remove, update, onValue, off, query, orderByChild, equalTo } from "firebase/database"
import type { Product } from "@/types/product"

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = ref(db, "products")
    const snapshot = await get(productsRef)

    if (!snapshot.exists()) {
      return []
    }

    const productsData = snapshot.val()
    return Object.entries(productsData).map(([id, data]) => {
      // Ensure all required fields have default values
      const productData = data as Omit<Product, "id">
      return {
        id,
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price || 0,
        stock: productData.stock !== undefined ? productData.stock : 0,
        category: productData.category || "Uncategorized",
        imageUrl: productData.imageUrl || "",
        createdAt: productData.createdAt || new Date().toISOString(),
        updatedAt: productData.updatedAt || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const productsRef = ref(db, "products")
    const productsQuery = query(productsRef, orderByChild("category"), equalTo(category))
    const snapshot = await get(productsQuery)

    if (!snapshot.exists()) {
      return []
    }

    const productsData = snapshot.val()
    return Object.entries(productsData).map(([id, data]) => {
      // Ensure all required fields have default values
      const productData = data as Omit<Product, "id">
      return {
        id,
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price || 0,
        stock: productData.stock !== undefined ? productData.stock : 0,
        category: productData.category || "Uncategorized",
        imageUrl: productData.imageUrl || "",
        createdAt: productData.createdAt || new Date().toISOString(),
        updatedAt: productData.updatedAt || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching products by category:", error)
    return []
  }
}

// Get a product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const productRef = ref(db, `products/${id}`)
    const snapshot = await get(productRef)

    if (!snapshot.exists()) {
      return null
    }

    const productData = snapshot.val() as Omit<Product, "id">
    return {
      id,
      name: productData.name || "",
      description: productData.description || "",
      price: productData.price || 0,
      stock: productData.stock !== undefined ? productData.stock : 0,
      category: productData.category || "Uncategorized",
      imageUrl: productData.imageUrl || "",
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: productData.updatedAt || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return null
  }
}

// Add a new product
export const addProduct = async (productData: Omit<Product, "id">): Promise<string> => {
  try {
    const productsRef = ref(db, "products")
    const newProductRef = push(productsRef)
    await set(newProductRef, {
      ...productData,
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return newProductRef.key as string
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

// Update a product
export const updateProduct = async (id: string, productData: Partial<Omit<Product, "id">>): Promise<void> => {
  try {
    const productRef = ref(db, `products/${id}`)
    await update(productRef, {
      ...productData,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const productRef = ref(db, `products/${id}`)
    await remove(productRef)
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Subscribe to real-time product updates
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsRef = ref(db, "products")

  const handleSnapshot = (snapshot: any) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const productsData = snapshot.val()
    const products = Object.entries(productsData).map(([id, data]) => {
      // Ensure all required fields have default values
      const productData = data as Omit<Product, "id">
      return {
        id,
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price || 0,
        stock: productData.stock !== undefined ? productData.stock : 0,
        category: productData.category || "Uncategorized",
        imageUrl: productData.imageUrl || "",
        createdAt: productData.createdAt || new Date().toISOString(),
        updatedAt: productData.updatedAt || new Date().toISOString(),
      }
    })

    callback(products)
  }

  onValue(productsRef, handleSnapshot)

  // Return unsubscribe function
  return () => off(productsRef, "value", handleSnapshot)
}

// Subscribe to products by category
export const subscribeToProductsByCategory = (category: string, callback: (products: Product[]) => void) => {
  const productsRef = ref(db, "products")
  const productsQuery = query(productsRef, orderByChild("category"), equalTo(category))

  const handleSnapshot = (snapshot: any) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const productsData = snapshot.val()
    const products = Object.entries(productsData).map(([id, data]) => {
      // Ensure all required fields have default values
      const productData = data as Omit<Product, "id">
      return {
        id,
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price || 0,
        stock: productData.stock !== undefined ? productData.stock : 0,
        category: productData.category || "Uncategorized",
        imageUrl: productData.imageUrl || "",
        createdAt: productData.createdAt || new Date().toISOString(),
        updatedAt: productData.updatedAt || new Date().toISOString(),
      }
    })

    callback(products)
  }

  onValue(productsQuery, handleSnapshot)

  // Return unsubscribe function
  return () => off(productsQuery, "value", handleSnapshot)
}
