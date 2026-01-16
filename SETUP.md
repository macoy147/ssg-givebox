# SSG GiveBox - Database Setup Guide

This guide will walk you through connecting your SSG GiveBox app to Supabase.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** `ssg-givebox` (or any name you prefer)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose the closest to Philippines (Singapore recommended)
4. Click **"Create new project"** and wait for it to initialize (~2 minutes)

---

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL** - looks like `https://xxxxx.supabase.co`
   - **anon public** key - a long string starting with `eyJ...`

3. Copy these values

---

## Step 3: Configure Environment Variables

1. Open the file `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste the entire contents of `supabase/schema.sql` from your project
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" - this means the tables were created!

---

## Step 5: Create an Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** Your admin email (e.g., `admin@ctu.edu.ph`)
   - **Password:** A secure password
   - Check **"Auto Confirm User"**
4. Click **"Create user"**

---

## Step 6: Test Your Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
   - The homepage should load (no items shown - that's correct!)

3. Go to http://localhost:3000/login
   - Login with the admin credentials you created
   - You should be redirected to the admin dashboard

4. Go to **Inventory** and click **"Add Item"**
   - Fill in the form and submit
   - The item should appear in the list!

5. Go back to http://localhost:3000
   - Your new item should now appear on the public page!

---

## Troubleshooting

### "Database not configured" error
- Make sure `.env.local` has the correct Supabase URL and key
- Restart the dev server after changing `.env.local`

### "Invalid login credentials" error
- Double-check the email and password
- Make sure you checked "Auto Confirm User" when creating the user

### Items not showing up
- Check the browser console for errors
- Verify the database tables were created in Supabase → Table Editor
- Make sure the item status is "available"

### RLS (Row Level Security) errors
- The schema.sql includes RLS policies
- If you see permission errors, go to Supabase → Authentication → Policies
- Make sure the policies from schema.sql were applied

---

## Deploying to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy!

---

## Database Schema Overview

### `items` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Item name |
| description | TEXT | Optional description |
| category | TEXT | school_supplies, clothing, food, electronics, hygiene, other |
| quantity | INT | Number of items |
| image_url | TEXT | Optional image URL |
| available_date | DATE | When item is available |
| status | TEXT | available, claimed, archived |
| donated_by | TEXT | Optional donor name |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### `announcements` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Announcement title |
| content | TEXT | Announcement body |
| week_start | DATE | Week start date |
| week_end | DATE | Week end date |
| is_published | BOOLEAN | Published status |
| created_at | TIMESTAMP | Auto-generated |

### `settings` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | TEXT | Setting name |
| value | TEXT | Setting value |
| updated_at | TIMESTAMP | Auto-updated |

---

## Need Help?

If you encounter issues:
1. Check the browser console (F12 → Console)
2. Check the Supabase logs (Dashboard → Logs)
3. Verify your environment variables are correct
