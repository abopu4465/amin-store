import type { Sale } from "@/types/sale"
import { formatDateTimeForExcel } from "./date-formatter"

// Function to export sales data to CSV
export const exportSalesData = (sales: Sale[], detailed = false): string => {
  if (sales.length === 0) {
    return "No data to export"
  }

  let csvContent = ""

  if (detailed) {
    // Detailed export with individual items
    csvContent = "Sale ID,Date,Product ID,Product Name,Quantity,Unit Price,Total\n"

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        csvContent += `${sale.id},${formatDateTimeForExcel(sale.date)},${item.productId},${item.productName},${
          item.quantity
        },${item.price},${item.total}\n`
      })
    })
  } else {
    // Basic export with sale summaries
    csvContent = "Sale ID,Date,Total Amount,Items Count,Payment Method\n"

    sales.forEach((sale) => {
      const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0)
      csvContent += `${sale.id},${formatDateTimeForExcel(sale.date)},${sale.totalAmount},${itemsCount},${
        sale.paymentMethod || "N/A"
      }\n`
    })
  }

  return csvContent
}

// Function to download CSV
export const downloadCSV = (csvContent: string, fileName: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"

  // Append to the document, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Enhanced export function for comprehensive reports
export const exportComprehensiveReport = (
  sales: Sale[],
  dateRange: { from: Date | undefined; to: Date | undefined },
): string => {
  if (sales.length === 0) {
    return "No data to export"
  }

  // Create header with report metadata
  const reportDate = new Date().toISOString().split("T")[0]
  const fromDate = dateRange.from ? dateRange.from.toISOString().split("T")[0] : "All time"
  const toDate = dateRange.to ? dateRange.to.toISOString().split("T")[0] : "Present"

  let csvContent = "SALES REPORT\n"
  csvContent += `Report Generated: ${reportDate}\n`
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`

  // Summary statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalItems = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )
  const averageOrderValue = totalRevenue / sales.length

  csvContent += "SUMMARY STATISTICS\n"
  csvContent += `Total Revenue,${totalRevenue}\n`
  csvContent += `Total Transactions,${sales.length}\n`
  csvContent += `Total Items Sold,${totalItems}\n`
  csvContent += `Average Order Value,${averageOrderValue.toFixed(2)}\n\n`

  // Product performance
  csvContent += "PRODUCT PERFORMANCE\n"
  csvContent += "Product ID,Product Name,Quantity Sold,Total Revenue\n"

  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const existing = productMap.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.total
      } else {
        productMap.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.total,
        })
      }
    })
  })

  Array.from(productMap.entries()).forEach(([id, data]) => {
    csvContent += `${id},${data.name},${data.quantity},${data.revenue}\n`
  })

  csvContent += "\nDETAILED TRANSACTIONS\n"
  csvContent += "Sale ID,Date,Total Amount,Items,Payment Method\n"

  sales.forEach((sale) => {
    const itemsList = sale.items.map((item) => `${item.quantity}x ${item.productName}`).join("; ")
    csvContent += `${sale.id},${formatDateTimeForExcel(sale.date)},${sale.totalAmount},"${itemsList}",${
      sale.paymentMethod || "N/A"
    }\n`
  })

  return csvContent
}

// Function to export data in Excel format
export const exportToExcel = (sales: Sale[], fileName: string): void => {
  // This is a simplified version - in a real app, you might use a library like xlsx
  const csvContent = exportComprehensiveReport(sales, { from: undefined, to: undefined })
  downloadCSV(csvContent, fileName)
}
