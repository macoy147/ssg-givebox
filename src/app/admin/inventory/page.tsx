'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Package, Edit2, Trash2, X, Copy, Archive, CheckSquare, Square } from 'lucide-react'
import Image from 'next/image'
import { CATEGORY_LABELS, CATEGORY_ICONS, Item } from '@/types'
import { getAllItems, deleteItem, updateItem } from '@/lib/supabase/queries'
import { AddItemModal } from '@/components/admin/AddItemModal'
import { EditItemModal } from '@/components/admin/EditItemModal'
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal'
import { SnapshotPanel } from '@/components/admin/SnapshotPanel'
import { BulkActionsBar } from '@/components/admin/BulkActionsBar'
import { ExportReports } from '@/components/admin/ExportReports'
import { NotifySubscribersButton } from '@/components/admin/NotifySubscribersButton'

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [duplicateItem, setDuplicateItem] = useState<Item | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  const fetchItems = async () => {
    const data = await getAllItems()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const success = await deleteItem(deleteTarget.id)
    if (success) {
      setItems(items.filter(item => item.id !== deleteTarget.id))
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const handleStatusChange = async (item: Item, newStatus: 'available' | 'claimed' | 'archived') => {
    const updated = await updateItem(item.id, { status: newStatus })
    if (updated) {
      setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i))
    }
  }

  const handleItemAdded = () => {
    fetchItems()
    setIsAddModalOpen(false)
    setDuplicateItem(null)
  }

  const handleItemUpdated = () => {
    fetchItems()
    setEditingItem(null)
  }

  const handleDuplicate = (item: Item) => {
    setDuplicateItem(item)
    setIsAddModalOpen(true)
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map(i => i.id))
    }
  }

  const clearSelection = () => {
    setSelectedIds([])
    setIsSelectionMode(false)
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Count by status
  const availableCount = items.filter(i => i.status === 'available').length
  const archivedCount = items.filter(i => i.status === 'archived').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventory</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {items.length} total • {availableCount} available • {archivedCount} archived
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotifySubscribersButton itemCount={availableCount} />
          <ExportReports items={items} />
          <button
            onClick={() => {
              setDuplicateItem(null)
              setIsAddModalOpen(true)
            }}
            className="btn-primary inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/25"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Snapshot Panel */}
      <SnapshotPanel items={items} />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {/* Selection Toggle */}
        <button
          onClick={() => {
            setIsSelectionMode(!isSelectionMode)
            if (isSelectionMode) setSelectedIds([])
          }}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
            isSelectionMode 
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]' 
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
          }`}
        >
          {isSelectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          <span className="text-sm font-medium">Select</span>
        </button>

        {/* Search Bar - Expands in place */}
        <div className="relative">
          <div 
            className="transition-all duration-300 ease-out"
            style={{
              width: searchExpanded || searchQuery ? '320px' : '42px'
            }}
          >
            {!searchExpanded && !searchQuery ? (
              <button
                onClick={() => setSearchExpanded(true)}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none z-10" />
                <input
                  id="admin-search-input"
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) {
                      setTimeout(() => setSearchExpanded(false), 150)
                    }
                  }}
                  className="input w-full pr-10"
                  style={{ paddingLeft: '44px' }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchExpanded(false)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Categories</option>
          <option value="school_supplies">📚 School Supplies</option>
          <option value="clothing">👕 Clothing</option>
          <option value="food">🍎 Food</option>
          <option value="hygiene">🧴 Hygiene</option>
          <option value="other">📦 Other</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          <option value="available">✓ Available ({availableCount})</option>
          <option value="claimed">Claimed</option>
          <option value="archived">📁 Archived ({archivedCount})</option>
        </select>
      </div>

      {/* Select All (when in selection mode) */}
      {isSelectionMode && filteredItems.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {selectedIds.length === filteredItems.length ? (
              <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedIds.length === filteredItems.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-sm text-[var(--text-muted)]">
              {selectedIds.length} of {filteredItems.length} selected
            </span>
          )}
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-32 skeleton" />
              <div className="p-4">
                <div className="h-5 w-3/4 skeleton mb-3" />
                <div className="h-4 w-full skeleton mb-2" />
                <div className="h-4 w-1/2 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {items.length === 0 ? 'No items yet' : 'No items found'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            {items.length === 0 
              ? 'Start by adding your first donated item.' 
              : 'Try adjusting your search or filters.'}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => isSelectionMode && toggleSelection(item.id)}
              className={`card overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ${
                isSelectionMode ? 'cursor-pointer' : ''
              } ${selectedIds.includes(item.id) ? 'ring-2 ring-[var(--accent)]' : ''}`}
            >
              <div className="h-32 bg-gradient-to-br from-[var(--accent)]/10 via-pink-500/10 to-amber-500/10 flex items-center justify-center relative overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-5xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[item.category]}</span>
                )}
                
                {/* Selection checkbox */}
                {isSelectionMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      selectedIds.includes(item.id)
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'bg-white/80 border-gray-300'
                    }`}>
                      {selectedIds.includes(item.id) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick status badge */}
                <div className="absolute top-3 right-3 z-10">
                  <select
                    value={item.status}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleStatusChange(item, e.target.value as 'available' | 'claimed' | 'archived')
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 cursor-pointer transition-all hover:scale-105 shadow-lg backdrop-blur-sm ${
                      item.status === 'available' 
                        ? 'bg-green-500/90 text-white border-green-400 hover:bg-green-500' 
                        : item.status === 'claimed'
                        ? 'bg-blue-500/90 text-white border-blue-400 hover:bg-blue-500'
                        : 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-500'
                    }`}
                    style={{
                      backgroundImage: item.status === 'available' 
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)'
                        : item.status === 'claimed'
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)'
                    }}
                  >
                    <option value="available">✓ Available</option>
                    <option value="claimed">◉ Claimed</option>
                    <option value="archived">📁 Archived</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors mb-1">
                  {item.name}
                </h3>
                
                <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 min-h-[2.5rem]">
                  {item.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-[var(--text-muted)]">{CATEGORY_LABELS[item.category]}</span>
                  <span className="font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-lg">
                    ×{item.quantity}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(item.available_date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(item)
                      }}
                      className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-purple-500/20 text-[var(--text-muted)] hover:text-purple-500 transition-all"
                      title="Duplicate item"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingItem(item)
                      }}
                      className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-blue-500/20 text-[var(--text-muted)] hover:text-blue-500 transition-all"
                      title="Edit item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(item)
                      }}
                      className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-all"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClearSelection={clearSelection}
        onActionComplete={fetchItems}
      />

      {/* Modals */}
      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false)
          setDuplicateItem(null)
        }} 
        onSuccess={handleItemAdded}
        duplicateFrom={duplicateItem}
      />

      <EditItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={handleItemUpdated}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
