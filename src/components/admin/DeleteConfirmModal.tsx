'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  itemName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({ isOpen, itemName, isDeleting, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onCancel} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-sm border border-[var(--border)] overflow-hidden"
          >
            {/* Warning Header */}
            <div className="bg-red-500/10 p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3"
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Delete Item?</h2>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-[var(--text-secondary)] mb-2">
                You are about to delete:
              </p>
              <p className="font-semibold text-[var(--text-primary)] text-lg mb-4 px-4 py-2 bg-[var(--bg-tertiary)] rounded-xl">
                {itemName}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                This action cannot be undone. The item will be permanently removed from your inventory.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
              <button 
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border-2 border-[var(--border)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}