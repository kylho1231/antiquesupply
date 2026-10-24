import { z } from 'zod';

// ==========================================
// GEOGRAPHY & REGIONAL CONSTANTS (ANTIQUE, PH)
// ==========================================
export const ANTIQUE_MUNICIPALITIES = [
  'Anini-y',
  'Barbaza',
  'Belison',
  'Bugasong',
  'Caluya',
  'Culasi',
  'Hamtic',
  'Laua-an',
  'Libertad',
  'Pandan',
  'Patnongon',
  'San Jose de Buenavista',
  'San Remigio',
  'Sebaste',
  'Sibalom',
  'Tibiao',
  'Tobias Fornier',
  'Valderrama',
];

export const TARGET_EXPANSION_AREAS = [
  'Boracay (Malay)',
  'Kalibo (Aklan)',
  'Iloilo City',
  'Roxas City (Capiz)',
  'San Jose de Buenavista (Capital Hub)',
];

export const PRODUCT_UNITS = [
  'kg',
  'piece',
  'box',
  'liter',
  'pack',
  'sack',
  'bundle',
  'meter',
];

export const PRODUCT_CATEGORIES = [
  { id: 'cat-agri', name: 'Agricultural Goods & Produce', slug: 'agriculture', icon: 'Wheat' },
  { id: 'cat-sugar', name: 'Muscovado & Sugarcane Products', slug: 'muscovado-sugar', icon: 'Flame' },
  { id: 'cat-coconut', name: 'Coconut & VCO By-Products', slug: 'coconut-vco', icon: 'Droplets' },
  { id: 'cat-weaving', name: 'Patadyong & Handwoven Textiles', slug: 'handwoven-patadyong', icon: 'Scissors' },
  { id: 'cat-crafts', name: 'Bariw Mats & Bamboo Crafts', slug: 'bariw-crafts', icon: 'Package' },
  { id: 'cat-hospitality', name: 'Hotel & Resort Amenities', slug: 'hospitality-supplies', icon: 'BedDouble' },
  { id: 'cat-food', name: 'Packaged Food & Local Delicacies', slug: 'packaged-food', icon: 'Utensils' },
  { id: 'cat-fishery', name: 'Marine & Fisheries Harvest', slug: 'marine-fisheries', icon: 'Fish' },
];

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================
export const OrganizationTypeSchema = z.enum(['buyer', 'supplier', 'both']);
export const VerificationStatusSchema = z.enum(['unverified', 'pending', 'verified', 'rejected']);

export const OrganizationSchema = z.object({
  id: z.string().uuid().or(z.string()),
  legal_name: z.string().min(2, 'Legal business name required'),
  trade_name: z.string().min(2, 'Trade name required'),
  org_type: OrganizationTypeSchema,
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}(-\d{3,5})?$/, 'Valid BIR TIN format required (e.g. 123-456-789-000)').optional().or(z.literal('')),
  registration_number: z.string().optional(),
  municipality: z.string().min(1, 'Municipality is required'),
  province: z.string().default('Antique'),
  verified_status: VerificationStatusSchema.default('unverified'),
  contact_email: z.string().email('Valid email required'),
  contact_phone: z.string().min(7, 'Valid contact number required'),
  description: z.string().max(1000).optional(),
  banner_image: z.string().url().optional().or(z.literal('')),
  logo_image: z.string().url().optional().or(z.literal('')),
  created_at: z.string().datetime().optional(),
});

// ==========================================
// PRODUCT SCHEMAS
// ==========================================
export const ProductUnitSchema = z.enum(['kg', 'piece', 'box', 'liter', 'pack', 'sack', 'bundle', 'meter']);

export const ProductSchema = z.object({
  id: z.string().uuid().or(z.string()),
  organization_id: z.string(),
  category_id: z.string(),
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3),
  sku: z.string().min(2, 'SKU required'),
  description: z.string().min(10, 'Detailed description required'),
  unit: ProductUnitSchema,
  base_price: z.number().nonnegative('Price cannot be negative'),
  is_quotation_only: z.boolean().default(false),
  min_order_quantity: z.number().int().positive('Minimum order quantity must be at least 1'),
  lead_time_days: z.number().int().nonnegative('Lead time in days'),
  packaging_details: z.string().optional(),
  origin_municipality: z.string().default('San Jose de Buenavista'),
  image_urls: z.array(z.string().refine(value => /^https:\/\//.test(value) || /^\/images\/editorial\/[a-z0-9-]+\.webp$/.test(value) || /^\/api\/v1\/media\/[a-f0-9-]+$/.test(value), 'Use an approved image path')).max(6).default([]),
  is_demo: z.boolean().default(false),
  is_active: z.boolean().default(true),
  // Inventory overview
  stock_available: z.number().int().nonnegative().default(0),
  daily_capacity: z.number().int().nonnegative().optional(),
  is_made_to_order: z.boolean().default(false),
});

// ==========================================
// RFQ (REQUEST FOR QUOTATION) SCHEMAS
// ==========================================
export const RFQStatusSchema = z.enum(['open', 'quoted', 'closed', 'cancelled']);

export const RFQItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().optional(),
  item_title: z.string().min(2, 'Item title is required'),
  specifications: z.string().min(5, 'Specifications required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: ProductUnitSchema,
  target_unit_price: z.number().nonnegative().optional(),
});

