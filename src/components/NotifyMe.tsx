'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { addSubscriber } from '@/lib/supabase/queries'

export function NotifyMe() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const result = await addSubscriber(email)
    
    if (result) {
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'welcome' })
        })
      } catch (e) {
        console.log('Email notification skipped:', e)
      }

      setStatus('success')
      setEmail('')
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
      }, 3000)
    } else {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      {/* Draggable Floating Button */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          top: -window?.innerHeight + 100 || -600,
          left: -window?.innerWidth + 100 || -300,
          right: 0,
          bottom: 0
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y })
          setTimeout(() => setIsDragging(false), 50)
        }}
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        style={{ touchAction: 'none' }}
      >
        <motion.button
          onClick={() => !isDragging && setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-[var(--accent)] to-pink-500 text-white shadow-lg shadow-[var(--accent)]/30 hover:shadow-xl hover:shadow-[var(--accent)]/40 transition-shadow cursor-grab active:cursor-grabbing"
          whileHover={{ scale: isDragging ? 1 : 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Modal */}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border)]"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-br from-[var(--accent)]/10 via-pink-500/10 to-amber-500/10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-pink-500 flex items-center justify-center mb-4 shadow-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Get Notified! 🔔
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Be the first to know when new items are available
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="w-8 h-8 text-[var(--success)]" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        You&apos;re all set! 🎉
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        We&apos;ll notify you when new items are available for pickup.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                          <input
                            type="email"
                            placeholder="your.email@ctu.edu.ph"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setStatus('idle')
                              setErrorMessage('')
                            }}
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm transition-all focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                            style={{ padding: '0.75rem 1rem 0.75rem 3rem' }}
                            disabled={status === 'loading'}
                          />
                        </div>
                        {status === 'error' && errorMessage && (
                          <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            <Bell className="w-5 h-5" />
                            Notify Me
                          </>
                        )}
                      </button>

                      <p className="text-xs text-center text-[var(--text-muted)]">
                        We&apos;ll only send notifications about new items. No spam, promise! 💝
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
