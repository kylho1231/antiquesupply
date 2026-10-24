-- ==============================================================================
-- ANTIQUESUPPLY — MASTER POSTGRESQL DATABASE SCHEMA (SUPABASE COMPATIBLE)
-- Version: 1.0.0
-- Region: Antique, Panay, Philippines
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS & DOMAIN CONSTRAINTS
-- ==========================================
CREATE TYPE org_type_enum AS ENUM ('buyer', 'supplier', 'both');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE org_member_role_enum AS ENUM ('owner', 'admin', 'purchaser', 'sales_rep', 'viewer');
CREATE TYPE product_unit_enum AS ENUM ('kg', 'piece', 'box', 'liter', 'pack', 'sack', 'bundle', 'meter');
CREATE TYPE rfq_status_enum AS ENUM ('open', 'quoted', 'closed', 'cancelled');
CREATE TYPE quotation_status_enum AS ENUM ('submitted', 'accepted', 'rejected', 'expired');
CREATE TYPE order_status_enum AS ENUM (
  'draft',
  'submitted',
  'confirmed',
  'preparing',
  'ready_for_dispatch',
  'dispatched',
  'delivered',
  'received',
  'cancelled',
  'disputed'
);
CREATE TYPE inventory_movement_type_enum AS ENUM (
  'purchase_reservation',
  'order_dispatch',
  'stock_in',
  'damage_writeoff',
  'manual_adjustment',
  'cancellation_release'
);

