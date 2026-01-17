'use client'

import { Sidebar } from '@/components/admin/Sidebar'
import { useState, useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) setSidebarCollapsed(JSON.parse(saved))

    const handleStorage = () => {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved) setSidebarCollapsed(JSON.parse(saved))
    }

    window.addEventListener('storage', handleStorage)
    // Custom event for same-tab updates
    window.addEventListener('sidebar-toggle', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('sidebar-toggle', handleStorage)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Sidebar />
      <main 
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (sidebarCollapsed ? '80px' : '256px') 
            : '0'
        }}
      >
        <div className="pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
