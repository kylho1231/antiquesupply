-- ==============================================================================
-- ANTIQUESUPPLY — COMPREHENSIVE SEED DATA FOR ANTIQUE PROVINCE & PANAY ISLAND
-- Real-world inspired cooperatives, artisanal guilds, resort buyers & commercial items
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description, icon_name, display_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Muscovado & Sugarcane Products', 'muscovado-sugar', 'Pure artisanal organic muscovado sugar, panutsa, and sugarcane syrup from the traditional mills of Antique.', 'Flame', 1),
('c1000000-0000-0000-0000-000000000002', 'Handwoven Textiles & Patadyong', 'handwoven-patadyong', 'Authentic cotton and hablon handwoven patadyong, scarves, and table runners from Bugasong weavers.', 'Scissors', 2),
('c1000000-0000-0000-0000-000000000003', 'Coconut & VCO By-Products', 'coconut-vco', 'Cold-pressed virgin coconut oil, coco peat, copra, and coconut coir hospitality supplies.', 'Droplets', 3),
('c1000000-0000-0000-0000-000000000004', 'Bariw Mats & Eco-Crafts', 'bariw-crafts', 'Handwoven bariw beach bags, storage hampers, and natural fiber mats woven in Pandan and Libertad.', 'Package', 4),
('c1000000-0000-0000-0000-000000000005', 'Highland Coffee & Agricultural Produce', 'agriculture', 'Shade-grown Robusta coffee beans, mountain cacao, upland rice, and ginger from San Remigio & Valderrama.', 'Wheat', 5),
('c1000000-0000-0000-0000-000000000006', 'Marine Harvest & Artisanal Sea Salt', 'marine-fisheries', 'Sustainably harvested sea salt from Patnongon, dried fish, and coastal seafood supplies.', 'Fish', 6),
('c1000000-0000-0000-0000-000000000007', 'Hotel & Resort Amenities', 'hospitality-supplies', 'Sustainable bamboo bath amenities, eco-packaging, and room accessories crafted for island resorts.', 'BedDouble', 7),
('c1000000-0000-0000-0000-000000000008', 'Packaged Delicacies & Preserves', 'packaged-food', 'Native calamondin preserves, bandi (peanut brittle in muscovado), and traditional culinary staples.', 'Utensils', 8)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED ORGANIZATIONS (SUPPLIERS & BUYERS)
-- Supplier 1: Laua-an Muscovado Producers Cooperative (Laua-an, Antique)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o1000000-0000-0000-0000-000000000001', 'Laua-an Organic Sugarcane Farmers Multi-Purpose Cooperative', 'Laua-an Muscovado Producers Coop', 'supplier', '102-394-821-000', 'CDA-REG-09412', 'Laua-an', 'Antique', 'verified', 'sales@lauaanmuscovado.ph', '+63 917 555 0101', 'Federation of 120 smallholder sugarcane growers operating traditional and steam-evaporator mills producing premium export-grade organic Muscovado sugar and molasses in Laua-an, Antique.')
ON CONFLICT (id) DO NOTHING;

-- Supplier 2: Bagtason Loom Weavers Association (Bugasong, Antique)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o1000000-0000-0000-0000-000000000002', 'Bagtason Loom Weavers Association Inc.', 'Bagtason Heritage Loom Weavers', 'supplier', '211-893-410-000', 'SEC-CN201409821', 'Bugasong', 'Antique', 'verified', 'orders@bagtasonweavers.org', '+63 920 555 0202', 'Preserving centuries-old Panay weaving traditions. We hand-weave vibrant Hablon and Patadyong textiles, hotel decorative runner sets, conference bags, and artisanal uniforms.')
ON CONFLICT (id) DO NOTHING;

-- Supplier 3: Tibiao Eco-Farm & Coconut Cooperative (Tibiao, Antique)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o1000000-0000-0000-0000-000000000003', 'Tibiao River Basin Agro-Industrial Cooperative', 'Tibiao Pure VCO & Agro Products', 'supplier', '334-112-909-000', 'CDA-REG-10492', 'Tibiao', 'Antique', 'verified', 'supply@tibiaovco.com', '+63 918 555 0303', 'Producers of cold-pressed, centrifugal organic Virgin Coconut Oil, natural coconut coir garden liners, and bulk hotel spa oils nestled along the crystal-clear Tibiao River.')
ON CONFLICT (id) DO NOTHING;

