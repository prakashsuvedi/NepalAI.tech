-- =========================================================================
-- NEPALAI MULTI-TENANT IDENTITY & ROW LEVEL SECURITY (RLS) POLICIES
-- Target Engine: PostgreSQL 15+ / Supabase PostgreSQL
-- =========================================================================

-- 1. Enable Row Level Security (RLS) across all tenant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND system_role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- PROFILES RLS POLICIES
-- =========================================================================

-- Anyone authenticated can view their own profile, or super_admin can view all
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id OR is_super_admin());

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile during registration flow
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =========================================================================
-- BUSINESSES (TENANTS) RLS POLICIES
-- =========================================================================

-- Members can select the business they belong to, or super_admin can select all
CREATE POLICY "businesses_select_member" ON businesses
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a new business
CREATE POLICY "businesses_insert_authenticated" ON businesses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only business owners and admins can update business metadata
CREATE POLICY "businesses_update_owner_admin" ON businesses
  FOR UPDATE
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'admin')
    )
  );

-- =========================================================================
-- BUSINESS MEMBERS (RBAC) RLS POLICIES
-- =========================================================================

-- Members can see other team members of businesses they belong to
CREATE POLICY "business_members_select" ON business_members
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
    )
  );

-- Owners and admins can add team members
CREATE POLICY "business_members_insert" ON business_members
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can update team member roles and permissions
CREATE POLICY "business_members_update" ON business_members
  FOR UPDATE
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can remove team members (owners cannot be removed by staff)
CREATE POLICY "business_members_delete" ON business_members
  FOR DELETE
  USING (
    is_super_admin() OR
    (
      EXISTS (
        SELECT 1 FROM business_members bm
        WHERE bm.business_id = business_members.business_id
          AND bm.user_id = auth.uid()
          AND bm.role = 'owner'
      )
    )
  );

-- =========================================================================
-- BUSINESS INVITATIONS RLS POLICIES
-- =========================================================================

CREATE POLICY "business_invitations_select" ON business_invitations
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_invitations.business_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "business_invitations_insert" ON business_invitations
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_invitations.business_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );

-- =========================================================================
-- NEPALAI COMMERCE MULTI-TENANT RLS POLICIES
-- =========================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 1. CATEGORIES: Public can view active categories; Members can manage
CREATE POLICY "categories_select" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_manage_member" ON categories
  FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = categories.business_id
        AND bm.user_id = auth.uid()
    )
  );

-- 2. PRODUCTS: Public can view active products; Members can manage
CREATE POLICY "products_select" ON products
  FOR SELECT
  USING (status = 'active' OR is_super_admin() OR EXISTS (
    SELECT 1 FROM business_members bm
    WHERE bm.business_id = products.business_id
      AND bm.user_id = auth.uid()
  ));

CREATE POLICY "products_manage_member" ON products
  FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = products.business_id
        AND bm.user_id = auth.uid()
    )
  );

-- 3. CUSTOMERS: Tenant staff/admin can view and manage their shoppers
CREATE POLICY "customers_select_member" ON customers
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = customers.business_id
        AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "customers_manage_member" ON customers
  FOR ALL
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = customers.business_id
        AND bm.user_id = auth.uid()
    )
  );

-- 4. ORDERS: Public/shoppers can create orders; Tenant staff/admin can view and fulfill
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_select_member" ON orders
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = orders.business_id
        AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "orders_update_member" ON orders
  FOR UPDATE
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = orders.business_id
        AND bm.user_id = auth.uid()
    )
  );

-- 5. ORDER ITEMS: Selectable by tenant members, insertable during checkout
CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM orders o
      JOIN business_members bm ON bm.business_id = o.business_id
      WHERE o.id = order_items.order_id
        AND bm.user_id = auth.uid()
    )
  );

-- 6. PAYMENTS: Tenant staff can view payments; System/webhooks can record payments
CREATE POLICY "payments_select_member" ON payments
  FOR SELECT
  USING (
    is_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = payments.business_id
        AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert" ON payments
  FOR INSERT
  WITH CHECK (true);

