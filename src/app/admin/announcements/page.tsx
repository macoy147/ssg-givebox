'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Megaphone, 
  Calendar, 
  Eye, 
  Edit2, 
  Trash2, 
  Send, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Announcement } from '@/types'
import { getAllAnnouncements, deleteAnnouncement, updateAnnouncement } from '@/lib/supabase/queries'
import { AnnouncementModal } from '@/components/admin/AnnouncementModal'
import { AnnouncementPreview } from '@/components/admin/AnnouncementPreview'
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchAnnouncements = async () => {
    const data = await getAllAnnouncements()
    setAnnouncements(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const success = await deleteAnnouncement(deleteTarget.id)
    if (success) {
      setAnnouncements(announcements.filter(a => a.id !== deleteTarget.id))
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const togglePublish = async (announcement: Announcement) => {
    setTogglingId(announcement.id)
    const updated = await updateAnnouncement(announcement.id, { 
      is_published: !announcement.is_published 
    })
    if (updated) {
      setAnnouncements(announcements.map(a => 
        a.id === announcement.id ? { ...a, is_published: !a.is_published } : a
      ))
    }
    setTogglingId(null)
  }

  const handleSuccess = () => {
    fetchAnnouncements()
    setIsModalOpen(false)
    setEditingAnnouncement(null)
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
  }

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Past'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }

  const publishedCount = announcements.filter(a => a.is_published).length
  const draftCount = announcements.filter(a => !a.is_published).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Announcements</h1>
          <p className="text-[var(--text-secondary)] mt-1">Create weekly announcements for students</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/25"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{announcements.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{publishedCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Published</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{draftCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Drafts</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">Fri</p>
              <p className="text-xs text-[var(--text-muted)]">Publish Day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="h-6 w-1/3 skeleton rounded mb-3" />
              <div className="h-4 w-full skeleton rounded mb-2" />
              <div className="h-4 w-2/3 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No announcements yet</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Create your first weekly announcement to inform students about available items for pickup.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="card overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Status Bar */}
              <div className={`h-1 ${announcement.is_published ? 'bg-[var(--success)]' : 'bg-amber-500'}`} />
              
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Title & Status */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        announcement.is_published 
                          ? 'bg-[var(--success)]/10' 
                          : 'bg-amber-500/10'
                      }`}>
                        <Megaphone className={`w-5 h-5 ${
                          announcement.is_published ? 'text-[var(--success)]' : 'text-amber-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                            {announcement.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            announcement.is_published 
                              ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {announcement.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateRange(announcement.week_start, announcement.week_end)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            getRelativeTime(announcement.week_start) === 'Past' 
                              ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {getRelativeTime(announcement.week_start)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-[var(--text-secondary)] line-clamp-2 ml-13 pl-0.5">
                      {announcement.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:flex-col">
                    <button 
                      onClick={() => setPreviewAnnouncement(announcement)}
                      className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-blue-500/20 text-[var(--text-muted)] hover:text-blue-500 transition-all"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-amber-500/20 text-[var(--text-muted)] hover:text-amber-500 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => togglePublish(announcement)}
                      disabled={togglingId === announcement.id}
                      className={`p-2.5 rounded-xl transition-all ${
                        announcement.is_published
                          ? 'bg-[var(--bg-tertiary)] hover:bg-gray-500/20 text-[var(--text-muted)] hover:text-gray-500'
                          : 'bg-[var(--success)]/10 hover:bg-[var(--success)]/20 text-[var(--success)]'
                      }`}
                      title={announcement.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {togglingId === announcement.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(announcement)}
                      className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnnouncementModal
        isOpen={isModalOpen || !!editingAnnouncement}
        announcement={editingAnnouncement}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAnnouncement(null)
        }}
        onSuccess={handleSuccess}
      />

      <AnnouncementPreview
        announcement={previewAnnouncement}
        onClose={() => setPreviewAnnouncement(null)}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}