-- Supplier 4: Pandan Bariw Crafts Federation (Pandan, Antique)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o1000000-0000-0000-0000-000000000004', 'Pandan Native Fiber Artisans Cooperative', 'Pandan Bariw Crafts Federation', 'supplier', '441-209-771-000', 'DOLE-WA-8832', 'Pandan', 'Antique', 'verified', 'artisan@pandanbariw.ph', '+63 929 555 0404', 'Specializing in sustainable bariw leaf weaving: eco-totes for island resorts, conference folios, placemats, and custom hospitality beach bags.')
ON CONFLICT (id) DO NOTHING;

-- Buyer 1: Boracay Palms Beach Resort & Luxury Villas (Boracay Island, Aklan)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o2000000-0000-0000-0000-000000000001', 'Boracay Sands & Palms Resort Hospitality Corp.', 'Boracay Palms Beach Resort', 'buyer', '008-721-394-000', 'SEC-CS20120011', 'Boracay (Malay)', 'Aklan', 'verified', 'procurement@boracaypalms.com', '+63 917 888 1111', 'A 180-room beachfront luxury eco-resort on Station 1 Boracay sourcing sustainable, zero-waste local Panay goods, coffee, and room amenities.')
ON CONFLICT (id) DO NOTHING;

-- Buyer 2: Panay Heritage Bistro & Cafe Group (San Jose de Buenavista, Antique)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o2000000-0000-0000-0000-000000000002', 'San Jose Heritage Dining Concepts Inc.', 'Panay Heritage Bistro & Cafe', 'buyer', '552-901-224-000', 'DTI-BNC-44029', 'San Jose de Buenavista', 'Antique', 'verified', 'kitchen@panaybistro.ph', '+63 922 888 2222', 'Specialty farm-to-table restaurant chain serving authentic Antiqueño recipes with branches in San Jose and Iloilo City.')
ON CONFLICT (id) DO NOTHING;

-- Buyer 3: Panay Merchant Wholesale & Supermarket (Kalibo, Aklan)
INSERT INTO organizations (id, legal_name, trade_name, org_type, tin, registration_number, municipality, province, verified_status, contact_email, contact_phone, description) VALUES
('o2000000-0000-0000-0000-000000000003', 'Western Visayas Integrated Supermarts Inc.', 'Panay Merchant Wholesale & Grocers', 'buyer', '661-830-101-000', 'SEC-CS20091012', 'Kalibo (Aklan)', 'Aklan', 'verified', 'purchasing@panaymerchant.com', '+63 919 888 3333', 'Major regional wholesale distributor supplying food service, retail groceries, and institution cafeterias across Panay Island.')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PRODUCTS
-- Product 1: Laua-an Organic Muscovado Sugar (50kg Bulk Sack)
INSERT INTO products (id, organization_id, category_id, name, slug, sku, description, unit, base_price, is_quotation_only, min_order_quantity, lead_time_days, packaging_details, origin_municipality, is_active) VALUES
('p1000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Antique Premium Organic Muscovado Sugar (50kg Commercial Sack)', 'antique-muscovado-sugar-50kg', 'LAU-MUSC-50KG', 'Export-quality unrefined whole cane sugar with deep caramel notes and high molasses retention. FDA CPR certified, chemical-free.', 'sack', 4250.00, false, 2, 3, 'Heavy-duty food grade moisture barrier woven polypropylene sack (50kg)', 'Laua-an', true)
ON CONFLICT (id) DO NOTHING;

-- Product 2: Laua-an Organic Muscovado Sugar (1kg Retail Pack - Case of 24)
INSERT INTO products (id, organization_id, category_id, name, slug, sku, description, unit, base_price, is_quotation_only, min_order_quantity, lead_time_days, packaging_details, origin_municipality, is_active) VALUES
('p1000000-0000-0000-0000-000000000002', 'o1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Organic Muscovado 1kg Pouches (Master Case of 24)', 'organic-muscovado-1kg-case', 'LAU-MUSC-1KGX24', 'Retail-ready standup ziplock kraft pouches with window and barcode. Ideal for supermarket shelves and hotel gift boutiques.', 'box', 2280.00, false, 5, 4, 'Master corrugated carton containing 24x 1kg sealed pouches', 'Laua-an', true)
ON CONFLICT (id) DO NOTHING;

