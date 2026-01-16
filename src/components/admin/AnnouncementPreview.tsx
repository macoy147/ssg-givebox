'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin, Megaphone } from 'lucide-react'
import { Announcement } from '@/types'

interface AnnouncementPreviewProps {
  announcement: Announcement | null
  onClose: () => void
}

export function AnnouncementPreview({ announcement, onClose }: AnnouncementPreviewProps) {
  if (!announcement) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

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
          className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[var(--border)]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[var(--accent)] to-pink-500 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">SSG GiveBox Announcement</p>
                  <h2 className="text-xl font-bold">{announcement.title}</h2>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(announcement.week_start)} - {formatDate(announcement.week_end)}</span>
              </div>
              <div className={`px-3 py-1.5 rounded-full font-medium ${
                announcement.is_published 
                  ? 'bg-green-500/20 text-green-100' 
                  : 'bg-amber-500/20 text-amber-100'
              }`}>
                {announcement.is_published ? '● Published' : '○ Draft'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="prose prose-sm max-w-none">
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                {announcement.content}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Pickup Time</span>
                </div>
                <p className="text-[var(--text-primary)] font-semibold">Friday, 8:00 AM - 10:00 PM</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-[var(--text-primary)] font-semibold">Beside SSG Office</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
            <p className="text-center text-sm text-[var(--text-muted)]">
              This is how students will see this announcement on the public page.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}