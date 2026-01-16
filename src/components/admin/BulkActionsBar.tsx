'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Archive, CheckCircle, X, Loader2, AlertTriangle } from 'lucide-react'
import { bulkUpdateItemStatus, bulkDeleteItems } from '@/lib/supabase/queries'

interface BulkActionsBarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onActionComplete: () => void
}

export function BulkActionsBar({ selectedIds, onClearSelection, onActionComplete }: BulkActionsBarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleBulkArchive = async () => {
    setIsLoading(true)
    setAction('archive')
    const success = await bulkUpdateItemStatus(selectedIds, 'archived')
    setIsLoading(false)
    setAction(null)
    if (success) {
      onActionComplete()
      onClearSelection()
    }
  }

  const handleBulkAvailable = async () => {
    setIsLoading(true)
    setAction('available')
    const success = await bulkUpdateItemStatus(selectedIds, 'available')
    setIsLoading(false)
    setAction(null)
    if (success) {
      onActionComplete()
      onClearSelection()
    }
  }

  const handleBulkDelete = async () => {
    setIsLoading(true)
    setAction('delete')
    const success = await bulkDeleteItems(selectedIds)
    setIsLoading(false)
    setAction(null)
    setShowDeleteConfirm(false)
    if (success) {
      onActionComplete()
      onClearSelection()
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] shadow-2xl">
            {/* Selection count */}
            <div className="flex items-center gap-2 pr-3 border-r border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white text-sm font-bold">{selectedIds.length}</span>
              </div>
              <span className="text-sm text-[var(--text-secondary)] hidden sm:inline">
                {selectedIds.length === 1 ? 'item' : 'items'} selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleBulkAvailable}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--success)] hover:bg-[var(--success)]/10 transition-colors disabled:opacity-50"
                title="Mark as Available"
              >
                {isLoading && action === 'available' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Available</span>
              </button>

              <button
                onClick={handleBulkArchive}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                title="Archive"
              >
                {isLoading && action === 'archive' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Archive</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                title="Delete"
              >
                {isLoading && action === 'delete' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>

            {/* Clear selection */}
            <button
              onClick={onClearSelection}
              className="ml-2 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[var(--border)]"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              
              <h3 className="text-lg font-semibold text-[var(--text-primary)] text-center mb-2">
                Delete {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'}?
              </h3>
              
              <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
                This action cannot be undone. All selected items will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
