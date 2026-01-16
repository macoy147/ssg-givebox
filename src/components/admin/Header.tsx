'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-[var(--text-secondary)] mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] w-64"
          />
        </div>
        <button className="relative p-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-[var(--primary)] transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--primary)] rounded-full" />
        </button>
      </div>
    </header>
  )
}
