'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, CheckCircle, Archive, TrendingUp } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_ICONS, ItemCategory, Item } from '@/types'
import { getDashboardStats, getAllItems } from '@/lib/supabase/queries'

interface Stats {
  totalItems: number
  availableItems: number
  claimedItems: number
  categoryCounts: Record<ItemCategory, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    availableItems: 0,
    claimedItems: 0,
    categoryCounts: {} as Record<ItemCategory, number>
  })
  const [recentItems, setRecentItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [statsData, itemsData] = await Promise.all([
        getDashboardStats(),
        getAllItems()
      ])
      setStats(statsData)
      setRecentItems(itemsData.slice(0, 5))
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Items', value: stats.totalItems, icon: Package, gradient: 'from-[var(--accent)] to-purple-600' },
    { label: 'Available', value: stats.availableItems, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Claimed', value: stats.claimedItems, icon: Archive, gradient: 'from-amber-500 to-orange-600' },
  ]

  const categoryData = Object.entries(stats.categoryCounts)
    .map(([category, count]) => ({ category: category as ItemCategory, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)] mt-1">Welcome back! Here&apos;s your inventory overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-5 hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
                  {loading ? '—' : stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Items */}
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-primary)]">Recent Items</h2>
            <Link href="/admin/inventory" className="text-sm text-[var(--accent)] hover:underline">View all</Link>
          </div>
          
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="flex-1">
                    <div className="h-4 w-1/2 skeleton mb-2" />
                    <div className="h-3 w-1/4 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-[var(--text-secondary)]">No items yet</p>
              <Link href="/admin/inventory" className="text-sm text-[var(--accent)] hover:underline mt-1 inline-block">
                Add your first item
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentItems.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 flex items-center gap-4 hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{CATEGORY_ICONS[item.category]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{CATEGORY_LABELS[item.category]}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--text-primary)]">×{item.quantity}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'available' 
                        ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="card">
          <div className="p-5 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">By Category</h2>
          </div>
          
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded skeleton" />
                  <div className="flex-1 h-3 skeleton" />
                </div>
              ))}
            </div>
          ) : categoryData.length === 0 ? (
            <div className="p-10 text-center">
              <TrendingUp className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-[var(--text-secondary)]">No data yet</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {categoryData.map((item) => {
                const maxCount = Math.max(...categoryData.map(d => d.count), 1)
                const percentage = (item.count / maxCount) * 100
                return (
                  <div key={item.category} className="flex items-center gap-3">
                    <span className="text-xl w-8">{CATEGORY_ICONS[item.category]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--text-secondary)]">{CATEGORY_LABELS[item.category]}</span>
                        <span className="font-semibold text-[var(--text-primary)]">{item.count}</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--accent)] to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
