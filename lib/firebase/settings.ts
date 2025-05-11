import { db } from "./config"
import { ref, get, set, update } from "firebase/database"

export interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
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
  currency: "USD",
  taxRate: 7.5,
  primaryColor: "#0f766e", // Teal-700
  enableNotifications: true,
  lowStockThreshold: 5,
}

const SETTINGS_PATH = "settings/store-settings"

// Get store settings
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const settingsRef = ref(db, SETTINGS_PATH)
    const snapshot = await get(settingsRef)

    if (snapshot.exists()) {
      return snapshot.val() as StoreSettings
    } else {
      // If no settings exist, create default settings
      await set(settingsRef, {
        ...defaultSettings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      return defaultSettings
    }
  } catch (error) {
    console.error("Error getting store settings:", error)
    return defaultSettings
  }
}

// Update store settings
export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<boolean> {
  try {
    const settingsRef = ref(db, SETTINGS_PATH)
    const snapshot = await get(settingsRef)

    if (snapshot.exists()) {
      await update(settingsRef, {
        ...settings,
        updatedAt: Date.now(),
      })
    } else {
      await set(settingsRef, {
        ...defaultSettings,
        ...settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
    return true
  } catch (error) {
    console.error("Error updating store settings:", error)
    return false
  }
}
