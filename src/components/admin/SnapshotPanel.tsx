'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Clock, 
  Sun, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Item, SnapshotItem, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types'

interface Snapshot {
  id: string
  time: 'morning' | 'evening'
  date: string
  items: SnapshotItem[]
  totalItems: number
  totalQuantity: number
  createdAt: string
}

interface SnapshotPanelProps {
  items: Item[]
}

export function SnapshotPanel({ items }: SnapshotPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load snapshots from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('inventory_snapshots')
    if (saved) {
      setSnapshots(JSON.parse(saved))
    }
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const currentHour = new Date().getHours()
  const isMorning = currentHour < 14 // Before 2 PM is morning
  const currentTimeSlot = isMorning ? 'morning' : 'evening'

  const todayMorningSnapshot = snapshots.find(s => s.date === today && s.time === 'morning')
  const todayEveningSnapshot = snapshots.find(s => s.date === today && s.time === 'evening')
  const hasCurrentSnapshot = currentTimeSlot === 'morning' ? todayMorningSnapshot : todayEveningSnapshot

  const saveSnapshot = async () => {
    setIsSaving(true)
    
    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const snapshotItems: SnapshotItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      status: item.status
    }))

    const newSnapshot: Snapshot = {
      id: `${today}-${currentTimeSlot}`,
      time: currentTimeSlot,
      date: today,
      items: snapshotItems,
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: new Date().toISOString()
    }

    // Remove existing snapshot for same time slot if exists
    const filtered = snapshots.filter(s => !(s.date === today && s.time === currentTimeSlot))
    const updated = [...filtered, newSnapshot].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setSnapshots(updated)
    localStorage.setItem('inventory_snapshots', JSON.stringify(updated))
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)

    // Auto-show comparison if both snapshots exist
    if (currentTimeSlot === 'evening' && todayMorningSnapshot) {
      setShowComparison(true)
    }
  }

  const getComparison = () => {
    if (!todayMorningSnapshot || !todayEveningSnapshot) return null

    const morningItems = new Map(todayMorningSnapshot.items.map(i => [i.id, i]))
    const eveningItems = new Map(todayEveningSnapshot.items.map(i => [i.id, i]))

    const added: SnapshotItem[] = []
    const removed: SnapshotItem[] = []
    const changed: { item: SnapshotItem; change: number }[] = []

    // Find added and changed items
    eveningItems.forEach((item, id) => {
      const morningItem = morningItems.get(id)
      if (!morningItem) {
        added.push(item)
      } else if (morningItem.quantity !== item.quantity) {
        changed.push({ item, change: item.quantity - morningItem.quantity })
      }
    })

    // Find removed items
    morningItems.forEach((item, id) => {
      if (!eveningItems.has(id)) {
        removed.push(item)
      }
    })

    return { added, removed, changed }
  }

  const comparison = getComparison()

  return (
    <div className="card overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-[var(--text-primary)]">Daily Snapshot</h3>
            <p className="text-xs text-[var(--text-muted)]">Save & compare inventory</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {todayMorningSnapshot && (
            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium flex items-center gap-1">
              <Sun className="w-3 h-3" /> AM
            </span>
          )}
          {todayEveningSnapshot && (
            <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-medium flex items-center gap-1">
              <Moon className="w-3 h-3" /> PM
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Current Status */}
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isMorning ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {isMorning ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                    {isMorning ? 'Morning Session' : 'Evening Session'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-[var(--bg-primary)]">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{items.length}</p>
                    <p className="text-xs text-[var(--text-muted)]">Items</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[var(--bg-primary)]">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Total Qty</p>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveSnapshot}
                  disabled={isSaving}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    saveSuccess 
                      ? 'bg-[var(--success)] text-white'
                      : hasCurrentSnapshot
                      ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/25'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Snapshot...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Snapshot Saved!
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      {hasCurrentSnapshot ? 'Update Snapshot' : 'Save Snapshot'}
                    </>
                  )}
                </button>

                {hasCurrentSnapshot && (
                  <p className="text-xs text-center text-[var(--text-muted)] mt-2">
                    Last saved: {new Date(hasCurrentSnapshot.createdAt).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Comparison Section */}
              {todayMorningSnapshot && todayEveningSnapshot && comparison && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-[var(--text-primary)]">View Daily Report</span>
                    </div>
                    <span className="text-xs text-purple-500 font-medium">
                      {comparison.added.length + comparison.removed.length + comparison.changed.length} changes
                    </span>
                  </button>

                  <AnimatePresence>
                    {showComparison && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-green-500">{comparison.added.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Added</p>
                          </div>
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-red-500">{comparison.removed.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Removed</p>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                            <Minus className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-amber-500">{comparison.changed.length}</p>
                            <p className="text-xs text-[var(--text-muted)]">Changed</p>
                          </div>
                        </div>

                        {/* Detailed Changes */}
                        {comparison.added.length > 0 && (
                          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                            <h4 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" /> Items Added
                            </h4>
                            <div className="space-y-1">
                              {comparison.added.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-[var(--text-secondary)]">
                                    {CATEGORY_ICONS[item.category]} {item.name}
                                  </span>
                                  <span className="text-green-500 font-medium">+{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {comparison.removed.length > 0 && (
                          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                            <h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1">
                              <TrendingDown className="w-4 h-4" /> Items Removed/Claimed
                            </h4>
                            <div className="space-y-1">
                              {comparison.removed.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-[var(--text-secondary)]">
                                    {CATEGORY_ICONS[item.category]} {item.name}
                                  </span>
                                  <span className="text-red-500 font-medium">-{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {comparison.changed.length > 0 && (
                          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                            <h4 className="text-sm font-semibold text-amber-500 mb-2 flex items-center gap-1">
                              <Minus className="w-4 h-4" /> Quantity Changes
                            </h4>
                            <div className="space-y-1">
                              {comparison.changed.map(({ item, change }) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-[var(--text-secondary)]">
                                    {CATEGORY_ICONS[item.category]} {item.name}
                                  </span>
                                  <span className={`font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {change > 0 ? '+' : ''}{change}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Analysis Placeholder */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[var(--text-primary)] mb-1">AI Analysis</h4>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {comparison.removed.length > 0 
                                  ? `Great distribution day! ${comparison.removed.length} item type(s) were claimed by students. ${
                                      comparison.removed.reduce((sum, i) => sum + i.quantity, 0)
                                    } total items distributed.`
                                  : comparison.added.length > 0
                                  ? `${comparison.added.length} new item(s) added to inventory today. Ready for distribution!`
                                  : 'No significant changes detected today.'
                                }
                              </p>
                              <button className="mt-2 text-xs text-purple-500 font-medium hover:underline flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Generate Full Report
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* No comparison available yet */}
              {(!todayMorningSnapshot || !todayEveningSnapshot) && (
                <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border)] text-center">
                  <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    {!todayMorningSnapshot 
                      ? 'Save a morning snapshot to start tracking'
                      : 'Save an evening snapshot to see the comparison'
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}