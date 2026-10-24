import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionOrder,
  validateInventoryAvailability,
  CreateRFQSchema,
  CreatePurchaseOrderSchema,
  ANTIQUE_MUNICIPALITIES,
} from '../index.js';

test('Antiquemunicipalities list contains all 18 standard municipalities', () => {
  assert.equal(ANTIQUE_MUNICIPALITIES.length, 18);
  assert.ok(ANTIQUE_MUNICIPALITIES.includes('San Jose de Buenavista'));
  assert.ok(ANTIQUE_MUNICIPALITIES.includes('Tibiao'));
  assert.ok(ANTIQUE_MUNICIPALITIES.includes('Pandan'));
  assert.ok(ANTIQUE_MUNICIPALITIES.includes('Culasi'));
  assert.ok(ANTIQUE_MUNICIPALITIES.includes('Sibalom'));
});

test('Order State Machine enforces legitimate business transitions', () => {
  // Allowed transitions
  assert.equal(canTransitionOrder('draft', 'submitted'), true);
  assert.equal(canTransitionOrder('submitted', 'confirmed'), true);
  assert.equal(canTransitionOrder('confirmed', 'preparing'), true);
  assert.equal(canTransitionOrder('preparing', 'ready_for_dispatch'), true);
  assert.equal(canTransitionOrder('ready_for_dispatch', 'dispatched'), true);
  assert.equal(canTransitionOrder('dispatched', 'delivered'), true);
  assert.equal(canTransitionOrder('delivered', 'received'), true);

  // Illegal jumps
  assert.equal(canTransitionOrder('draft', 'delivered'), false, 'Cannot jump from draft directly to delivered');
  assert.equal(canTransitionOrder('received', 'preparing'), false, 'Cannot reopen received order');
  assert.equal(canTransitionOrder('dispatched', 'draft'), false, 'Cannot rewind dispatched to draft');
});

test('Inventory reservation logic detects shortages and made-to-order capability', () => {
  const stockInventory = { physical_stock: 100, reserved_stock: 30, is_made_to_order: false };

  // Case 1: Sufficient available stock (100 - 30 = 70 available)
  const res1 = validateInventoryAvailability(stockInventory, 50);
  assert.equal(res1.available, true);
  assert.equal(res1.current_available, 70);
  assert.equal(res1.remaining_after_reservation, 20);

  // Case 2: Insufficient stock (requests 80 when only 70 available)
  const res2 = validateInventoryAvailability(stockInventory, 80);
  assert.equal(res2.available, false);
  assert.equal(res2.shortfall, 10);

  // Case 3: Made-to-order always allows scheduling
  const madeToOrder = { physical_stock: 0, reserved_stock: 0, is_made_to_order: true };
  const res3 = validateInventoryAvailability(madeToOrder, 500);
  assert.equal(res3.available, true);
});

test('CreateRFQSchema validates well-formed RFQ structures', () => {
  const validRFQ = {
    title: '500kg Muscovado Sugar for Resort Season',
    buyer_org_id: 'org-buyer-001',
    delivery_address: 'Barangay White Beach, Station 1',
    delivery_municipality: 'Boracay (Malay)',
    delivery_province: 'Aklan',
    target_delivery_date: '2026-11-15T00:00:00Z',
    response_deadline: '2026-11-01T23:59:59Z',
    target_budget: 45000,
    items: [
      {
        item_title: 'Organic Grade-A Muscovado Sugar',
        specifications: 'Moisture < 2%, 1kg retail packaging or 25kg sacks',
        quantity: 500,
        unit: 'kg',
        target_unit_price: 90,
      },
    ],
  };

  const parsed = CreateRFQSchema.safeParse(validRFQ);
  assert.ok(parsed.success);
});
