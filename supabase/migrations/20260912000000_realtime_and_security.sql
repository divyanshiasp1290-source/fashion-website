-- ==============================================================================
-- MAISON MAKEEVA - PRODUCTION REAL-TIME & ROW LEVEL SECURITY MIGRATION
-- ==============================================================================

-- 1. HELPER FUNCTION TO DETERMINE ADMINISTRATOR CLEARANCE
-- Evaluates Supabase JWT claims, metadata roles, and customers table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (auth.jwt() ->> 'email' = 'admin@maisonmakeeva.com')
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
        OR
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RE-ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES TO PREVENT DUPLICATES
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. CATEGORIES POLICIES
CREATE POLICY "Categories: Public read active or admin read all"
    ON public.categories FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Categories: Admins can insert"
    ON public.categories FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Categories: Admins can update"
    ON public.categories FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Categories: Admins can delete"
    ON public.categories FOR DELETE
    USING (public.is_admin());

-- 5. COLLECTIONS POLICIES
CREATE POLICY "Collections: Public read active or admin read all"
    ON public.collections FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Collections: Admins can insert"
    ON public.collections FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Collections: Admins can update"
    ON public.collections FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Collections: Admins can delete"
    ON public.collections FOR DELETE
    USING (public.is_admin());

-- 6. PRODUCTS POLICIES
CREATE POLICY "Products: Public read active or admin read all"
    ON public.products FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Products: Admins can insert"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Products: Admins can update"
    ON public.products FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Products: Admins can delete"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- 7. PRODUCT IMAGES POLICIES
CREATE POLICY "Product Images: Public can view images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Product Images: Admins can insert"
    ON public.product_images FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Product Images: Admins can update"
    ON public.product_images FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Product Images: Admins can delete"
    ON public.product_images FOR DELETE
    USING (public.is_admin());

-- 8. INVENTORY POLICIES
CREATE POLICY "Inventory: Public can view inventory"
    ON public.inventory FOR SELECT
    USING (true);

CREATE POLICY "Inventory: Admins can insert"
    ON public.inventory FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Inventory: Admins can update"
    ON public.inventory FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Inventory: Admins can delete"
    ON public.inventory FOR DELETE
    USING (public.is_admin());

-- 9. CUSTOMERS POLICIES
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

-- 10. ORDERS POLICIES
CREATE POLICY "Orders: Anyone can place an order"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Orders: Users view own orders or admin view all"
    ON public.orders FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
        OR public.is_admin()
    );

CREATE POLICY "Orders: Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Orders: Admins can delete orders"
    ON public.orders FOR DELETE
    USING (public.is_admin());

-- 11. ORDER ITEMS POLICIES
CREATE POLICY "Order Items: Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Order Items: Users view own order items or admin view all"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Order Items: Admins can update order items"
    ON public.order_items FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Order Items: Admins can delete order items"
    ON public.order_items FOR DELETE
    USING (public.is_admin());

-- 12. CONTACT MESSAGES POLICIES
CREATE POLICY "Contact: Anyone can submit a message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

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

-- 13. NEWSLETTER SUBSCRIBERS POLICIES
CREATE POLICY "Newsletter: Anyone can subscribe"
    ON public.newsletter_subscribers FOR INSERT
    WITH CHECK (true);

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

-- ==============================================================================
-- 14. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
-- Configure REPLICA IDENTITY FULL so UPDATE and DELETE events provide the complete record
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.product_images REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.collections REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;
ALTER TABLE public.newsletter_subscribers REPLICA IDENTITY FULL;

-- Add all tables to supabase_realtime publication safely
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
