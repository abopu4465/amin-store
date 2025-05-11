import { format, formatDistanceToNow } from "date-fns"

export function formatDateForDisplay(date: string | Date, formatString = "PPP") {
  if (!date) return ""
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, formatString)
}

export function formatRelativeTime(date: string | Date) {
  if (!date) return ""
  const dateObj = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function formatCurrency(amount: number, currencySymbol = "৳", currency = "BDT"): string {
  return `${currencySymbol}${new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`
}

export function formatDateTimeForExcel(date: string | Date): string {
  if (!date) return ""
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "yyyy-MM-dd HH:mm:ss")
}
