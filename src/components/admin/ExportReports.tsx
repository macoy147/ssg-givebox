'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileDown, FileSpreadsheet, FileText, X, Loader2, CheckCircle } from 'lucide-react'
import { Item, CATEGORY_LABELS } from '@/types'

interface ExportReportsProps {
  items: Item[]
}

export function ExportReports({ items }: ExportReportsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
  const [success, setSuccess] = useState<'pdf' | 'excel' | null>(null)

  const generatePDF = async () => {
    setExporting('pdf')
    
    // Create a printable HTML document
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const availableItems = items.filter(i => i.status === 'available')
    const claimedItems = items.filter(i => i.status === 'claimed')
    const archivedItems = items.filter(i => i.status === 'archived')

    // Group by category
    const byCategory: Record<string, Item[]> = {}
    items.forEach(item => {
      if (!byCategory[item.category]) byCategory[item.category] = []
      byCategory[item.category].push(item)
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SSG GiveBox Inventory Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            color: #1a1a1a;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #DC2626;
          }
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
          }
          .logo-placeholder {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #DC2626, #F59E0B);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .title { 
            font-size: 28px; 
            font-weight: bold; 
            color: #DC2626;
          }
          .subtitle { 
            font-size: 14px; 
            color: #666; 
            margin-top: 5px;
          }
          .tagline {
            font-size: 12px;
            color: #F59E0B;
            font-style: italic;
            margin-top: 5px;
          }
          .date { 
            font-size: 12px; 
            color: #888; 
            margin-top: 10px;
          }
          .summary { 
            display: flex; 
            gap: 20px; 
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .summary-card { 
            flex: 1; 
            min-width: 150px;
            padding: 20px; 
            border-radius: 12px; 
            text-align: center;
          }
          .summary-card.total { background: linear-gradient(135deg, #f0f0f0, #e0e0e0); }
          .summary-card.available { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
          .summary-card.claimed { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
          .summary-card.archived { background: linear-gradient(135deg, #fef3c7, #fde68a); }
          .summary-number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #1a1a1a;
          }
          .summary-label { 
            font-size: 12px; 
            color: #666; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 5px;
          }
          .section { margin-bottom: 30px; }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #DC2626;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #fecaca;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            font-size: 12px;
          }
          th { 
            background: linear-gradient(135deg, #DC2626, #b91c1c);
            color: white; 
            padding: 12px 10px; 
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          th:first-child { border-radius: 8px 0 0 0; }
          th:last-child { border-radius: 0 8px 0 0; }
          td { 
            padding: 10px; 
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) { background: #fafafa; }
          tr:hover { background: #fef2f2; }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-available { background: #dcfce7; color: #166534; }
          .status-claimed { background: #f3f4f6; color: #374151; }
          .status-archived { background: #fef3c7; color: #92400e; }
          .category-section { 
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .category-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            padding: 10px 15px;
            background: #fef2f2;
            border-radius: 8px;
            border-left: 4px solid #DC2626;
          }
          .category-icon { font-size: 20px; }
          .category-name { font-weight: 600; color: #1a1a1a; }
          .category-count { 
            margin-left: auto; 
            font-size: 12px; 
            color: #666;
            background: white;
            padding: 4px 10px;
            border-radius: 20px;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e5e7eb;
            text-align: center; 
            font-size: 11px; 
            color: #888;
          }
          .footer-logo {
            font-weight: bold;
            color: #DC2626;
          }
          @media print {
            body { padding: 20px; }
            .summary-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <div class="logo-placeholder">SSG</div>
            <div>
              <div class="title">SSG GiveBox</div>
              <div class="tagline">Share More. Care More.</div>
            </div>
          </div>
          <div class="subtitle">CTU Daanbantayan Campus • Supreme Student Government</div>
          <div class="date">Inventory Report • ${currentDate}</div>
        </div>

        <div class="summary">
          <div class="summary-card total">
            <div class="summary-number">${items.length}</div>
            <div class="summary-label">Total Items</div>
          </div>
          <div class="summary-card available">
            <div class="summary-number">${availableItems.length}</div>
            <div class="summary-label">Available</div>
          </div>
          <div class="summary-card claimed">
            <div class="summary-number">${claimedItems.length}</div>
            <div class="summary-label">Claimed</div>
          </div>
          <div class="summary-card archived">
            <div class="summary-number">${archivedItems.length}</div>
            <div class="summary-label">Archived</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📦 Inventory by Category</div>
          ${Object.entries(byCategory).map(([category, categoryItems]) => `
            <div class="category-section">
              <div class="category-header">
                <span class="category-icon">${getCategoryIcon(category)}</span>
                <span class="category-name">${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}</span>
                <span class="category-count">${categoryItems.length} items</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 30%">Item Name</th>
                    <th style="width: 25%">Description</th>
                    <th style="width: 10%">Qty</th>
                    <th style="width: 15%">Status</th>
                    <th style="width: 20%">Donated By</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryItems.map(item => `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td>${item.description || '-'}</td>
                      <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
                      <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                      <td>${item.donated_by || 'Anonymous'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p class="footer-logo">SSG GiveBox</p>
          <p>Generated on ${currentDate} • CTU Daanbantayan Campus</p>
          <p>This report is for internal use only.</p>
        </div>
      </body>
      </html>
    `

    // Open print dialog
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }

    setExporting(null)
    setSuccess('pdf')
    setTimeout(() => setSuccess(null), 2000)
  }

  const generateExcel = () => {
    setExporting('excel')

    // Create CSV content with proper formatting
    const headers = ['Item Name', 'Description', 'Category', 'Quantity', 'Status', 'Donated By', 'Available Date', 'Created At']
    
    const rows = items.map(item => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${CATEGORY_LABELS[item.category] || item.category}"`,
      item.quantity,
      `"${item.status}"`,
      `"${(item.donated_by || 'Anonymous').replace(/"/g, '""')}"`,
      `"${new Date(item.available_date).toLocaleDateString()}"`,
      `"${new Date(item.created_at).toLocaleDateString()}"`
    ])

    // Add summary section at the top
    const availableCount = items.filter(i => i.status === 'available').length
    const claimedCount = items.filter(i => i.status === 'claimed').length
    const archivedCount = items.filter(i => i.status === 'archived').length

    const summaryRows = [
      ['SSG GiveBox Inventory Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Summary'],
      [`Total Items:,${items.length}`],
      [`Available:,${availableCount}`],
      [`Claimed:,${claimedCount}`],
      [`Archived:,${archivedCount}`],
      [''],
      [''],
      headers.join(','),
      ...rows.map(row => row.join(','))
    ]

    const csvContent = summaryRows.join('\n')
    
    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `SSG_GiveBox_Inventory_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setExporting(null)
    setSuccess('excel')
    setTimeout(() => setSuccess(null), 2000)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Export Report</h2>
                  <p className="text-sm text-[var(--text-muted)]">{items.length} items in inventory</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Export Options */}
              <div className="p-5 space-y-3">
                {/* PDF Option */}
                <button
                  onClick={generatePDF}
                  disabled={exporting !== null}
                  className="w-full p-4 rounded-xl border border-[var(--border)] hover:border-red-500 hover:bg-red-500/5 transition-all flex items-center gap-4 group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    {exporting === 'pdf' ? (
                      <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                    ) : success === 'pdf' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--text-primary)]">PDF Report</h3>
                    <p className="text-sm text-[var(--text-muted)]">Well-designed printable report</p>
                  </div>
                </button>

                {/* Excel Option */}
                <button
                  onClick={generateExcel}
                  disabled={exporting !== null}
                  className="w-full p-4 rounded-xl border border-[var(--border)] hover:border-green-500 hover:bg-green-500/5 transition-all flex items-center gap-4 group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    {exporting === 'excel' ? (
                      <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                    ) : success === 'excel' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <FileSpreadsheet className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--text-primary)]">Excel/CSV</h3>
                    <p className="text-sm text-[var(--text-muted)]">Spreadsheet with all data</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    school_supplies: '📚',
    clothing: '👕',
    food: '🍎',
    hygiene: '🧴',
    other: '📦'
  }
  return icons[category] || '📦'
}
