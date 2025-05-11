import { useSettings } from "@/app/settings-provider"

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { settings } = useSettings()

  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm p-3 border rounded-lg shadow-md">
      <p className="font-medium text-sm mb-2">{label}</p>
      {payload.map((entry, index) => {
        const value = entry.value
        let formattedValue = value

        // Format currency if the name is sales or revenue
        if (entry.name.toLowerCase().includes("sales") || entry.name.toLowerCase().includes("revenue")) {
          formattedValue = `${settings.currencySymbol}${value.toLocaleString()}`
        } else {
          formattedValue = value.toLocaleString()
        }

        return (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-medium">{formattedValue}</span>
          </div>
        )
      })}
    </div>
  )
}