-- Product 3: Bagtason Handwoven Patadyong Hospitality Bed Runner
INSERT INTO products (id, organization_id, category_id, name, slug, sku, description, unit, base_price, is_quotation_only, min_order_quantity, lead_time_days, packaging_details, origin_municipality, is_active) VALUES
('p1000000-0000-0000-0000-000000000003', 'o1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Bagtason Heritage Handwoven Bed Runner (Queen/King)', 'bagtason-handwoven-bed-runner', 'BAG-RUNNER-QK', 'Traditional multi-color checkered Hablon patadyong runner designed for luxury resort bedrooms. Durable poly-cotton blend, colorfast.', 'piece', 1150.00, false, 10, 14, 'Individually wrapped in recycled biodegradable craft paper with weaver story tag', 'Bugasong', true)
ON CONFLICT (id) DO NOTHING;

-- Product 4: Bagtason Handwoven Conference / Dining Placemat Set (Set of 6)
INSERT INTO products (id, organization_id, category_id, name, slug, sku, description, unit, base_price, is_quotation_only, min_order_quantity, lead_time_days, packaging_details, origin_municipality, is_active) VALUES
('p1000000-0000-0000-0000-000000000004', 'o1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Bagtason Geometric Hablon Dining Placemat Set (6-Pack)', 'bagtason-hablon-placemats-6pk', 'BAG-PLACE-6PK', 'Artisan woven table placemats featuring traditional geometric Antique patterns. Machine washable and stain-resistant treatment.', 'pack', 1450.00, false, 5, 7, 'Set of 6 tied with natural abaca twine with authenticity stamp', 'Bugasong', true)
ON CONFLICT (id) DO NOTHING;

