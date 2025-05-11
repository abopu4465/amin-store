import type { Metadata } from "next"
import { getStoreSettings } from "@/lib/firebase/settings"
import { SettingsForm } from "@/components/settings-form"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your store settings",
}

export default async function SettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings and preferences.</p>
      </div>

      <SettingsForm />
    </div>
  )
}
