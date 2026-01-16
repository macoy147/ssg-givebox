-- SSG GiveBox Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('school_supplies', 'clothing', 'food', 'hygiene', 'other')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  image_url TEXT,
  available_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'archived')),
  donated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (for pickup location, schedule, etc.)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('pickup_location', 'SSG Office, 2nd Floor Admin Building'),
  ('pickup_day', 'Friday'),
  ('pickup_time', '8:00 AM - 12:00 PM'),
  ('auto_publish_thursday', 'true')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to items table
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for items (available status only)
CREATE POLICY "Public can view available items" ON items
  FOR SELECT
  USING (status = 'available');

-- Authenticated users (admins) can do everything with items
CREATE POLICY "Admins can manage items" ON items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public read access for published announcements
CREATE POLICY "Public can view published announcements" ON announcements
  FOR SELECT
  USING (is_published = TRUE);

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public read access for settings
CREATE POLICY "Public can view settings" ON settings
  FOR SELECT
  USING (TRUE);

-- Admins can update settings
CREATE POLICY "Admins can update settings" ON settings
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_available_date ON items(available_date);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_week ON announcements(week_start, week_end);

-- Subscribers table for "Notify Me" feature
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Donations tracking table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  items_donated TEXT NOT NULL, -- JSON array of item names/descriptions
  total_items INTEGER NOT NULL DEFAULT 1,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  thank_you_sent BOOLEAN DEFAULT FALSE,
  thank_you_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (insert only)
CREATE POLICY "Public can subscribe" ON subscribers
  FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view and manage subscribers
CREATE POLICY "Admins can manage subscribers" ON subscribers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS for donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Admins can manage donations
CREATE POLICY "Admins can manage donations" ON donations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_name);

-- Storage bucket for item images (run in Supabase Dashboard > Storage)
-- CREATE BUCKET item-images WITH PUBLIC ACCESS;
