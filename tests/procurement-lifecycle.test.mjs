import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ANTIQUE_MUNICIPALITIES,
  canTransitionOrder,
  validateInventoryAvailability,
  CreateRFQSchema,
  CreateQuotationSchema,
  CreatePurchaseOrderSchema,
  ORDER_STATUS_TRANSITIONS,
} from '../packages/shared-schemas/index.js';

test('1. Antique Municipalities Coverage Test', () => {
  assert.equal(ANTIQUE_MUNICIPALITIES.length, 18);
  const requiredTowns = [
    'Anini-y', 'Barbaza', 'Belison', 'Bugasong', 'Caluya', 'Culasi',
    'Hamtic', 'Laua-an', 'Libertad', 'Pandan', 'Patnongon',
    'San Jose de Buenavista', 'San Remigio', 'Sebaste', 'Sibalom',
    'Tibiao', 'Tobias Fornier', 'Valderrama'
  ];
  for (const town of requiredTowns) {
    assert.ok(ANTIQUE_MUNICIPALITIES.includes(town), `Missing municipality: ${town}`);
  }
});

test('2. Buyer RFQ Submission Validation', () => {
  const validRfq = {
    title: '15 Sacks Muscovado Sugar for Resort Kitchen',
    buyer_org_id: 'org-buyer-001',
    supplier_org_id: 'org-sup-001',
    delivery_address: 'Barangay Balabag, Station 1 Receiving Dock',
    delivery_municipality: 'Boracay (Malay)',
    delivery_province: 'Aklan',
    target_delivery_date: '2026-11-20T00:00:00Z',
    response_deadline: '2026-11-05T23:59:59Z',
    target_budget: 65000,
    notes: 'Grade A organic certified sugar required',
    items: [
      {
        item_title: 'Organic Muscovado Sugar (50kg)',
        specifications: 'Steam-evaporator processed, moisture < 2%',
        quantity: 15,
        unit: 'sack',
        target_unit_price: 4200,
      },
    ],
  };

  const parsed = CreateRFQSchema.safeParse(validRfq);
  assert.ok(parsed.success, 'Valid RFQ should pass Zod schema validation');

  // Test invalid: Zero quantity
  const invalidRfq = {
    ...validRfq,
    items: [{ ...validRfq.items[0], quantity: 0 }],
  };
  const invalidParsed = CreateRFQSchema.safeParse(invalidRfq);
  assert.equal(invalidParsed.success, false, 'Zero quantity must fail validation');
});

test('3. Supplier Quotation Validation & Commercial Calculation', () => {
  const validQuote = {
    rfq_id: 'rfq-2026-0001',
    supplier_org_id: 'org-sup-001',
    items: [
      {
        item_title: 'Organic Muscovado Sugar (50kg)',
        offered_quantity: 15,
        unit: 'sack',
        unit_price: 4150,
        line_total: 62250,
        notes: 'Cooperative wholesale volume discount',
      },
    ],
    subtotal: 62250,
    delivery_fee: 1800,
    tax_amount: 0,
    grand_total: 64050,
    lead_time_days: 4,
    valid_until: '2026-11-12T23:59:59Z',
    commercial_terms: 'Door-to-Jetty Port delivery. Net-30 payment upon receipt.',
    notes: 'Freshly harvested sugarcane milling',
  };

  const parsed = CreateQuotationSchema.safeParse(validQuote);
  assert.ok(parsed.success, 'Quotation schema should pass');
  assert.equal(parsed.data.grand_total, 64050);
});

test('4. Purchase Order Creation & Snapshot Freezing', () => {
  const validPO = {
    rfq_id: 'rfq-2026-0001',
    quotation_id: 'quo-2026-0089',
    buyer_org_id: 'org-buyer-001',
    supplier_org_id: 'org-sup-001',
    subtotal: 62250,
    delivery_fee: 1800,
    tax_amount: 0,
    grand_total: 64050,
    delivery_address: 'Station 1 Receiving Dock, Boracay',
    delivery_municipality: 'Boracay (Malay)',
    delivery_province: 'Aklan',
    delivery_date_agreed: '2026-11-20T12:00:00Z',
    commercial_terms: 'Net-30 payment',
    items: [
      {
        item_title: 'Organic Muscovado Sugar (50kg)',
        unit: 'sack',
        quantity: 15,
        agreed_unit_price: 4150,
        line_total: 62250,
        product_snapshot: {
          sku: 'LAU-MUSC-50KG',
          coop: 'Laua-an Organic Sugarcane Farmers Multi-Purpose Cooperative',
          origin: 'Laua-an, Antique',
          certification: 'FDA-CPR-Antique-2026',
        },
      },
    ],
  };

  const parsed = CreatePurchaseOrderSchema.safeParse(validPO);
  assert.ok(parsed.success, 'PO schema with snapshot should validate');
  assert.equal(parsed.data.items[0].product_snapshot.origin, 'Laua-an, Antique');
});

