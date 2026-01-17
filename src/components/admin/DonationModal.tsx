'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, User, Mail, Phone, Package, FileText, Heart } from 'lucide-react'
import { Donation } from '@/types'
import { createDonation, updateDonation } from '@/lib/supabase/queries'

interface DonationModalProps {
  isOpen: boolean
  donation?: Donation | null
  onClose: () => void
  onSuccess?: () => void
}

export function DonationModal({ isOpen, donation, onClose, onSuccess }: DonationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    items_donated: '',
    total_items: 1,
    donation_date: new Date().toISOString().split('T')[0],
    notes: '',
    thank_you_sent: false
  })

  useEffect(() => {
    if (donation) {
      setFormData({
        donor_name: donation.donor_name,
        donor_email: donation.donor_email || '',
        donor_phone: donation.donor_phone || '',
        items_donated: donation.items_donated,
        total_items: donation.total_items,
        donation_date: donation.donation_date,
        notes: donation.notes || '',
        thank_you_sent: donation.thank_you_sent
      })
    } else {
      setFormData({
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        items_donated: '',
        total_items: 1,
        donation_date: new Date().toISOString().split('T')[0],
        notes: '',
        thank_you_sent: false
      })
    }
    setError('')
  }, [donation, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.total_items < 1) {
      setError('Total items must be at least 1')
      setIsLoading(false)
      return
    }

    const donationData = {
      donor_name: formData.donor_name.trim(),
      donor_email: formData.donor_email.trim() || null,
      donor_phone: formData.donor_phone.trim() || null,
      items_donated: formData.items_donated.trim(),
      total_items: Math.max(1, formData.total_items), // Ensure at least 1
      donation_date: formData.donation_date,
      notes: formData.notes.trim() || null,
      thank_you_sent: formData.thank_you_sent,
      thank_you_sent_at: formData.thank_you_sent ? new Date().toISOString() : null
    }

    let result
    if (donation) {
      result = await updateDonation(donation.id, donationData)
    } else {
      result = await createDonation(donationData)
    }

    setIsLoading(false)

    if (result) {
      onSuccess?.()
      onClose()
    } else {
      setError('Failed to save donation. Please check all fields and try again.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--border)]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border)] px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {donation ? 'Edit Donation' : 'Log Donation'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              {/* Donor Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />
                  Donor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter donor's name"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  required
                  className="input"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.donor_email}
                    onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={formData.donor_phone}
                    onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Items Donated */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  <Package className="w-4 h-4 inline mr-1" />
                  Items Donated <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="List the items donated (e.g., 5 notebooks, 3 pens, 2 shirts)"
                  rows={3}
                  value={formData.items_donated}
                  onChange={(e) => setFormData({ ...formData, items_donated: e.target.value })}
                  required
                  className="input resize-none"
                />
              </div>

              {/* Total Items & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Total Items
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={formData.total_items}
                      onChange={(e) => setFormData({ ...formData, total_items: parseInt(e.target.value) || 1 })}
                      className="input pr-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, total_items: formData.total_items + 1 })}
                        className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors group"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                          <path d="M7 3 L11 8 L3 8 Z" fill="currentColor" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, total_items: Math.max(1, formData.total_items - 1) })}
                        className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors group"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                          <path d="M7 11 L11 6 L3 6 Z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Donation Date
                  </label>
                  <input
                    type="date"
                    value={formData.donation_date}
                    onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Notes
                </label>
                <textarea
                  placeholder="Any additional notes..."
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input resize-none"
                />
              </div>

              {/* Thank You Sent */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <input
                  type="checkbox"
                  id="thank_you_sent"
                  checked={formData.thank_you_sent}
                  onChange={(e) => setFormData({ ...formData, thank_you_sent: e.target.checked })}
                  className="w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label htmlFor="thank_you_sent" className="text-sm text-[var(--text-secondary)] cursor-pointer">
                  Thank you message sent to donor
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-[var(--border)] text-[var(--text-secondary)] font-medium rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Saving...' : donation ? 'Update' : 'Log Donation'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
