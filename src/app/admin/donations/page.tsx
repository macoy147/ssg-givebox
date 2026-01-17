'use client'

import { useState, useEffect } from 'react'
import { Plus, Heart, Search, X, Edit2, Trash2, Mail, CheckCircle, Clock } from 'lucide-react'
import { Donation } from '@/types'
import { getAllDonations, deleteDonation, updateDonation } from '@/lib/supabase/queries'
import { DonationModal } from '@/components/admin/DonationModal'

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Donation | null>(null)
  const [sendingThankYou, setSendingThankYou] = useState<string | null>(null)

  const fetchDonations = async () => {
    const data = await getAllDonations()
    setDonations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const success = await deleteDonation(deleteTarget.id)
    if (success) {
      setDonations(donations.filter(d => d.id !== deleteTarget.id))
    }
    setDeleteTarget(null)
  }

  const handleMarkThankYou = async (donation: Donation) => {
    if (!donation.donor_email) {
      alert('No email address provided for this donor.')
      return
    }

    setSendingThankYou(donation.id)

    // Send thank you email
    try {
      const response = await fetch('/api/thank-donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: donation.donor_email,
          donorName: donation.donor_name,
          itemsDonated: donation.items_donated,
          totalItems: donation.total_items,
          donationDate: donation.donation_date
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      // Update donation record
      const updated = await updateDonation(donation.id, {
        thank_you_sent: true,
        thank_you_sent_at: new Date().toISOString()
      })
      
      if (updated) {
        setDonations(donations.map(d => d.id === donation.id ? { ...d, thank_you_sent: true, thank_you_sent_at: new Date().toISOString() } : d))
        alert('Thank you email sent successfully!')
      }
    } catch (error) {
      console.error('Error sending thank you email:', error)
      alert('Failed to send thank you email. Please try again.')
    } finally {
      setSendingThankYou(null)
    }
  }

  const filteredDonations = donations.filter(d =>
    d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.items_donated.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const totalDonations = donations.length
  const totalItems = donations.reduce((sum, d) => sum + d.total_items, 0)
  const pendingThankYou = donations.filter(d => !d.thank_you_sent).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Donation Tracking</h1>
          <p className="text-[var(--text-secondary)] mt-1">Track and acknowledge donations</p>
        </div>
        <button
          onClick={() => {
            setEditingDonation(null)
            setIsModalOpen(true)
          }}
          className="btn-primary inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/25"
        >
          <Plus className="w-5 h-5" />
          Log Donation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalDonations}</p>
              <p className="text-sm text-[var(--text-muted)]">Total Donations</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalItems}</p>
              <p className="text-sm text-[var(--text-muted)]">Items Donated</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{pendingThankYou}</p>
              <p className="text-sm text-[var(--text-muted)]">Pending Thank You</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search donors or items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full pr-10"
          style={{ paddingLeft: '44px' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Donations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="flex-1">
                  <div className="h-5 w-1/3 skeleton mb-2" />
                  <div className="h-4 w-2/3 skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {donations.length === 0 ? 'No donations logged yet' : 'No donations found'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            {donations.length === 0 
              ? 'Start tracking donations to acknowledge your generous donors.' 
              : 'Try adjusting your search.'}
          </p>
          {donations.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log First Donation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDonations.map((donation) => (
            <div
              key={donation.id}
              className="card p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {donation.donor_name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {donation.donor_name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        {new Date(donation.donation_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {' • '}
                        {donation.total_items} {donation.total_items === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    {/* Thank You Status */}
                    {donation.thank_you_sent ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Thanked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkThankYou(donation)}
                        disabled={sendingThankYou === donation.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send thank you email"
                      >
                        <Mail className="w-3 h-3" />
                        {sendingThankYou === donation.id ? 'Sending...' : 'Send Thanks'}
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
                    {donation.items_donated}
                  </p>

                  {/* Contact & Notes */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                    {donation.donor_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {donation.donor_email}
                      </span>
                    )}
                    {donation.notes && (
                      <span className="italic">Note: {donation.notes}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingDonation(donation)
                      setIsModalOpen(true)
                    }}
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-[var(--text-muted)] hover:text-blue-500 transition-all"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(donation)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal
        isOpen={isModalOpen}
        donation={editingDonation}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDonation(null)
        }}
        onSuccess={fetchDonations}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete Donation Record?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This will remove the donation record from {deleteTarget.donor_name}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
