"use client"

import type React from "react"

import { useState } from "react"
import { useSettings } from "@/app/settings-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsForm() {
  const { settings, updateSettings, isLoading } = useSettings()
  const { toast } = useToast()
  const [formData, setFormData] = useState({ ...settings })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })

    // Auto-set currency symbol based on currency selection
    if (name === "currency") {
      const currencySymbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
        BDT: "৳",
        INR: "₹",
        CNY: "¥",
      }

      setFormData((prev) => ({
        ...prev,
        currencySymbol: currencySymbols[value] || value,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await updateSettings(formData)

    if (success) {
      toast({
        title: "Settings updated",
        description: "Your store settings have been updated successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "There was an error updating your settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your store information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email Address</Label>
                <Input
                  id="storeEmail"
                  name="storeEmail"
                  type="email"
                  value={formData.storeEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone">Phone Number</Label>
                <Input id="storePhone" name="storePhone" value={formData.storePhone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Address</Label>
                <Input id="storeAddress" name="storeAddress" value={formData.storeAddress} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                      <SelectItem value="BDT">Bangladeshi Taka (BDT)</SelectItem>
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleChange}
                    className="text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how your store looks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-16 h-10"
                  />
                  <Input value={formData.primaryColor} onChange={handleChange} name="primaryColor" className="flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure when and how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for low stock and sales.</p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={formData.enableNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("enableNotifications", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground">
                  Get notified when product quantity falls below this number.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
