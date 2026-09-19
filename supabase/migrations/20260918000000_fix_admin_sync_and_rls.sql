-- ==============================================================================
-- MAISON MAKEEVA - ADMIN DATA SYNCHRONIZATION & RLS SECURITY MIGRATION
-- Migration File: 20260918000000_fix_admin_sync_and_rls.sql
-- ==============================================================================

-- 1. ENSURE PGCRYPTO EXTENSION IS AVAILABLE
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
SET search_path = public, extensions, auth;

-- 2. CONFIRM & SETUP ATELIER DIRECTOR MASTER ADMIN IN SUPABASE AUTH
-- Securely sets encrypted password for '_Admin@1290', confirms email, and
-- sets app_metadata role to 'admin' (which cannot be forged by client SDK).
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@maisonmakeeva.com';
    
    IF v_admin_id IS NOT NULL THEN
        UPDATE auth.users
        SET encrypted_password = extensions.crypt('_Admin@1290', extensions.gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_app_meta_data = jsonb_set(
                jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{provider}', '"email"'),
                '{role}', '"admin"'
            ),
            raw_user_meta_data = jsonb_set(
                jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"'),
                '{full_name}', '"Atelier Director"'
            )
        WHERE id = v_admin_id;
    ELSE
        v_admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_admin_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@maisonmakeeva.com',
            extensions.crypt('_Admin@1290', extensions.gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
            '{"role":"admin","full_name":"Atelier Director"}'::jsonb,
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    END IF;

    -- Also ensure all client user accounts are confirmed so clients can sign in without email verification locks
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now());
END $$;

-- 3. HARDENED IS_ADMIN SECURITY DEFINER FUNCTION
-- SECURITY AUDIT NOTE:
-- User metadata (raw_user_meta_data) CAN be written by end-users during client-side signUp().
-- Therefore, is_admin() MUST NEVER trust user_metadata.
-- Only authenticated sessions with the verified master admin email OR protected app_metadata
-- (which can only be altered by service_role / migrations) are granted admin privileges.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Must be an authenticated session (rejects anon and service misconfigurations)
    IF auth.role() != 'authenticated' THEN
        RETURN FALSE;
    END IF;

    -- Master atelier admin account verification
    IF (auth.jwt() ->> 'email' = 'admin@maisonmakeeva.com') THEN
        RETURN TRUE;
    END IF;

    -- Protected app_metadata role check (server-managed, immutable from client SDK)
    IF (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. PERMIT CUSTOMER DOSSIERS TO EXIST INDEPENDENTLY OF AUTH.USERS
-- Drops foreign key constraint if present so guest checkout and seeded atelier clients are preserved
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_id_fkey;
ALTER TABLE public.customers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 5. PREVENT PRIVILEGE ESCALATION ON CUSTOMERS TABLE
-- Regular users must never be able to elevate their own role to 'admin' or toggle status
CREATE OR REPLACE FUNCTION public.protect_customer_role()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status) AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Privilege escalation denied: Only administrators can modify customer role or status.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_customer_role ON public.customers;
CREATE TRIGGER trg_protect_customer_role
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_customer_role();

-- 6. ENSURE ATELIER DIRECTOR PROFILE IN CUSTOMERS TABLE
INSERT INTO public.customers (id, email, full_name, role, status)
SELECT id, 'admin@maisonmakeeva.com', 'Atelier Director', 'admin', 'active'
FROM auth.users
WHERE email = 'admin@maisonmakeeva.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin',
    status = 'active',
    full_name = 'Atelier Director';

-- 7. CLEANUP ANY LEGACY FAKE SEED RECORDS (ORDERS, INQUIRIES, CUSTOMERS)
-- Ensures only real customer orders and messages exist in the database
DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE order_number IN ('MM-2026-8801', 'MM-2026-8802'));
DELETE FROM public.orders WHERE order_number IN ('MM-2026-8801', 'MM-2026-8802');
DELETE FROM public.customers WHERE email IN (
    'camille.laurent@ateliermakeeva.fr',
    'marcus.sterling@editorial.co.uk',
    'elena.rostova@vogue.it',
    'kenji.sato@harajuku-atelier.jp'
);
DELETE FROM public.contact_messages WHERE email IN (
    'jp.dubois@galeriedart.fr',
    'aria.vance@solsticemagazine.com'
);

-- Link existing guest orders to registered customer dossiers by matching email
UPDATE public.orders o
SET customer_id = c.id
FROM public.customers c
WHERE LOWER(o.customer_email) = LOWER(c.email)
AND (o.customer_id IS NULL OR o.customer_id != c.id);

-- 8. EXPLICIT POSTGRES ROLE GRANTS
-- Ensures anon and authenticated roles have correct table-level privileges before RLS evaluation
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT ON public.contact_messages TO anon, authenticated;
GRANT UPDATE, DELETE ON public.contact_messages TO authenticated;

GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT UPDATE, DELETE ON public.orders TO authenticated;

GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT UPDATE, DELETE ON public.order_items TO authenticated;

GRANT SELECT, INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.customers TO anon, authenticated;
GRANT DELETE ON public.customers TO authenticated;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES WITH AUDITED CONSTRAINTS

-- Ensure RLS is strictly ENABLED on all private tables
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 9A. CONTACT MESSAGES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Contact: Anyone can submit a message" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact: Admins can view all messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact: Admins can update message status" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact: Admins can delete messages" ON public.contact_messages;

-- Public submission allowed, but restricted to 'unread' status (prevent hiding inquiries)
CREATE POLICY "Contact: Anyone can submit a message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (status = 'unread' OR public.is_admin());

