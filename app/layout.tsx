import type React from "react"
import "@/app/globals.css"
import "@/app/settings.css"
import "@/app/cross-platform-fixes.css"
import { Inter } from "next/font/google"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { getStoreSettings } from "@/lib/firebase/settings"
import { SettingsProviderWrapper } from "@/app/settings-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Amin Store - Inventory Management",
  description: "Manage your store inventory and sales with ease",
  generator: "v0.dev",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#10b981" />
        {/* Fix for Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Fix for iOS Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={inter.className}
        style={
          {
            "--primary-color": settings.primaryColor,
          } as React.CSSProperties
        }
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SettingsProviderWrapper settings={settings}>
            <div className="flex min-h-screen">
              <AppSidebar />
              <main className="flex-1 pt-16 lg:pt-0">
                <div className="container mx-auto p-4 lg:p-6">{children}</div>
              </main>
            </div>
            <Toaster />
          </SettingsProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