export const CreateRFQSchema = z.object({
  title: z.string().min(5, 'RFQ Title must be descriptive'),
  buyer_org_id: z.string(),
  supplier_org_id: z.string().optional(), // Specific supplier or open to marketplace
  delivery_address: z.string().min(5, 'Delivery address is required'),
  delivery_municipality: z.string().min(1, 'Delivery municipality required'),
  delivery_province: z.string().default('Antique'),
  target_delivery_date: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid target delivery date required'),
  response_deadline: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid response deadline required'),
  target_budget: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(RFQItemSchema).min(1, 'At least one item required in RFQ'),
});

// ==========================================
// SUPPLIER QUOTATION SCHEMAS
// ==========================================
export const QuotationStatusSchema = z.enum(['submitted', 'accepted', 'rejected', 'expired']);

export const QuotationItemSchema = z.object({
  rfq_item_id: z.string().optional(),
  item_title: z.string(),
  offered_quantity: z.number().positive(),
  unit: ProductUnitSchema,
  unit_price: z.number().positive('Unit price must be positive'),
  line_total: z.number().positive(),
  notes: z.string().optional(),
});

export const CreateQuotationSchema = z.object({
  rfq_id: z.string(),
  supplier_org_id: z.string(),
  items: z.array(QuotationItemSchema).min(1, 'At least one item must be quoted'),
  subtotal: z.number().nonnegative(),
  delivery_fee: z.number().nonnegative().default(0),
  tax_amount: z.number().nonnegative().default(0),
  grand_total: z.number().positive('Grand total must be positive'),
  lead_time_days: z.number().int().nonnegative(),
  valid_until: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid expiration date required'),
  commercial_terms: z.string().min(5, 'Commercial payment and fulfillment terms required'),
  notes: z.string().optional(),
});

// ==========================================
// PURCHASE ORDER SCHEMAS & STATE MACHINE
// ==========================================
export const OrderStatusSchema = z.enum([
  'draft',
  'submitted',
  'confirmed',
  'preparing',
  'ready_for_dispatch',
  'dispatched',
  'delivered',
  'received',
  'cancelled',
  'disputed',
]);

export const ORDER_STATUS_TRANSITIONS = {
  draft: ['submitted', 'cancelled'],
  submitted: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_dispatch', 'cancelled'],
  ready_for_dispatch: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'disputed'],
  delivered: ['received', 'disputed'],
  received: [], // Terminal successful state
  cancelled: [], // Terminal cancellation
  disputed: ['received', 'cancelled'], // Resolution paths
};

/**
 * Validates if an order state transition is allowed
 */
export function canTransitionOrder(currentStatus, nextStatus) {
  const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export const PurchaseOrderItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().optional(),
  item_title: z.string(),
  unit: ProductUnitSchema,
  quantity: z.number().positive(),
  agreed_unit_price: z.number().positive(),
  line_total: z.number().positive(),
  product_snapshot: z.record(z.any()).optional(),
});

export const CreatePurchaseOrderSchema = z.object({
  rfq_id: z.string().optional(),
  quotation_id: z.string().optional(),
  buyer_org_id: z.string(),
  supplier_org_id: z.string(),
  items: z.array(PurchaseOrderItemSchema).min(1, 'Order must contain at least one item'),
  subtotal: z.number().positive(),
  delivery_fee: z.number().nonnegative().default(0),
  tax_amount: z.number().nonnegative().default(0),
  grand_total: z.number().positive(),
  delivery_address: z.string().min(5),
  delivery_municipality: z.string(),
  delivery_province: z.string().default('Antique'),
  delivery_date_agreed: z.string().refine(val => !isNaN(Date.parse(val))),
  commercial_terms: z.string(),
  notes: z.string().optional(),
});

// ==========================================
// INVENTORY RESERVATION ENGINE
// ==========================================
export const InventoryMovementSchema = z.object({
  product_id: z.string(),
  movement_type: z.enum([
    'purchase_reservation',
    'order_dispatch',
    'stock_in',
    'damage_writeoff',
    'manual_adjustment',
    'cancellation_release',
  ]),
  quantity: z.number().int(),
  reference_id: z.string().optional(), // PO or adjustment ID
  notes: z.string().optional(),
});

/**
 * Validates stock availability for an incoming order
 */
export function validateInventoryAvailability(productInventory, requestedQuantity) {
  if (productInventory.is_made_to_order) {
    return {
      available: true,
      reason: 'Made-to-order item: production scheduled upon confirmation',
    };
  }

  const available = productInventory.physical_stock - productInventory.reserved_stock;
  if (available >= requestedQuantity) {
    return {
      available: true,
      current_available: available,
      remaining_after_reservation: available - requestedQuantity,
    };
  }

  return {
    available: false,
    current_available: available,
    shortfall: requestedQuantity - available,
    reason: `Insufficient inventory: ${available} units available, ${requestedQuantity} requested`,
  };
}
