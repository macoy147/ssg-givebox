'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Megaphone, Calendar, FileText, Send, Save } from 'lucide-react'
import { Announcement } from '@/types'
import { createAnnouncement, updateAnnouncement } from '@/lib/supabase/queries'

interface AnnouncementModalProps {
  isOpen: boolean
  announcement?: Announcement | null
  onClose: () => void
  onSuccess?: () => void
}

export function AnnouncementModal({ isOpen, announcement, onClose, onSuccess }: AnnouncementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const getNextFriday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
    const nextFriday = new Date(today)
    nextFriday.setDate(today.getDate() + daysUntilFriday)
    return nextFriday.toISOString().split('T')[0]
  }

  const getWeekEnd = (startDate: string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    week_start: getNextFriday(),
    week_end: getWeekEnd(getNextFriday()),
    is_published: false
  })

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        week_start: announcement.week_start,
        week_end: announcement.week_end,
        is_published: announcement.is_published
      })
    } else {
      const nextFriday = getNextFriday()
      setFormData({
        title: '',
        content: '',
        week_start: nextFriday,
        week_end: getWeekEnd(nextFriday),
        is_published: false
      })
    }
    setError('')
  }, [announcement, isOpen])

  const handleWeekStartChange = (date: string) => {
    setFormData({
      ...formData,
      week_start: date,
      week_end: getWeekEnd(date)
    })
  }

  const handleSubmit = async (publish: boolean) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError('')

    const data = {
      ...formData,
      is_published: publish
    }

    let result
    if (announcement) {
      result = await updateAnnouncement(announcement.id, data)
    } else {
      result = await createAnnouncement(data)
    }

    setIsLoading(false)

    if (result) {
      onSuccess?.()
      onClose()
    } else {
      setError('Failed to save announcement. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--border)]"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border)] px-5 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-pink-500 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {announcement ? 'Edit Announcement' : 'New Announcement'}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">Weekly update for students</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                <FileText className="w-4 h-4 inline mr-1" />
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Week 5 Available Items"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
              />
            </div>

            {/* Week Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Week Start <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.week_start}
                  onChange={(e) => handleWeekStartChange(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Week End
                </label>
                <input
                  type="date"
                  value={formData.week_end}
                  onChange={(e) => setFormData({ ...formData, week_end: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Write your announcement here... Include details about available items, pickup instructions, etc."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input resize-none"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Tip: Be clear about what items are available and any special instructions.
              </p>
            </div>

            {/* Status indicator */}
            {announcement && (
              <div className={`p-3 rounded-xl flex items-center gap-2 ${
                formData.is_published 
                  ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                  : 'bg-amber-500/10 text-amber-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${formData.is_published ? 'bg-[var(--success)]' : 'bg-amber-500'}`} />
                <span className="text-sm font-medium">
                  {formData.is_published ? 'Currently Published' : 'Draft - Not visible to students'}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-[var(--border)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <button 
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publish
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}