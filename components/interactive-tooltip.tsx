import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/date-formatter"

interface InteractiveTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: number) => string
}

export function InteractiveTooltip({ active, payload, label, formatter }: InteractiveTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <Card className="border shadow-md bg-background p-3 text-sm">
      <div className="font-medium mb-2">{label}</div>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const value = formatter
            ? formatter(entry.value)
            : typeof entry.value === "number"
              ? formatCurrency(entry.value)
              : entry.value

          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-medium ml-2">{value}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