-- Product 5: Tibiao Centrifugal Cold-Pressed Virgin Coconut Oil (20L Jerrycan)
INSERT INTO products (id, organization_id, category_id, name, slug, sku, description, unit, base_price, is_quotation_only, min_order_quantity, lead_time_days, packaging_details, origin_municipality, is_active) VALUES
('p1000000-0000-0000-0000-000000000005', 'o1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'Pure Centrifugal Virgin Coconut Oil (20-Liter Commercial Food/Spa Drum)', 'tibiao-centrifugal-vco-20l', 'TIB-VCO-20L', 'Crystal clear, water-white VCO produced without chemical heat. Ideal for commercial bakery, culinary dressing, or spa massage oil base.', 'box', 4600.00, false, 2, 5, 'Heavy-gauge food-grade HDPE 20L carboy with tamper-evident seal', 'Tibiao', true)
ON CONFLICT (id) DO NOTHING;

-- Product 6: Pandan Handwoven Bariw Resort Beach Bag (Bulk 20-Pack)
INSERT INTO products (id, organization_id, category_id, name, slug, sku, description, unit, base_price, is_quotation_only, min_order_quantity, lead_time_days, packaging_details, origin_municipality, is_active) VALUES
('p1000000-0000-0000-0000-000000000006', 'o1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'Pandan Natural Bariw Woven Resort Beach Tote (Bundle of 20)', 'pandan-bariw-tote-20pk', 'PAN-BARIW-TOTE20', 'Eco-friendly, sun-bleached dried bariw palm fiber tote bag with sturdy woven handles. High demand in Boracay resorts as guest room welcome bags.', 'pack', 5200.00, false, 2, 10, 'Pack of 20 flat-packed in breathable cartons', 'Pandan', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED INVENTORY FOR PRODUCTS
INSERT INTO product_inventory (product_id, physical_stock, reserved_stock, low_stock_threshold, is_made_to_order, daily_production_capacity) VALUES
('p1000000-0000-0000-0000-000000000001', 85, 10, 15, false, 20),
('p1000000-0000-0000-0000-000000000002', 120, 20, 25, false, 30),
('p1000000-0000-0000-0000-000000000003', 15, 0, 5, true, 8),
('p1000000-0000-0000-0000-000000000004', 35, 5, 10, false, 12),
('p1000000-0000-0000-0000-000000000005', 40, 4, 8, false, 10),
('p1000000-0000-0000-0000-000000000006', 25, 0, 6, true, 5)
ON CONFLICT (product_id) DO NOTHING;

-- 5. SEED RFQ (Boracay Palms requesting 10 Sacks Muscovado Sugar)
INSERT INTO requests_for_quotation (id, rfq_number, buyer_org_id, supplier_org_id, title, status, target_delivery_date, delivery_address, delivery_municipality, delivery_province, target_budget, response_deadline, notes) VALUES
('r1000000-0000-0000-0000-000000000001', 'RFQ-2026-0001', 'o2000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'Procurement of 10x 50kg Organic Muscovado Sugar for High-Season Pastry Kitchen', 'quoted', NOW() + INTERVAL '14 days', 'Caticlan Jetty Port Cargo Receiving, Malay', 'Boracay (Malay)', 'Aklan', 45000.00, NOW() + INTERVAL '3 days', 'Must include moisture barrier bags and sanitary certificate for resort compliance.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rfq_items (id, rfq_id, product_id, item_title, specifications, quantity, unit, target_unit_price) VALUES
('i1000000-0000-0000-0000-000000000001', 'r1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Antique Premium Organic Muscovado Sugar (50kg)', 'Grade A Organic, moisture content < 2%, 2026 fresh milling', 10, 'sack', 4200.00)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED SUPPLIER QUOTATION
INSERT INTO supplier_quotations (id, quotation_number, rfq_id, supplier_org_id, status, subtotal, delivery_fee, tax_amount, grand_total, lead_time_days, valid_until, commercial_terms, notes) VALUES
('q1000000-0000-0000-0000-000000000001', 'QUO-2026-0089', 'r1000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'accepted', 42000.00, 1500.00, 0.00, 43500.00, 4, NOW() + INTERVAL '7 days', 'Door-to-Jetty Port Caticlan Delivery. Net 30 days upon inspection.', 'Guaranteed fresh milling from this weeks batch with moisture-safe inner lining.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO quotation_items (id, quotation_id, rfq_item_id, item_title, offered_quantity, unit, unit_price, line_total, notes) VALUES
('qi000000-0000-0000-0000-000000000001', 'q1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 'Antique Premium Organic Muscovado Sugar (50kg)', 10, 'sack', 4200.00, 42000.00, 'Discounted commercial volume pricing')
ON CONFLICT (id) DO NOTHING;

-- 7. SEED CONFIRMED PURCHASE ORDER (Converted from accepted quotation)
INSERT INTO purchase_orders (id, po_number, rfq_id, quotation_id, buyer_org_id, supplier_org_id, status, subtotal, delivery_fee, tax_amount, grand_total, delivery_address, delivery_municipality, delivery_province, delivery_date_agreed, tracking_reference, commercial_terms, notes) VALUES
('po000000-0000-0000-0000-000000000001', 'PO-2026-0042', 'r1000000-0000-0000-0000-000000000001', 'q1000000-0000-0000-0000-000000000001', 'o2000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'confirmed', 42000.00, 1500.00, 0.00, 43500.00, 'Caticlan Jetty Port Cargo Receiving, Malay', 'Boracay (Malay)', 'Aklan', NOW() + INTERVAL '10 days', 'PANAY-LOG-2026-991', 'Net 30 days upon receipt and quality inspection', 'Order confirmed by cooperative manager. 10 sacks allocated from mill storage.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, po_id, product_id, item_title, unit, quantity, agreed_unit_price, line_total, product_snapshot) VALUES
('poi00000-0000-0000-0000-000000000001', 'po000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'Antique Premium Organic Muscovado Sugar (50kg)', 'sack', 10, 4200.00, 42000.00, '{"sku": "LAU-MUSC-50KG", "producer": "Laua-an Organic Sugarcane Farmers Multi-Purpose Cooperative", "origin": "Laua-an, Antique", "organic_cert": "FDA-CPR-Antique-2026"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_status_history (po_id, previous_status, new_status, notes) VALUES
('po000000-0000-0000-0000-000000000001', 'draft', 'submitted', 'Purchase Order generated from accepted Quotation QUO-2026-0089'),
('po000000-0000-0000-0000-000000000001', 'submitted', 'confirmed', 'Supplier confirmed order receipt and scheduled dispatch truck.');