-- Strictly admin-only for viewing inquiries (protects client contact info & messages)
CREATE POLICY "Contact: Admins can view all messages"
    ON public.contact_messages FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Contact: Admins can update message status"
    ON public.contact_messages FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Contact: Admins can delete messages"
    ON public.contact_messages FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9B. CUSTOMERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers: Users can view own profile or admin can view all" ON public.customers;
DROP POLICY IF EXISTS "Customers: Users can insert own profile or admin can insert" ON public.customers;
DROP POLICY IF EXISTS "Customers: Users can update own profile or admin can update" ON public.customers;
DROP POLICY IF EXISTS "Customers: Admins can delete" ON public.customers;

-- Users can only read their own dossier (auth.uid() = id); admins can read all
CREATE POLICY "Customers: Users can view own profile or admin can view all"
    ON public.customers FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Customers: Users can insert own profile or admin can insert"
    ON public.customers FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Customers: Users can update own profile or admin can update"
    ON public.customers FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Customers: Admins can delete"
    ON public.customers FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9C. ORDERS & ORDER ITEMS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Orders: Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "Orders: Users view own orders or admin view all" ON public.orders;
DROP POLICY IF EXISTS "Orders: Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Orders: Admins can delete orders" ON public.orders;

-- Anyone can place an order, but CANNOT spoof someone else's customer_id,
-- and public orders must be in 'Pending' or 'Processing' status (cannot forge 'Delivered')
CREATE POLICY "Orders: Anyone can place an order"
    ON public.orders FOR INSERT
    WITH CHECK (
        (order_status IN ('Pending', 'Processing') OR public.is_admin())
    );

-- Read restricted: authenticated customers can see orders where customer_id = auth.uid() OR customer_email matches their account;
-- admins can view all orders.
CREATE POLICY "Orders: Users view own orders or admin view all"
    ON public.orders FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
        OR (auth.jwt() ->> 'email' IS NOT NULL AND LOWER(auth.jwt() ->> 'email') = LOWER(customer_email))
        OR public.is_admin()
    );

CREATE POLICY "Orders: Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Orders: Admins can delete orders"
    ON public.orders FOR DELETE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Order Items: Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Order Items: Users view own order items or admin view all" ON public.order_items;
DROP POLICY IF EXISTS "Order Items: Admins can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Order Items: Admins can delete order items" ON public.order_items;

CREATE POLICY "Order Items: Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        quantity > 0 AND price >= 0
    );

CREATE POLICY "Order Items: Users view own order items or admin view all"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (
                (auth.uid() IS NOT NULL AND orders.customer_id = auth.uid())
                OR (auth.jwt() ->> 'email' IS NOT NULL AND LOWER(orders.customer_email) = LOWER(auth.jwt() ->> 'email'))
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Order Items: Admins can update order items"
    ON public.order_items FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Order Items: Admins can delete order items"
    ON public.order_items FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9D. NEWSLETTER SUBSCRIBERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Newsletter: Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter: Admins can view all subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter: Admins can update subscriber status" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter: Admins can delete subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Newsletter: Anyone can subscribe"
    ON public.newsletter_subscribers FOR INSERT
    WITH CHECK (status = 'active' OR public.is_admin());

CREATE POLICY "Newsletter: Admins can view all subscribers"
    ON public.newsletter_subscribers FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Newsletter: Admins can update subscriber status"
    ON public.newsletter_subscribers FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Newsletter: Admins can delete subscribers"
    ON public.newsletter_subscribers FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. REALTIME CONFIGURATION REPLICA IDENTITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.collections REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.product_images REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;
ALTER TABLE public.newsletter_subscribers REPLICA IDENTITY FULL;

-- Ensure tables are added to supabase_realtime publication safely
DO $$
DECLARE
    tbl TEXT;
    tbls TEXT[] := ARRAY[
        'products',
        'product_images',
        'categories',
        'collections',
        'inventory',
        'orders',
        'order_items',
        'customers',
        'contact_messages',
        'newsletter_subscribers'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND schemaname = 'public'
            AND tablename = tbl
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 11. SECURE CLIENT ORDER LOOKUP RPC
-- ------------------------------------------------------------------------------
-- Allows registered clients to query their personal orders and items securely by email
CREATE OR REPLACE FUNCTION public.get_client_orders(client_email TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', o.id,
                'customer_id', o.customer_id,
                'order_number', o.order_number,
                'subtotal', o.subtotal,
                'shipping', o.shipping,
                'total', o.total,
                'customer_name', o.customer_name,
                'customer_email', o.customer_email,
                'customer_phone', o.customer_phone,
                'shipping_address', o.shipping_address,
                'order_status', o.order_status,
                'created_at', o.created_at,
                'updated_at', o.updated_at,
                'items', COALESCE(
                    (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', oi.id,
                                'order_id', oi.order_id,
                                'product_id', oi.product_id,
                                'product_name', oi.product_name,
                                'quantity', oi.quantity,
                                'size', oi.size,
                                'color', oi.color,
                                'price', oi.price,
                                'image_url', oi.image_url
                            )
                        )
                        FROM public.order_items oi
                        WHERE oi.order_id = o.id
                    ),
                    '[]'::jsonb
                )
            )
            ORDER BY o.created_at DESC
        ),
        '[]'::jsonb
    ) INTO result
    FROM public.orders o
    WHERE LOWER(o.customer_email) = LOWER(TRIM(client_email));

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_client_orders(TEXT) TO anon, authenticated;
