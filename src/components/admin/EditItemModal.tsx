'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Upload, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Item, ItemCategory } from '@/types'
import { updateItem } from '@/lib/supabase/queries'
import { uploadItemImage, deleteItemImage } from '@/lib/supabase/storage'

interface EditItemModalProps {
  item: Item | null
  onClose: () => void
  onSuccess?: () => void
}

export function EditItemModal({ item, onClose, onSuccess }: EditItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'school_supplies' as ItemCategory,
    quantity: 1,
    available_date: '',
    donated_by: '',
    status: 'available' as 'available' | 'claimed' | 'archived'
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        quantity: item.quantity,
        available_date: item.available_date,
        donated_by: item.donated_by || '',
        status: item.status
      })
      setImagePreview(item.image_url)
      setImageFile(null)
      setRemoveCurrentImage(false)
      setError('')
    }
  }, [item])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveCurrentImage(false)
    setError('')
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveCurrentImage(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setIsLoading(true)
    setError('')

    let imageUrl: string | null = item.image_url

    // Handle image changes
    if (imageFile) {
      // Upload new image
      setIsUploading(true)
      const newImageUrl = await uploadItemImage(imageFile)
      setIsUploading(false)
      
      if (!newImageUrl) {
        setError('Failed to upload image. Please try again.')
        setIsLoading(false)
        return
      }

      // Delete old image if exists
      if (item.image_url) {
        await deleteItemImage(item.image_url)
      }

      imageUrl = newImageUrl
    } else if (removeCurrentImage && item.image_url) {
      // Delete current image
      await deleteItemImage(item.image_url)
      imageUrl = null
    }

    const result = await updateItem(item.id, {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      quantity: formData.quantity,
      available_date: formData.available_date,
      donated_by: formData.donated_by || null,
      status: formData.status,
      image_url: imageUrl
    })

    setIsLoading(false)

    if (result) {
      onSuccess?.()
    } else {
      setError('Failed to update item. Please try again.')
    }
  }

  if (!item) return null

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
          className="relative bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--border)]"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border)] px-5 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit Item</h2>
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Product Image
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
                <input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  required
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'claimed' | 'archived' })}
                  className="input"
                >
                  <option value="available">Available</option>
                  <option value="claimed">Claimed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
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
                {isUploading ? 'Uploading...' : isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}