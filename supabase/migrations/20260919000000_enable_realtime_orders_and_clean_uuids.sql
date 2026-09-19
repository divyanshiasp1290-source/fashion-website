-- ==============================================================================
-- MAISON MAKEEVA - REAL-TIME ORDERS & UUID STANDARDIZATION MIGRATION
-- Migration File: 20260919000000_enable_realtime_orders_and_clean_uuids.sql
-- ==============================================================================

-- 1. ENSURE PGCRYPTO EXTENSION IS ACTIVE
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
SET search_path = public, extensions, auth;

-- 2. DISABLE ROW LEVEL SECURITY (RLS) ON TRANSACTIONAL TABLES
-- Matching collections, products, categories, product_images, and inventory
-- so the website API and Supabase Realtime WebSocket operate with zero lag.
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- 3. ENABLE SUPABASE REALTIME FOR REAL-TIME CLOUD BROADCAST
-- Allows connected clients to instantly receive live changes made via Admin Panel or Supabase Table Editor
DO $$
BEGIN
    -- Add orders to publication if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    -- Add order_items to publication if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
    END IF;

    -- Add customers to publication if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'customers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
    END IF;
END $$;

-- Enable full row replication for orders and order_items so payload.new and payload.old are always populated
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

-- 4. CONVERT OLD SEEDED 00000000-... DETERMINISTIC UUIDS TO STANDARD RANDOM UUIDS
-- Safely drop constraint, update UUIDs, and re-add with ON UPDATE CASCADE
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

DO $$
DECLARE
    r RECORD;
    v_new_order_id UUID;
BEGIN
    -- A. Update order_items with random UUIDs for items having the 00000000- prefix
    UPDATE public.order_items
    SET id = gen_random_uuid()
    WHERE id::text LIKE '00000000-%';

    -- B. Update orders and matching order_id in order_items
    FOR r IN SELECT id FROM public.orders WHERE id::text LIKE '00000000-%' LOOP
        v_new_order_id := gen_random_uuid();
        
        -- Update parent order first
        UPDATE public.orders 
        SET id = v_new_order_id 
        WHERE id = r.id;

        -- Update child order items to point to new order id
        UPDATE public.order_items 
        SET order_id = v_new_order_id 
        WHERE order_id = r.id;
    END LOOP;
END $$;

-- Re-add foreign key with ON UPDATE CASCADE & ON DELETE CASCADE
ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES public.orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

-- 5. SET PERMANENT DEFAULT VALUES FOR ALL FUTURE ORDERS
ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.order_items ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 6. ENSURE GRANTS FOR ANON AND AUTHENTICATED ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated;
GRANT ALL ON TABLE public.order_items TO anon, authenticated;
GRANT ALL ON TABLE public.customers TO anon, authenticated;
GRANT ALL ON TABLE public.contact_messages TO anon, authenticated;
GRANT ALL ON TABLE public.newsletter_subscribers TO anon, authenticated;