-- ==========================================
-- 2. IDENTITY & ORGANIZATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  org_type org_type_enum NOT NULL DEFAULT 'buyer',
  tin TEXT,
  registration_number TEXT,
  municipality TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Antique',
  verified_status verification_status_enum NOT NULL DEFAULT 'unverified',
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  description TEXT,
  banner_image TEXT,
  logo_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role org_member_role_enum NOT NULL DEFAULT 'purchaser',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES user_profiles(id),
  status verification_status_enum NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- 'bir_2303', 'dti_sec', 'mayors_permit', 'cda_cooperative'
  document_url TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g. 'Warehouse 1', 'Main Store', 'Farm Gate'
  street TEXT NOT NULL,
  barangay TEXT NOT NULL,
  municipality TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Antique',
  postal_code TEXT DEFAULT '5700',
  is_default_shipping BOOLEAN DEFAULT FALSE,
  is_default_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. PRODUCT CATALOG & INVENTORY
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT NOT NULL,
  unit product_unit_enum NOT NULL DEFAULT 'piece',
  base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  is_quotation_only BOOLEAN DEFAULT FALSE,
  min_order_quantity INT NOT NULL DEFAULT 1 CHECK (min_order_quantity > 0),
  lead_time_days INT NOT NULL DEFAULT 3 CHECK (lead_time_days >= 0),
  packaging_details TEXT,
  origin_municipality TEXT NOT NULL DEFAULT 'San Jose de Buenavista',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, sku)
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  physical_stock INT NOT NULL DEFAULT 0 CHECK (physical_stock >= 0),
  reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  available_stock INT GENERATED ALWAYS AS (physical_stock - reserved_stock) STORED CHECK (available_stock >= 0),
  low_stock_threshold INT DEFAULT 10,
  is_made_to_order BOOLEAN DEFAULT FALSE,
  daily_production_capacity INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type inventory_movement_type_enum NOT NULL,
  quantity INT NOT NULL,
  reference_id TEXT, -- PO ID or Adjustment ID
  recorded_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. PROCUREMENT: RFQ & QUOTATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS requests_for_quotation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_number TEXT UNIQUE NOT NULL,
  buyer_org_id UUID NOT NULL REFERENCES organizations(id),
  supplier_org_id UUID REFERENCES organizations(id), -- NULL = open to marketplace
  title TEXT NOT NULL,
  status rfq_status_enum NOT NULL DEFAULT 'open',
  target_delivery_date TIMESTAMPTZ NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_municipality TEXT NOT NULL,
  delivery_province TEXT NOT NULL DEFAULT 'Antique',
  target_budget NUMERIC(14, 2) CHECK (target_budget > 0),
  response_deadline TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES requests_for_quotation(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  item_title TEXT NOT NULL,
  specifications TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit product_unit_enum NOT NULL DEFAULT 'kg',
  target_unit_price NUMERIC(12, 2) CHECK (target_unit_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_number TEXT UNIQUE NOT NULL,
  rfq_id UUID NOT NULL REFERENCES requests_for_quotation(id) ON DELETE CASCADE,
  supplier_org_id UUID NOT NULL REFERENCES organizations(id),
  status quotation_status_enum NOT NULL DEFAULT 'submitted',
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  grand_total NUMERIC(14, 2) NOT NULL CHECK (grand_total > 0),
  lead_time_days INT NOT NULL DEFAULT 3,
  valid_until TIMESTAMPTZ NOT NULL,
  commercial_terms TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID NOT NULL REFERENCES supplier_quotations(id) ON DELETE CASCADE,
  rfq_item_id UUID REFERENCES rfq_items(id),
  item_title TEXT NOT NULL,
  offered_quantity NUMERIC(12, 2) NOT NULL CHECK (offered_quantity > 0),
  unit product_unit_enum NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
  line_total NUMERIC(14, 2) NOT NULL CHECK (line_total > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. PURCHASE ORDERS & FULFILLMENT LIFECYCLE
-- ==========================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  rfq_id UUID REFERENCES requests_for_quotation(id),
  quotation_id UUID REFERENCES supplier_quotations(id),
  buyer_org_id UUID NOT NULL REFERENCES organizations(id),
  supplier_org_id UUID NOT NULL REFERENCES organizations(id),
  status order_status_enum NOT NULL DEFAULT 'draft',
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal > 0),
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  grand_total NUMERIC(14, 2) NOT NULL CHECK (grand_total > 0),
  delivery_address TEXT NOT NULL,
  delivery_municipality TEXT NOT NULL,
  delivery_province TEXT NOT NULL DEFAULT 'Antique',
  delivery_date_agreed TIMESTAMPTZ NOT NULL,
  tracking_reference TEXT,
  commercial_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  item_title TEXT NOT NULL,
  unit product_unit_enum NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  agreed_unit_price NUMERIC(12, 2) NOT NULL CHECK (agreed_unit_price > 0),
  line_total NUMERIC(14, 2) NOT NULL CHECK (line_total > 0),
  product_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  previous_status order_status_enum,
  new_status order_status_enum NOT NULL,
  changed_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  carrier_name TEXT,
  carrier_phone TEXT,
  tracking_number TEXT,
  dispatched_at TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  received_by TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. ENGAGEMENT, NOTIFICATIONS & AUDITS
-- ==========================================
CREATE TABLE IF NOT EXISTS favorite_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_org_id, supplier_org_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  raised_by_org_id UUID NOT NULL REFERENCES organizations(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'opened',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  organization_id UUID REFERENCES organizations(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_municipality ON products(origin_municipality);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON requests_for_quotation(buyer_org_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON requests_for_quotation(status);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON supplier_quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_supplier ON supplier_quotations(supplier_org_id);
CREATE INDEX IF NOT EXISTS idx_pos_buyer ON purchase_orders(buyer_org_id);
CREATE INDEX IF NOT EXISTS idx_pos_supplier ON purchase_orders(supplier_org_id);
CREATE INDEX IF NOT EXISTS idx_pos_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ==========================================
-- 8. ATOMIC INVENTORY & STATE TRANSITION FUNCTIONS
-- ==========================================

-- Atomic stock reservation function (prevents overselling via ROW-LEVEL EXCLUSIVE LOCK)
CREATE OR REPLACE FUNCTION reserve_inventory_atomic(
  p_product_id UUID,
  p_quantity INT,
  p_reference_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_phys INT;
  v_res INT;
  v_is_mto BOOLEAN;
BEGIN
  -- Row-level exclusive lock on the inventory row
  SELECT physical_stock, reserved_stock, is_made_to_order
  INTO v_phys, v_res, v_is_mto
  FROM product_inventory
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory record for product % not found', p_product_id;
  END IF;

  -- Made-to-order products do not block on physical stock
  IF v_is_mto THEN
    INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_id, notes)
    VALUES (p_product_id, 'purchase_reservation', p_quantity, p_reference_id, 'Scheduled production for MTO order');
    RETURN TRUE;
  END IF;

  -- Check available stock (physical - reserved)
  IF (v_phys - v_res) < p_quantity THEN
    RETURN FALSE; -- Cannot reserve due to insufficient stock
  END IF;

  -- Reserve the stock atomically
  UPDATE product_inventory
  SET reserved_stock = reserved_stock + p_quantity,
      updated_at = NOW()
  WHERE product_id = p_product_id;

  -- Record movement log
  INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_id, notes)
  VALUES (p_product_id, 'purchase_reservation', p_quantity, p_reference_id, 'Order reservation locked');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Order state transition validation function
CREATE OR REPLACE FUNCTION transition_order_status(
  p_po_id UUID,
  p_next_status order_status_enum,
  p_changed_by UUID,
  p_notes TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_curr_status order_status_enum;
  v_valid BOOLEAN := FALSE;
BEGIN
  SELECT status INTO v_curr_status FROM purchase_orders WHERE id = p_po_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase order % not found', p_po_id;
  END IF;

  -- Validate state machine rules
  IF (v_curr_status = 'draft' AND p_next_status IN ('submitted', 'cancelled')) OR
     (v_curr_status = 'submitted' AND p_next_status IN ('confirmed', 'cancelled')) OR
     (v_curr_status = 'confirmed' AND p_next_status IN ('preparing', 'cancelled')) OR
     (v_curr_status = 'preparing' AND p_next_status IN ('ready_for_dispatch', 'cancelled')) OR
     (v_curr_status = 'ready_for_dispatch' AND p_next_status IN ('dispatched', 'cancelled')) OR
     (v_curr_status = 'dispatched' AND p_next_status IN ('delivered', 'disputed')) OR
     (v_curr_status = 'delivered' AND p_next_status IN ('received', 'disputed')) OR
     (v_curr_status = 'disputed' AND p_next_status IN ('received', 'cancelled')) THEN
    v_valid := TRUE;
  END IF;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'Invalid order state transition from % to %', v_curr_status, p_next_status;
  END IF;

  -- Update order
  UPDATE purchase_orders
  SET status = p_next_status, updated_at = NOW()
  WHERE id = p_po_id;

  -- Log history
  INSERT INTO order_status_history (po_id, previous_status, new_status, changed_by, notes)
  VALUES (p_po_id, v_curr_status, p_next_status, p_changed_by, p_notes);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
