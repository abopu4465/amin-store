"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type StoreSettings, defaultSettings } from "@/types/settings"

interface SettingsContextType {
  settings: StoreSettings
  updateSettings: (newSettings: Partial<StoreSettings>) => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isLoading: true,
})

export const useSettings = () => useContext(SettingsContext)

export function SettingsProvider({
  children,
  initialSettings,
}: { children: ReactNode; initialSettings: StoreSettings }) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings || defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>{children}</SettingsContext.Provider>
}
