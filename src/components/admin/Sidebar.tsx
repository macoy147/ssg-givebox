'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  Megaphone, 
  Settings, 
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/context/ThemeContext'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/inventory', icon: Package, label: 'Inventory' },
  { href: '/admin/donations', icon: Heart, label: 'Donations' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) setCollapsed(JSON.parse(saved))
  }, [])

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

  const handleLogout = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/login')
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <Image 
            src="/ssg-logo.png" 
            alt="SSG Logo" 
            width={40} 
            height={40}
            className="rounded-xl flex-shrink-0"
          />
          <div 
            className="transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto'
            }}
          >
            <div className="font-bold text-[var(--text-primary)] whitespace-nowrap">SSG GiveBox</div>
            <div className="text-xs text-[var(--text-muted)] whitespace-nowrap">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p 
          className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-opacity duration-300 overflow-hidden"
          style={{
            opacity: isCollapsed ? 0 : 1,
            height: isCollapsed ? 0 : 'auto',
            marginBottom: isCollapsed ? 0 : '0.75rem'
          }}
        >
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <motion.div
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${active 
                        ? 'bg-[var(--accent)] text-white shadow-lg' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span 
                      className="font-medium whitespace-nowrap transition-opacity duration-300 overflow-hidden"
                      style={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto'
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6">
          <p 
            className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: isCollapsed ? 0 : 1,
              height: isCollapsed ? 0 : 'auto',
              marginBottom: isCollapsed ? 0 : '0.75rem'
            }}
          >
            Links
          </p>
          <Link href="/" target="_blank" title={isCollapsed ? 'View Public Site' : undefined}>
            <motion.div
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all ${isCollapsed ? 'justify-center' : ''}`}
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" />
              <span 
                className="font-medium whitespace-nowrap transition-opacity duration-300 overflow-hidden"
                style={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : 'auto'
                }}
              >
                View Public Site
              </span>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all w-full ${isCollapsed ? 'justify-center' : ''}`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 flex-shrink-0" /> : <Sun className="w-5 h-5 flex-shrink-0" />}
          <span 
            className="font-medium whitespace-nowrap transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto'
            }}
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </motion.button>
        
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-all w-full ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span 
            className="font-medium whitespace-nowrap transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : 'auto'
            }}
          >
            Logout
          </span>
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-strong z-50 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image 
            src="/ssg-logo.png" 
            alt="SSG Logo" 
            width={32} 
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-[var(--text-primary)]">GiveBox</span>
        </Link>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-16 left-0 bottom-0 w-72 bg-[var(--bg-primary)] border-r border-[var(--border)] z-50"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:block fixed top-0 left-0 bottom-0 bg-[var(--bg-primary)] border-r border-[var(--border)] z-30"
      >
        <SidebarContent isCollapsed={collapsed} />
        
        {/* Collapse Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </motion.aside>
    </>
  )
}
