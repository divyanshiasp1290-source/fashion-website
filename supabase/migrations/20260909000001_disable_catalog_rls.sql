-- ==============================================================================
-- MAISON MAKEEVA - PERMIT FULL CATALOG & COLLECTION MANAGEMENT
-- ==============================================================================
-- This migration ensures Admin and API client have full write and read access
-- to collections, products, categories, inventory, and product images.

-- 1. COLLECTIONS TABLE: Allow full access
ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE: Allow full access
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 3. CATEGORIES TABLE: Allow full access
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- 4. PRODUCT IMAGES TABLE: Allow full access
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;

-- 5. INVENTORY TABLE: Allow full access
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
