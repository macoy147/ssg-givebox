'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, Package, Sun, Moon, Sparkles, Wifi, Megaphone } from 'lucide-react'
import { Item, Announcement, CATEGORY_LABELS, CATEGORY_ICONS, ItemCategory } from '@/types'
import { getAvailableItems, getSettings, getPublishedAnnouncements } from '@/lib/supabase/queries'
import { useTheme } from '@/context/ThemeContext'
import { ItemDetailModal } from '@/components/ItemDetailModal'
import { SearchBar } from '@/components/SearchBar'
import { FAQSection } from '@/components/FAQSection'
import { NotifyMe } from '@/components/NotifyMe'

const categories: ItemCategory[] = ['school_supplies', 'clothing', 'food', 'hygiene', 'other']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}


// Generate halftone dots pattern for loading screen
function HalftoneDots({ position }: { position: 'top-left' | 'bottom-right' }) {
  const dots = []
  const rows = 10
  const cols = 10
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const distance = Math.sqrt(row * row + col * col)
      const maxDistance = Math.sqrt(rows * rows + cols * cols)
      const sizeMultiplier = 1 - (distance / maxDistance)
      
      // Top-left: triangle with hypotenuse going from top-right to bottom-left
      if (position === 'top-left' && col <= rows - row - 1) {
        const size = Math.max(2, 10 * sizeMultiplier)
        const opacity = 0.25 * sizeMultiplier
        dots.push(
          <circle key={`${row}-${col}`} cx={col * 22 + 11} cy={row * 22 + 11} r={size} fill="currentColor" opacity={opacity} />
        )
      } 
      // Bottom-right: mirror of top-left, triangle with hypotenuse going from top-right to bottom-left
      else if (position === 'bottom-right' && col >= rows - row) {
        const cornerDistance = Math.sqrt((rows - 1 - row) * (rows - 1 - row) + (cols - 1 - col) * (cols - 1 - col))
        const cornerMultiplier = 1 - (cornerDistance / maxDistance)
        const size = Math.max(2, 10 * cornerMultiplier)
        const opacity = 0.25 * cornerMultiplier
        dots.push(
          <circle key={`${row}-${col}`} cx={col * 22 + 11} cy={row * 22 + 11} r={size} fill="currentColor" opacity={opacity} />
        )
      }
    }
  }
  return <>{dots}</>
}

