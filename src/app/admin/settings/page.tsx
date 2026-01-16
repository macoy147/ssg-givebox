'use client'

import { useState, useEffect } from 'react'
import { Save, MapPin, Clock, Bell, Loader2 } from 'lucide-react'
import { getSettings } from '@/lib/supabase/queries'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    pickup_location: '',
    pickup_day: '',
    pickup_time: ''
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getSettings()
      setSettings({
        pickup_location: data.pickup_location || '',
        pickup_day: data.pickup_day || '',
        pickup_time: data.pickup_time || ''
      })
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // TODO: Implement save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="text-[var(--text-secondary)] mt-1">Configure pickup details</p>
        </div>
        <div className="space-y-4 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="h-5 w-1/4 skeleton rounded mb-4" />
              <div className="h-12 w-full skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">Configure pickup details and preferences</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Pickup Location */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[var(--accent)]/10">
              <MapPin className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Pickup Location</h3>
              <p className="text-sm text-[var(--text-secondary)]">Where students can claim items</p>
            </div>
          </div>
          <input
            type="text"
            value={settings.pickup_location}
            onChange={(e) => setSettings({ ...settings, pickup_location: e.target.value })}
            placeholder="e.g., SSG Office, 2nd Floor Admin Building"
            className="input"
          />
        </div>

        {/* Schedule */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Pickup Schedule</h3>
              <p className="text-sm text-[var(--text-secondary)]">Regular distribution day and time</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Day</label>
              <input
                type="text"
                value={settings.pickup_day}
                onChange={(e) => setSettings({ ...settings, pickup_day: e.target.value })}
                placeholder="e.g., Friday"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Time</label>
              <input
                type="text"
                value={settings.pickup_time}
                onChange={(e) => setSettings({ ...settings, pickup_time: e.target.value })}
                placeholder="e.g., 8:00 AM - 12:00 PM"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-pink-500/10">
              <Bell className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
              <p className="text-sm text-[var(--text-secondary)]">Configure announcement settings</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                defaultChecked
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--bg-tertiary)]" 
              />
              <span className="text-[var(--text-primary)]">Auto-publish Thursday announcements</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
