import { createClient } from './client'
import { Item, Announcement, ItemCategory, Subscriber, Donation } from '@/types'

// Items
export async function getAvailableItems(): Promise<Item[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error)
    return []
  }

  return data || []
}

export async function getAllItems(): Promise<Item[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error)
    return []
  }

  return data || []
}

export async function createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('items')
    .insert([item])
    .select()
    .single()

  if (error) {
    console.error('Error creating item:', error)
    return null
  }

  return data
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating item:', error)
    return null
  }

  return data
}

export async function deleteItem(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting item:', error)
    return false
  }

  return true
}

// Dashboard Stats
export async function getDashboardStats() {
  const supabase = createClient()
  if (!supabase) {
    return {
      totalItems: 0,
      availableItems: 0,
      claimedItems: 0,
      categoryCounts: {} as Record<ItemCategory, number>
    }
  }

  const { data: items, error } = await supabase
    .from('items')
    .select('*')

  if (error || !items) {
    return {
      totalItems: 0,
      availableItems: 0,
      claimedItems: 0,
      categoryCounts: {} as Record<ItemCategory, number>
    }
  }

  const categoryCounts: Record<string, number> = {}
  items.forEach((item: Item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
  })

  return {
    totalItems: items.length,
    availableItems: items.filter((i: Item) => i.status === 'available').length,
    claimedItems: items.filter((i: Item) => i.status === 'claimed').length,
    categoryCounts: categoryCounts as Record<ItemCategory, number>
  }
}

// Announcements
export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
    return []
  }

  return data || []
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
    return []
  }

  return data || []
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement])
    .select()
    .single()

  if (error) {
    console.error('Error creating announcement:', error)
    return null
  }

  return data
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating announcement:', error)
    return null
  }

  return data
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting announcement:', error)
    return false
  }

  return true
}

// Settings
export async function getSettings(): Promise<Record<string, string>> {
  const supabase = createClient()
  if (!supabase) {
    return {
      pickup_location: 'Beside SSG Office',
      pickup_day: 'Friday',
      pickup_time: '8:00 AM - 9:00 PM'
    }
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error || !data) {
    return {
      pickup_location: 'Beside SSG Office',
      pickup_day: 'Friday',
      pickup_time: '8:00 AM - 9:00 PM'
    }
  }

  const settings: Record<string, string> = {}
  data.forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value
  })

  return settings
}

export async function updateSettings(settings: Record<string, string>): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  try {
    // Update or insert each setting
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' })

      if (error) {
        console.error(`Error updating setting ${key}:`, error.message, error.code, error.details)
        return false
      }
    }
    return true
  } catch (error) {
    console.error('Error updating settings:', error)
    return false
  }
}


// Subscribers
export async function addSubscriber(email: string): Promise<Subscriber | null> {
  const supabase = createClient()
  if (!supabase) {
    console.error('Supabase client not initialized')
    return null
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email, is_active: true }])
    .select()
    .single()

  if (error) {
    // Check if already subscribed (unique constraint violation)
    if (error.code === '23505') {
      // Reactivate if exists
      const { data: existing } = await supabase
        .from('subscribers')
        .update({ is_active: true, unsubscribed_at: null })
        .eq('email', email)
        .select()
        .single()
      return existing
    }
    console.error('Error adding subscriber:', error.message, error.code, error.details)
    return null
  }

  return data
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }

  return data || []
}

// Donations
export async function createDonation(donation: Omit<Donation, 'id' | 'created_at'>): Promise<Donation | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('donations')
    .insert([donation])
    .select()
    .single()

  if (error) {
    console.error('Error creating donation:', error)
    return null
  }

  return data
}

export async function getAllDonations(): Promise<Donation[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('donation_date', { ascending: false })

  if (error) {
    console.error('Error fetching donations:', error)
    return []
  }

  return data || []
}

export async function updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('donations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating donation:', error)
    return null
  }

  return data
}

export async function deleteDonation(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting donation:', error)
    return false
  }

  return true
}

// Bulk operations
export async function bulkUpdateItemStatus(ids: string[], status: 'available' | 'claimed' | 'archived'): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('items')
    .update({ status })
    .in('id', ids)

  if (error) {
    console.error('Error bulk updating items:', error)
    return false
  }

  return true
}

export async function bulkDeleteItems(ids: string[]): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  console.log('Deleting items with IDs:', ids)

  const { error, count } = await supabase
    .from('items')
    .delete()
    .in('id', ids)
    .select()

  if (error) {
    console.error('Error bulk deleting items:', error)
    return false
  }

  console.log('Successfully deleted items, count:', count)
  return true
}
