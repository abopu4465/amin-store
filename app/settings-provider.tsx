"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getStoreSettings, updateStoreSettings, type StoreSettings, defaultSettings } from "@/lib/firebase/settings"

interface SettingsContextType {
  settings: StoreSettings
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => false,
  isLoading: true,
})

export const useSettings = () => useContext(SettingsContext)

export function SettingsProviderWrapper({
  children,
  initialSettings,
}: { children: ReactNode; initialSettings?: StoreSettings }) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings || defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    } else {
      const fetchSettings = async () => {
        try {
          const fetchedSettings = await getStoreSettings()
          setSettings(fetchedSettings)
        } catch (error) {
          console.error("Error fetching settings:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchSettings()
    }
  }, [initialSettings])

  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const success = await updateStoreSettings(newSettings)
      if (success) {
        setSettings((prev) => ({ ...prev, ...newSettings }))
      }
      return success
    } catch (error) {
      console.error("Error updating settings:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>{children}</SettingsContext.Provider>
}
