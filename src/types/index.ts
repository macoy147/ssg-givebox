export type ItemCategory = 
  | 'school_supplies' 
  | 'clothing' 
  | 'food' 
  | 'hygiene' 
  | 'other'

export type ItemStatus = 'available' | 'claimed' | 'archived'

export interface Item {
  id: string
  name: string
  description: string | null
  category: ItemCategory
  quantity: number
  image_url: string | null
  available_date: string
  status: ItemStatus
  donated_by: string | null
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  week_start: string
  week_end: string
  is_published: boolean
  created_at: string
}

export interface DashboardStats {
  totalItems: number
  availableThisWeek: number
  totalClaimed: number
  categoryCounts: Record<ItemCategory, number>
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  school_supplies: 'School Supplies',
  clothing: 'Clothing',
  food: 'Food',
  hygiene: 'Hygiene',
  other: 'Other'
}

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  school_supplies: '📚',
  clothing: '👕',
  food: '🍎',
  hygiene: '🧴',
  other: '📦'
}

// Inventory Snapshot for before/after comparison
export interface InventorySnapshot {
  id: string
  snapshot_date: string
  snapshot_time: 'morning' | 'evening'
  items: SnapshotItem[]
  total_items: number
  total_quantity: number
  created_at: string
}

export interface SnapshotItem {
  id: string
  name: string
  category: ItemCategory
  quantity: number
  status: ItemStatus
}

export interface InventoryReport {
  id: string
  report_date: string
  morning_snapshot_id: string
  evening_snapshot_id: string
  items_added: SnapshotItem[]
  items_removed: SnapshotItem[]
  items_changed: { item: SnapshotItem; quantity_change: number }[]
  ai_analysis?: string
  created_at: string
}

// Subscriber for "Notify Me" feature
export interface Subscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
}

// Donation tracking
export interface Donation {
  id: string
  donor_name: string
  donor_email: string | null
  donor_phone: string | null
  items_donated: string
  total_items: number
  donation_date: string
  notes: string | null
  thank_you_sent: boolean
  thank_you_sent_at: string | null
  created_at: string
}

// FAQ Item
export interface FAQItem {
  question: string
  answer: string
}
