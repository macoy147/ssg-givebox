'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Upload, Trash2, Copy } from 'lucide-react'
import Image from 'next/image'
import { Item, ItemCategory } from '@/types'
import { createItem } from '@/lib/supabase/queries'
import { uploadItemImage } from '@/lib/supabase/storage'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  duplicateFrom?: Item | null // For quick duplicate feature
}

export function AddItemModal({ isOpen, onClose, onSuccess, duplicateFrom }: AddItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'school_supplies' as ItemCategory,
    quantity: 1,
    available_date: new Date().toISOString().split('T')[0],
    donated_by: ''
  })

  // Pre-fill form when duplicating
  useEffect(() => {
    if (duplicateFrom && isOpen) {
      setFormData({
        name: `${duplicateFrom.name} (Copy)`,
        description: duplicateFrom.description || '',
        category: duplicateFrom.category,
        quantity: duplicateFrom.quantity,
        available_date: new Date().toISOString().split('T')[0],
        donated_by: duplicateFrom.donated_by || ''
      })
      // Don't copy the image - user should upload new one if needed
      setImagePreview(null)
      setImageFile(null)
    } else if (isOpen && !duplicateFrom) {
      // Reset form for new item
      setFormData({
        name: '',
        description: '',
        category: 'school_supplies',
        quantity: 1,
        available_date: new Date().toISOString().split('T')[0],
        donated_by: ''
      })
      setImagePreview(null)
      setImageFile(null)
    }
  }, [duplicateFrom, isOpen])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    let imageUrl: string | null = null

    // Upload image if selected
    if (imageFile) {
      setIsUploading(true)
      imageUrl = await uploadItemImage(imageFile)
      setIsUploading(false)
      
      if (!imageUrl) {
        setError('Failed to upload image. Please try again.')
        setIsLoading(false)
        return
      }
    }

    const result = await createItem({
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      quantity: formData.quantity,
      available_date: formData.available_date,
      donated_by: formData.donated_by || null,
      status: 'available',
      image_url: imageUrl
    })

    setIsLoading(false)

    if (result) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'school_supplies',
        quantity: 1,
        available_date: new Date().toISOString().split('T')[0],
        donated_by: ''
      })
      setImageFile(null)
      setImagePreview(null)
      onSuccess?.()
    } else {
      setError('Failed to add item. Please check your connection.')
    }
  }

  const handleClose = () => {
    setImageFile(null)
    setImagePreview(null)
    setError('')
    onClose()
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
            onClick={handleClose} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--border)]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border)] px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {duplicateFrom && (
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Copy className="w-4 h-4 text-blue-500" />
                  </div>
                )}
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {duplicateFrom ? 'Duplicate Item' : 'Add New Item'}
                </h2>
              </div>
              <button 
                onClick={handleClose} 
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Product Image <span className="text-[var(--text-muted)]">(Optional)</span>
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <Upload className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">Click to upload image</span>
                    <span className="text-xs text-[var(--text-muted)]">PNG, JPG up to 5MB</span>
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Notebooks (Pack of 5)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Description</label>
                <textarea
                  placeholder="Brief description..."
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
                    className="input"
                  >
                    <option value="school_supplies">📚 School Supplies</option>
                    <option value="clothing">👕 Clothing</option>
                    <option value="food">🍎 Food</option>
                    <option value="hygiene">🧴 Hygiene</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      required
                      className="input pr-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                        className="p-0.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-[var(--text-muted)]">
                          <path d="M6 3 L9 7 L3 7 Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                        className="p-0.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-[var(--text-muted)]">
                          <path d="M6 9 L9 5 L3 5 Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Available Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.available_date}
                  onChange={(e) => setFormData({ ...formData, available_date: e.target.value })}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Donated By <span className="text-[var(--text-muted)]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for anonymous"
                  value={formData.donated_by}
                  onChange={(e) => setFormData({ ...formData, donated_by: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={handleClose}
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
                  {isUploading ? 'Uploading...' : isLoading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}