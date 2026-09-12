# Maison Makeeva — Supabase Database & Realtime Setup Guide

This guide details how to configure your Supabase project for the Maison Makeeva platform.

---

## 1. Create a Supabase Project
1. Go to [https://database.new](https://database.new) and sign in.
2. Click **New Project**, select your organization, give it a name (e.g., `maison-makeeva`), and choose a strong database password.
3. Once the project is provisioned, go to **Project Settings** -> **API**.
4. Copy the **Project URL** and the **`anon` `public` Key**.

---

## 2. Configure Environment Variables

In your local `.env` file (and in your **Vercel Project Settings** -> **Environment Variables**):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key-here
```

> **Note**: The application operates gracefully in Development Mock Mode if these environment variables are empty or not yet configured. As soon as valid credentials are provided, live Supabase queries and Realtime channels activate automatically.

---

## 3. Run Database Migrations

Open the **SQL Editor** in your Supabase dashboard and run the migrations in this order:

1. **Initial Schema**: Run [`supabase/migrations/20260907000000_init_schema.sql`](./migrations/20260907000000_init_schema.sql)
   - Creates tables: `categories`, `collections`, `products`, `product_images`, `inventory`, `customers`, `addresses`, `wishlist`, `cart`, `orders`, `order_items`, `contact_messages`, `newsletter_subscribers`.
2. **Realtime & Security**: Run [`supabase/migrations/20260912000000_realtime_and_security.sql`](./migrations/20260912000000_realtime_and_security.sql)
   - Configures PostgreSQL `REPLICA IDENTITY FULL` on all tables.
   - Adds all tables to the `supabase_realtime` publication.
   - Configures Row Level Security (RLS) policies for public visitors, clients, and administrators.
3. **Seed Data (Development/Initial Launch)**: Run [`supabase/seed.sql`](./seed.sql)
   - Seeds the SS26 runway collection, categories, products with photography, inventory variants, and initial settings.

---

## 4. Verify Realtime in Supabase Dashboard
1. Go to **Database** -> **Publications**.
2. Click on `supabase_realtime`.
3. Verify that the following tables have Realtime enabled:
   - `products`
   - `product_images`
   - `categories`
   - `collections`
   - `inventory`
   - `orders`
   - `order_items`
   - `customers`
   - `contact_messages`
   - `newsletter_subscribers`

---

## 5. Storage Bucket Configuration
1. Go to **Storage** -> **Buckets**.
2. Ensure a public bucket named `product-images` exists.
3. If not, click **New Bucket**, name it `product-images`, and set it to **Public**.

---

## 6. Admin Authentication
- Dedicated master admin ID: `admin@maisonmakeeva.com`
- Dedicated passcode: `_Admin@1290`
- Access portal: `https://your-domain.com/admin`
