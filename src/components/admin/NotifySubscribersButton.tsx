'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Loader2, CheckCircle, Send, Users } from 'lucide-react'

interface NotifySubscribersButtonProps {
  itemCount: number
}

export function NotifySubscribersButton({ itemCount }: NotifySubscribersButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const handleSendNotification = async () => {
    setStatus('loading')

    try {
      const response = await fetch('/api/notify/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '🆕 New Items Available at SSG GiveBox!',
          message: customMessage || 'Great news! New items have been added to SSG GiveBox and are ready for pickup this Friday.',
          itemCount: itemCount
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Notifications sent!')
        setTimeout(() => {
          setIsOpen(false)
          setStatus('idle')
          setCustomMessage('')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to send notifications')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to send notifications')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline">Notify Subscribers</span>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notify Subscribers</h2>
                    <p className="text-sm text-[var(--text-muted)]">Send email to all subscribers</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center py-6"
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
                        Notifications Sent! 🎉
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Stats */}
                      <div className="flex gap-3">
                        <div className="flex-1 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-1">
                            <Users className="w-4 h-4" />
                            <span>Subscribers</span>
                          </div>
                          <p className="text-2xl font-bold text-[var(--text-primary)]">All Active</p>
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                          <div className="flex items-center gap-2 text-[var(--accent)] text-sm mb-1">
                            <span>📦</span>
                            <span>Items</span>
                          </div>
                          <p className="text-2xl font-bold text-[var(--accent)]">{itemCount}</p>
                        </div>
                      </div>

                      {/* Custom Message */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                          Custom Message (Optional)
                        </label>
                        <textarea
                          placeholder="Add a personal message to the notification..."
                          rows={3}
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          className="input resize-none"
                        />
                      </div>

                      {status === 'error' && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                          {message}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="flex-1 px-4 py-3 border-2 border-[var(--border)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendNotification}
                          disabled={status === 'loading'}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {status === 'loading' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                          {status === 'loading' ? 'Sending...' : 'Send Notification'}
                        </button>
                      </div>
                    </motion.div>
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