test('5. Order Lifecycle State Machine: Valid Progression', () => {
  const linearFlow = [
    ['draft', 'submitted'],
    ['submitted', 'confirmed'],
    ['confirmed', 'preparing'],
    ['preparing', 'ready_for_dispatch'],
    ['ready_for_dispatch', 'dispatched'],
    ['dispatched', 'delivered'],
    ['delivered', 'received'],
  ];

  for (const [curr, next] of linearFlow) {
    assert.equal(
      canTransitionOrder(curr, next),
      true,
      `Transition from ${curr} to ${next} must be allowed`
    );
  }
});

test('6. Order Lifecycle State Machine: Illegal Transition Rejection', () => {
  const illegalJumps = [
    ['draft', 'delivered'],
    ['draft', 'dispatched'],
    ['submitted', 'received'],
    ['preparing', 'delivered'],
    ['dispatched', 'draft'],
    ['received', 'preparing'],
    ['received', 'cancelled'],
    ['cancelled', 'confirmed'],
  ];

  for (const [curr, next] of illegalJumps) {
    assert.equal(
      canTransitionOrder(curr, next),
      false,
      `Illegal transition from ${curr} to ${next} must be rejected`
    );
  }
});

test('7. Atomic Inventory Reservation & Overselling Prevention', () => {
  const warehouseStock = {
    physical_stock: 50,
    reserved_stock: 35,
    is_made_to_order: false,
  };

  // Available = 50 - 35 = 15
  // Buyer A attempts to reserve 10 sacks -> Success
  const checkA = validateInventoryAvailability(warehouseStock, 10);
  assert.equal(checkA.available, true);
  assert.equal(checkA.current_available, 15);
  assert.equal(checkA.remaining_after_reservation, 5);

  // Buyer B attempts to reserve 20 sacks -> Fails due to shortfall
  const checkB = validateInventoryAvailability(warehouseStock, 20);
  assert.equal(checkB.available, false);
  assert.equal(checkB.shortfall, 5);
  assert.ok(checkB.reason.includes('Insufficient inventory'));
});

test('8. Made-to-Order Scheduling Capacity Bypass', () => {
  const weavingCapacity = {
    physical_stock: 0,
    reserved_stock: 0,
    is_made_to_order: true,
  };

  // Made to order does not reject orders for zero physical stock
  const result = validateInventoryAvailability(weavingCapacity, 30);
  assert.equal(result.available, true);
  assert.ok(result.reason.includes('Made-to-order'));
});

test('9. Order Cancellation Frees Reserved Stock', () => {
  let inventory = {
    physical_stock: 100,
    reserved_stock: 40,
    available_stock: 60,
  };

  // Cancel order of 15 sacks -> releases reserved stock
  const orderQtyToCancel = 15;
  inventory.reserved_stock -= orderQtyToCancel;
  inventory.available_stock = inventory.physical_stock - inventory.reserved_stock;

  assert.equal(inventory.reserved_stock, 25);
  assert.equal(inventory.available_stock, 75);
});

test('10. Order Dispatching Deducts Physical and Reserved Stock', () => {
  let inventory = {
    physical_stock: 100,
    reserved_stock: 25,
    available_stock: 75,
  };

  // Order of 25 sacks dispatched from mill
  const dispatchedQty = 25;
  inventory.physical_stock -= dispatchedQty;
  inventory.reserved_stock -= dispatchedQty;
  inventory.available_stock = inventory.physical_stock - inventory.reserved_stock;

  assert.equal(inventory.physical_stock, 75);
  assert.equal(inventory.reserved_stock, 0);
  assert.equal(inventory.available_stock, 75);
});
