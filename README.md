# SSG GiveBox 🎁

**Share More. Care More.**

A student donation and item sharing platform by the Supreme Student Government of CTU Daanbantayan Campus.

## Features

### Student Side (Public)
- **Browse Items** - View all available donated items with images
- **Search & Filter** - Search items by name/description, filter by category
- **Item Details** - Click any item to see full details, larger image, and donation info
- **Announcements** - View weekly announcements from SSG
- **Notify Me** - Subscribe to get notified when new items are available
- **FAQ Section** - Common questions about pickup process and eligibility
- **Dark/Light Mode** - Toggle between themes
- **PWA Support** - Installable on mobile devices

### Admin Side
- **Dashboard** - Overview of inventory stats and recent items
- **Inventory Management** - Full CRUD for donated items with image upload
- **Bulk Actions** - Select multiple items to archive or delete at once
- **Quick Duplicate** - Copy existing items to add similar ones faster
- **Export Reports** - Download inventory as PDF (well-designed) or Excel/CSV
- **Donation Tracking** - Log donations with donor info and thank-you status
- **Announcements** - Create and publish weekly announcements
- **Daily Snapshots** - Before/after inventory comparison with AI analysis
- **Settings** - Configure pickup location, day, and time

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Getting Started

### 1. Clone and Install

```bash
cd ssg-givebox
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Go to **Settings > API** and copy your project URL and anon key

### 3. Set Up Storage for Item Images

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket** and create a bucket named `item-images`
3. Enable **Public bucket** option
4. Go to **Policies** tab and add these policies:

**Allow public read access:**
```sql
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');
```

**Allow authenticated users to upload:**
```sql
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');
```

**Allow authenticated users to delete:**
```sql
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');
```

### 4. Configure Environment

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Create Admin User

In Supabase Dashboard:
1. Go to **Authentication > Users**
2. Click **Add User** and create an admin account

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the student view.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Project Structure

```
ssg-givebox/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Student view (public)
│   │   ├── login/                # Admin login
│   │   └── admin/                # Admin dashboard
│   │       ├── page.tsx          # Dashboard
│   │       ├── inventory/        # Inventory management
│   │       ├── donations/        # Donation tracking
│   │       ├── announcements/    # Announcements
│   │       └── settings/         # Settings
│   ├── components/
│   │   ├── ItemDetailModal.tsx   # Item detail popup
│   │   ├── SearchBar.tsx         # Search component
│   │   ├── FAQSection.tsx        # FAQ accordion
│   │   ├── NotifyMe.tsx          # Notification subscription
│   │   ├── ui/                   # Reusable UI components
│   │   └── admin/                # Admin-specific components
│   │       ├── AddItemModal.tsx
│   │       ├── EditItemModal.tsx
│   │       ├── BulkActionsBar.tsx
│   │       ├── ExportReports.tsx
│   │       ├── DonationModal.tsx
│   │       └── SnapshotPanel.tsx
│   ├── lib/
│   │   ├── supabase/             # Supabase client & queries
│   │   └── utils.ts              # Utility functions
│   └── types/                    # TypeScript types
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # App icons
└── supabase/
    └── schema.sql                # Database schema
```

## Color Scheme

- **Primary (Red):** #DC2626
- **Secondary (Orange):** #EA580C
- **Accent (Yellow):** #F59E0B
- **Sidebar (Dark):** #1A1F37
- **Background:** #FEF7F0

## License

© 2026 SSG GiveBox - CTU Daanbantayan Campus
