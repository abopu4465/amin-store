"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, Download, Printer, FileSpreadsheet, FileText, ChevronDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils/date-formatter"
import type { Sale } from "@/types/sale"
import type { Product } from "@/types/product"

interface ReportExportProps {
  sales: Sale[]
  products: Product[]
  dateRange: { from: Date; to: Date }
}

export function ReportExport({ sales, products, dateRange }: ReportExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

  const handleExport = async (type: string) => {
    setExportType(type)
    setIsExporting(true)

    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (type === "print") {
        handlePrint()
      } else {
        // Generate CSV or Excel file
        const csvContent = generateCSV(sales, products, type)
        downloadCSV(csvContent, `sales-report-${type}-${new Date().toISOString().split("T")[0]}.csv`)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0)

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #4F46E5;
          }
          .summary {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 5px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .summary-item {
            padding: 10px;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .summary-label {
            font-size: 12px;
            color: #6b7280;
          }
          .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #4F46E5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sales Report</h1>
          <p>Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Sales</div>
              <div class="summary-value">${sales.length}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Items Sold</div>
              <div class="summary-value">${totalItems}</div>
            </div>
          </div>
        </div>
        
        <h2>Sales Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${sales
              .map(
                (sale) => `
              <tr>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>${sale.invoiceNumber || "-"}</td>
                <td>${sale.customerName || "Walk-in Customer"}</td>
                <td>${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td>${formatCurrency(sale.totalAmount)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} | Amin Store Management System</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const generateCSV = (sales: Sale[], products: Product[], type: string) => {
    let csvContent = ""

    if (type === "basic") {
      // Basic report - just sales summary
      csvContent = "Date,Invoice,Customer,Items,Amount\n"
      sales.forEach((sale) => {
        const row = [
          new Date(sale.date).toLocaleDateString(),
          sale.invoiceNumber || "-",
          sale.customerName || "Walk-in Customer",
          sale.items.reduce((sum, item) => sum + item.quantity, 0),
          sale.totalAmount,
        ]
        csvContent += row.join(",") + "\n"
      })
    } else if (type === "detailed") {
      // Detailed report - includes product details
      csvContent = "Date,Invoice,Customer,Product,Quantity,Unit Price,Total\n"
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          const row = [
            new Date(sale.date).toLocaleDateString(),
            sale.invoiceNumber || "-",
            sale.customerName || "Walk-in Customer",
            item.productName,
            item.quantity,
            item.price,
            item.total,
          ]
          csvContent += row.join(",") + "\n"
        })
      })
    } else if (type === "comprehensive") {
      // Comprehensive report - includes summary and product analysis
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0)

      // Summary section
      csvContent = "SALES REPORT SUMMARY\n\n"
      csvContent += `Period,${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}\n`
      csvContent += `Total Revenue,${totalRevenue}\n`
      csvContent += `Total Sales,${sales.length}\n`
      csvContent += `Total Items Sold,${totalItems}\n\n`

      // Sales details
      csvContent += "SALES DETAILS\n\n"
      csvContent += "Date,Invoice,Customer,Items,Amount\n"
      sales.forEach((sale) => {
        const row = [
          new Date(sale.date).toLocaleDateString(),
          sale.invoiceNumber || "-",
          sale.customerName || "Walk-in Customer",
          sale.items.reduce((sum, item) => sum + item.quantity, 0),
          sale.totalAmount,
        ]
        csvContent += row.join(",") + "\n"
      })

      // Product analysis
      const productSales = new Map<string, { quantity: number; revenue: number }>()
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (productSales.has(item.productId)) {
            const product = productSales.get(item.productId)!
            product.quantity += item.quantity
            product.revenue += item.total
          } else {
            productSales.set(item.productId, {
              quantity: item.quantity,
              revenue: item.total,
            })
          }
        })
      })

      csvContent += "\nPRODUCT ANALYSIS\n\n"
      csvContent += "Product,Category,Quantity Sold,Revenue\n"
      Array.from(productSales.entries()).forEach(([productId, data]) => {
        const product = products.find((p) => p.id === productId)
        if (product) {
          const row = [product.name, product.category, data.quantity, data.revenue]
          csvContent += row.join(",") + "\n"
        }
      })
    }

    return csvContent
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Export Report</h3>
            <p className="text-sm text-muted-foreground">Export your sales data in different formats</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {exportType === "print" ? "Preparing Print" : "Exporting..."}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleExport("basic")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Basic Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("detailed")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Detailed Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("comprehensive")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Comprehensive Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Excel Format</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("print")}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Print Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
