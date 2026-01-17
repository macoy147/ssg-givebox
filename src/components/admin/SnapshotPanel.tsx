'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Clock, Sun, Moon, TrendingUp, TrendingDown, Minus, Sparkles, ChevronDown, ChevronUp, Loader2, RefreshCw, Bot, ArrowLeftRight } from 'lucide-react'
import { Item, SnapshotItem, CATEGORY_ICONS } from '@/types'

interface Snapshot {
  id: string
  label: string
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
  const [morningSnap, setMorningSnap] = useState<Snapshot | null>(null)
  const [nightSnap, setNightSnap] = useState<Snapshot | null>(null)
  const [isSavingMorning, setIsSavingMorning] = useState(false)
  const [isSavingNight, setIsSavingNight] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const saved1 = localStorage.getItem('morning_snapshot')
    const saved2 = localStorage.getItem('night_snapshot')
    if (saved1) setMorningSnap(JSON.parse(saved1))
    if (saved2) setNightSnap(JSON.parse(saved2))
  }, [])

  const createSnapshot = (label: string): Snapshot => {
    const snapshotItems: SnapshotItem[] = items.map(item => ({
      id: item.id, name: item.name, category: item.category, quantity: item.quantity, status: item.status
    }))
    return { id: Date.now().toString(), label, items: snapshotItems, totalItems: items.length, totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0), createdAt: new Date().toISOString() }
  }

  const saveMorningSnap = async () => {
    setIsSavingMorning(true)
    await new Promise(r => setTimeout(r, 500))
    const snap = createSnapshot('Morning')
    setMorningSnap(snap)
    localStorage.setItem('morning_snapshot', JSON.stringify(snap))
    setIsSavingMorning(false)
    setShowComparison(false)
    setAiAnalysis(null)
  }

  const saveNightSnap = async () => {
    setIsSavingNight(true)
    await new Promise(r => setTimeout(r, 500))
    const snap = createSnapshot('Night')
    setNightSnap(snap)
    localStorage.setItem('night_snapshot', JSON.stringify(snap))
    setIsSavingNight(false)
    setShowComparison(false)
    setAiAnalysis(null)
  }

  const getComparison = () => {
    if (!morningSnap || !nightSnap) return null
    const items1 = new Map(morningSnap.items.map(i => [i.id, i]))
    const items2 = new Map(nightSnap.items.map(i => [i.id, i]))
    const added: SnapshotItem[] = [], removed: SnapshotItem[] = [], changed: { item: SnapshotItem; change: number }[] = []
    items2.forEach((item, id) => { const i1 = items1.get(id); if (!i1) added.push(item); else if (i1.quantity !== item.quantity) changed.push({ item, change: item.quantity - i1.quantity }) })
    items1.forEach((item, id) => { if (!items2.has(id)) removed.push(item) })
    return { added, removed, changed }
  }

  const generateAIAnalysis = async () => {
    const comp = getComparison()
    if (!comp || !morningSnap || !nightSnap) return
    setIsAnalyzing(true)
    setAiAnalysis(null)
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }), morningTotal: morningSnap.totalItems, eveningTotal: nightSnap.totalItems, morningQuantity: morningSnap.totalQuantity, eveningQuantity: nightSnap.totalQuantity, added: comp.added, removed: comp.removed, changed: comp.changed }) })
      const data = await res.json()
      setAiAnalysis(data.error ? 'Unable to generate AI analysis.' : data.analysis)
    } catch (e) { console.error(e); setAiAnalysis('Failed to connect to AI service.') }
    finally { setIsAnalyzing(false) }
  }

  const comparison = getComparison()
  const formatTime = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg"><Camera className="w-5 h-5 text-white" /></div>
          <div className="text-left"><h3 className="font-semibold text-[var(--text-primary)]">Inventory Snapshots</h3><p className="text-xs text-[var(--text-muted)]">Compare morning and night</p></div>
        </div>
        <div className="flex items-center gap-2">
          {morningSnap && <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium flex items-center gap-1"><Sun className="w-3 h-3" />AM</span>}
          {nightSnap && <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-medium flex items-center gap-1"><Moon className="w-3 h-3" />PM</span>}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3"><Sun className="w-4 h-4 text-amber-500" /><span className="text-sm font-semibold text-amber-500">Morning Snap</span></div>
                  {morningSnap ? (<div className="space-y-3"><p className="text-xs text-[var(--text-muted)]">{formatTime(morningSnap.createdAt)}</p><div className="grid grid-cols-2 gap-2"><div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]"><p className="text-xl font-bold text-[var(--text-primary)]">{morningSnap.totalItems}</p><p className="text-xs text-[var(--text-muted)]">Items</p></div><div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]"><p className="text-xl font-bold text-[var(--text-primary)]">{morningSnap.totalQuantity}</p><p className="text-xs text-[var(--text-muted)]">Qty</p></div></div><button onClick={saveMorningSnap} disabled={isSavingMorning} className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-500 text-sm font-medium hover:bg-amber-500/30 flex items-center justify-center gap-2">{isSavingMorning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Update</button></div>) : (<button onClick={saveMorningSnap} disabled={isSavingMorning} className="w-full py-10 rounded-lg border-2 border-dashed border-amber-500/30 text-amber-500 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-2">{isSavingMorning ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Camera className="w-6 h-6" /><span className="text-sm font-medium">Take Snapshot</span></>}</button>)}
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-3"><Moon className="w-4 h-4 text-indigo-500" /><span className="text-sm font-semibold text-indigo-500">Night Snap</span></div>
                  {nightSnap ? (<div className="space-y-3"><p className="text-xs text-[var(--text-muted)]">{formatTime(nightSnap.createdAt)}</p><div className="grid grid-cols-2 gap-2"><div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]"><p className="text-xl font-bold text-[var(--text-primary)]">{nightSnap.totalItems}</p><p className="text-xs text-[var(--text-muted)]">Items</p></div><div className="text-center p-2 rounded-lg bg-[var(--bg-primary)]"><p className="text-xl font-bold text-[var(--text-primary)]">{nightSnap.totalQuantity}</p><p className="text-xs text-[var(--text-muted)]">Qty</p></div></div><button onClick={saveNightSnap} disabled={isSavingNight} className="w-full py-2 rounded-lg bg-indigo-500/20 text-indigo-500 text-sm font-medium hover:bg-indigo-500/30 flex items-center justify-center gap-2">{isSavingNight ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Update</button></div>) : (<button onClick={saveNightSnap} disabled={isSavingNight} className="w-full py-10 rounded-lg border-2 border-dashed border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 flex flex-col items-center justify-center gap-2">{isSavingNight ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Camera className="w-6 h-6" /><span className="text-sm font-medium">Take Snapshot</span></>}</button>)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--text-muted)]" /><span className="text-sm text-[var(--text-secondary)]">Current</span></div><span className="text-sm text-[var(--text-primary)] font-medium">{items.length} items - {items.reduce((s, i) => s + i.quantity, 0)} qty</span></div></div>
              {morningSnap && nightSnap && <button onClick={() => setShowComparison(!showComparison)} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25"><ArrowLeftRight className="w-5 h-5" /> Compare</button>}
              <AnimatePresence>
                {showComparison && comparison && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center"><TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" /><p className="text-lg font-bold text-green-500">{comparison.added.length}</p><p className="text-xs text-[var(--text-muted)]">Added</p></div>
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center"><TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" /><p className="text-lg font-bold text-red-500">{comparison.removed.length}</p><p className="text-xs text-[var(--text-muted)]">Removed</p></div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><Minus className="w-5 h-5 text-amber-500 mx-auto mb-1" /><p className="text-lg font-bold text-amber-500">{comparison.changed.length}</p><p className="text-xs text-[var(--text-muted)]">Changed</p></div>
                    </div>
                    {comparison.added.length > 0 && <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]"><h4 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Added</h4>{comparison.added.map(item => <div key={item.id} className="flex justify-between text-sm"><span className="text-[var(--text-secondary)]">{CATEGORY_ICONS[item.category]} {item.name}</span><span className="text-green-500 font-medium">+{item.quantity}</span></div>)}</div>}
                    {comparison.removed.length > 0 && <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]"><h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Removed</h4>{comparison.removed.map(item => <div key={item.id} className="flex justify-between text-sm"><span className="text-[var(--text-secondary)]">{CATEGORY_ICONS[item.category]} {item.name}</span><span className="text-red-500 font-medium">-{item.quantity}</span></div>)}</div>}
                    {comparison.changed.length > 0 && <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]"><h4 className="text-sm font-semibold text-amber-500 mb-2 flex items-center gap-1"><Minus className="w-4 h-4" /> Changed</h4>{comparison.changed.map(({ item, change }) => <div key={item.id} className="flex justify-between text-sm"><span className="text-[var(--text-secondary)]">{CATEGORY_ICONS[item.category]} {item.name}</span><span className={change > 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>{change > 0 ? '+' : ''}{change}</span></div>)}</div>}
                    {comparison.added.length === 0 && comparison.removed.length === 0 && comparison.changed.length === 0 && <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] text-center"><p className="text-sm text-[var(--text-muted)]">No changes detected</p></div>}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[var(--text-primary)] mb-1">AI Analysis</h4>
                          {aiAnalysis ? <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{aiAnalysis}</p> : <p className="text-sm text-[var(--text-muted)]">Generate AI analysis of changes.</p>}
                          <button onClick={generateAIAnalysis} disabled={isAnalyzing} className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg disabled:opacity-50 flex items-center gap-2">{isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> {aiAnalysis ? 'Regenerate' : 'Generate'}</>}</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