function LoadingScreen({ progress }: { progress: number }) {
  const [tip, setTip] = useState(0)
  const tips = [
    "Connecting to database...",
    "Loading available items...",
    "Preparing your experience...",
    "Almost there..."
  ]

  useEffect(() => {
    const tipInterval = setInterval(() => setTip(t => (t + 1) % tips.length), 2000)
    return () => { clearInterval(tipInterval) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-amber-950"
    >
      {/* Halftone dots - Top Left */}
      <svg className="absolute top-0 left-0 w-[220px] h-[220px] text-white" viewBox="0 0 220 220" aria-hidden="true">
        <HalftoneDots position="top-left" />
      </svg>
      
      {/* Halftone dots - Bottom Right */}
      <svg className="absolute bottom-0 right-0 w-[220px] h-[220px] text-amber-400" viewBox="0 0 220 220" aria-hidden="true">
        <HalftoneDots position="bottom-right" />
      </svg>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{ left: `${(i * 5) % 100}%`, top: `${(i * 7) % 100}%` }}
            animate={{ y: [0, -150], opacity: [0, 1, 0] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div className="relative" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <motion.div
          className="absolute -inset-4 rounded-full border-2 border-amber-400/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <Image src="/ssg-logo.png" alt="SSG Logo" width={100} height={100} className="rounded-full shadow-2xl relative z-10" priority />
        <motion.div 
          className="absolute inset-0 rounded-full bg-amber-400/30"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      <motion.h1 className="text-white text-3xl font-bold mt-6" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
        SSG GiveBox
      </motion.h1>
      <motion.p className="text-white/70 text-sm mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        Share More. Care More.
      </motion.p>
      <div className="w-64 h-2 bg-white/20 rounded-full mt-8 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <motion.p className="text-white/90 text-sm mt-2 font-medium">{Math.round(progress)}%</motion.p>
      <motion.div className="flex items-center gap-2 mt-4 text-white/80 text-sm" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <Wifi className="w-4 h-4" />
        <motion.span key={tip} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{tips[tip]}</motion.span>
      </motion.div>
      <motion.div className="absolute bottom-8 text-white/40 text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        CTU Daanbantayan Campus • Supreme Student Government
      </motion.div>
    </motion.div>
  )
}


function AnimatedBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 transition-colors duration-300" style={{ background: 'var(--page-bg)' }} />
      <motion.div animate={{ x: [0, 100, 50, 0], y: [0, 50, 100, 0], scale: [1, 1.2, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-300" style={{ background: 'var(--orb-1)' }} />
      <motion.div animate={{ x: [0, -80, -40, 0], y: [0, 80, 40, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-300" style={{ background: 'var(--orb-2)' }} />
      <motion.div animate={{ x: [0, 60, -30, 0], y: [0, -60, 30, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full blur-[120px] transition-colors duration-300" style={{ background: 'var(--orb-3)' }} />
    </div>
  )
}

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()
  const [items, setItems] = useState<Item[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState({ pickup_location: 'Beside SSG Office', pickup_day: 'Friday', pickup_time: '8:00 AM - 9:00 PM' })

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => setProgress(Math.min(90, (Date.now() - start) / 20)), 50)
    async function fetchData() {
      try {
        const [itemsData, settingsData, announcementsData] = await Promise.all([
          getAvailableItems(), getSettings(), getPublishedAnnouncements()
        ])
        setItems(itemsData)
        setAnnouncements(announcementsData)
        setSettings({ pickup_location: settingsData.pickup_location || 'Beside SSG Office', pickup_day: settingsData.pickup_day || 'Friday', pickup_time: settingsData.pickup_time || '8:00 AM - 10:00 PM' })
      } catch (e) { console.error(e) }
      finally { clearInterval(interval); setProgress(100); setTimeout(() => { setLoading(false); setShowContent(true) }, 500) }
    }
    fetchData()
    return () => clearInterval(interval)
  }, [])

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })


  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen progress={progress} />}</AnimatePresence>
      <div className="min-h-screen relative">
        <AnimatedBg />
        <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 glass-strong">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <Image src="/ssg-logo.png" alt="SSG Logo" width={36} height={36} className="rounded-full" />
                <span className="font-bold text-[var(--text-primary)] text-base sm:text-lg">SSG GiveBox</span>
              </Link>
              <motion.button whileHover={{ scale: 1.05, rotate: 15 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme}
                className="p-2.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all" aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.nav>

        <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={showContent ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center flex flex-col items-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={showContent ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 0.2, type: 'spring' }} className="mb-6 relative">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="relative">
                  <motion.div className="absolute -inset-3 sm:-inset-5 rounded-full border-2 border-amber-500/60" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
                  <Image src="/ssg-logo.png" alt="SSG Logo" width={90} height={90} className="rounded-full relative z-10 sm:w-[120px] sm:h-[120px]" priority />
                </motion.div>
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl -z-10 scale-125 sm:scale-150" />
              </motion.div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={showContent ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Sparkles className="w-4 h-4" /></motion.div>
                <span>From Students, For Students</span>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="gradient-text">Share More.</span><br /><span className="text-[var(--text-primary)]">Care More.</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mb-8 sm:mb-10 px-4">
                Discover donated items available for pickup. Every item shared is a step towards helping a fellow student in need.
              </p>
              <motion.div variants={containerVariants} initial="hidden" animate={showContent ? "visible" : "hidden"} className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                {[{ icon: Calendar, label: settings.pickup_day, color: 'text-[var(--accent)]' },
                  { icon: Clock, label: settings.pickup_time, color: 'text-pink-500' },
                  { icon: MapPin, label: settings.pickup_location, color: 'text-amber-500' }].map((item, i) => (
                  <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl glass cursor-default">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}><item.icon className={`w-4 h-4 ${item.color}`} /></motion.div>
                    <span className="font-medium text-[var(--text-primary)] text-xs sm:text-sm">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Announcements Section */}
        {announcements.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Announcements</h2>
              </div>
            </motion.div>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement, idx) => (
                <motion.div key={announcement.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  onClick={() => setExpandedAnnouncement(expandedAnnouncement === announcement.id ? null : announcement.id)}
                  className="glass rounded-xl p-4 cursor-pointer hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)] to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{announcement.title}</h3>
                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                          {new Date(announcement.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-sm text-[var(--text-secondary)] mt-1 ${expandedAnnouncement === announcement.id ? '' : 'line-clamp-2'}`}>
                        {announcement.content}
                      </p>
                      {announcement.content.length > 100 && (
                        <button className="text-xs text-[var(--accent)] mt-2 font-medium">
                          {expandedAnnouncement === announcement.id ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">Available Items</h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">{filteredItems.length} items ready for pickup</p>
            </div>
          </motion.div>
          
          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search for items..." />
          </motion.div>

          {/* Category Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6 sm:mb-8">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-[var(--accent)] text-white shadow-lg' : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              All Items
            </motion.button>
            {categories.map((cat) => (
              <motion.button key={cat} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[var(--accent)] text-white shadow-lg' : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              </motion.button>
            ))}
          </motion.div>


          {/* Items Grid */}
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-16 sm:py-20 glass rounded-2xl">
                <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 sm:w-10 h-8 sm:h-10 text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {searchQuery ? 'No items found' : 'No items available'}
                </h3>
                <p className="text-[var(--text-secondary)] max-w-sm mx-auto text-sm sm:text-base px-4">
                  {searchQuery ? 'Try a different search term or browse all categories.' : 'Check back on Thursday for the weekly announcement of new items!'}
                </p>
              </motion.div>
            ) : (
              <motion.div key="items" variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredItems.map((item, idx) => (
                  <motion.div key={item.id} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} 
                    onClick={() => setSelectedItem(item)}
                    className="card overflow-hidden group cursor-pointer">
                    <div className="h-32 sm:h-40 bg-gradient-to-br from-[var(--accent)]/10 via-pink-500/10 to-amber-500/10 flex items-center justify-center relative overflow-hidden">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <motion.span className="text-5xl sm:text-6xl" animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, delay: idx * 0.2 }}>
                          {CATEGORY_ICONS[item.category]}
                        </motion.span>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors text-sm sm:text-base">{item.name}</h3>
                        <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="flex-shrink-0 px-2 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">Available</motion.span>
                      </div>
                      {item.description && <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 sm:mb-4 line-clamp-2">{item.description}</p>}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)]">
                        <span className="text-xs text-[var(--text-muted)]">{CATEGORY_LABELS[item.category]}</span>
                        <span className="text-xs sm:text-sm font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-lg">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>


        {/* How It Works Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 glass relative">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">How It Works</h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">Simple steps to get the items you need</p>
            </motion.div>
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {[{ icon: '📋', title: 'Browse Items', desc: 'Check available items every Thursday when the weekly list is announced.', color: 'from-red-600 to-red-700' },
                { icon: '🏫', title: 'Visit SSG Office', desc: 'Come to the SSG Office on Friday during pickup hours with your CTU ID.', color: 'from-amber-500 to-yellow-500' },
                { icon: '🎁', title: 'Claim Items', desc: 'Get the items you need based on availability. First come, first served!', color: 'from-orange-500 to-red-500' }].map((step, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="text-center">
                  <motion.div whileHover={{ scale: 1.1, rotate: 10 }} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className={`w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg`}>
                    <span className="text-xl sm:text-2xl">{step.icon}</span>
                  </motion.div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] px-2">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <footer className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image src="/ssg-logo.png" alt="SSG Logo" width={32} height={32} className="rounded-full" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">SSG GiveBox</div>
                  <div className="text-xs text-[var(--text-muted)]">Share More. Care More.</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] text-center sm:text-right">© 2026 Supreme Student Government • CTU Daanbantayan Campus</p>
            </div>
          </div>
        </footer>

        {/* Notify Me Button */}
        <NotifyMe />

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
    </>
  )
}
