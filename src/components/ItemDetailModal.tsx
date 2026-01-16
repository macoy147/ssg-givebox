'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Package, Tag } from 'lucide-react'
import Image from 'next/image'
import { Item, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types'

interface ItemDetailModalProps {
  item: Item | null
  onClose: () => void
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  if (!item) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-[var(--border)]"
        >
          {/* Image Section */}
          <div className="relative h-56 sm:h-64 bg-gradient-to-br from-[var(--accent)]/20 via-pink-500/20 to-amber-500/20">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-8xl"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {CATEGORY_ICONS[item.category]}
                </motion.span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Status badge */}
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-[var(--success)] text-white text-sm font-medium shadow-lg">
                ✓ Available
              </span>
            </div>

            {/* Quantity badge */}
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1.5 rounded-full bg-[var(--accent)] text-white text-sm font-bold shadow-lg">
                Qty: {item.quantity}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
            {/* Title */}
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {item.name}
            </h2>

            {/* Category */}
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-secondary)]">
                {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Description</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-muted)]">Available Date</span>
                </div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {new Date(item.available_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-pink-500" />
                  <span className="text-xs text-[var(--text-muted)]">Quantity</span>
                </div>
                <p className="font-semibold text-[var(--text-primary)]">
                  {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Donated By */}
            {item.donated_by && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-pink-500/10 border border-[var(--accent)]/20">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm text-[var(--text-secondary)]">Donated by</span>
                </div>
                <p className="font-semibold text-[var(--text-primary)] mt-1">
                  {item.donated_by}
                </p>
              </div>
            )}

            {/* Pickup Info */}
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                📍 Visit the SSG Office on Friday to claim this item. First come, first served!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
