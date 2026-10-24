# AntiqueSupply — API Specification (v1)

Base URL: `/api/v1`

---

## 1. Products API

### `GET /api/v1/products`
Retrieves products filtered by category, Antique municipality, or keyword search query.

**Query Parameters:**
- `category` (optional, string): e.g. `cat-sugar`, `cat-weaving`
- `municipality` (optional, string): e.g. `Laua-an`, `Tibiao`, `Bugasong`
- `q` (optional, string): Search keyword

**Response (200 OK):**
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "id": "prod-001",
      "organization_id": "org-sup-001",
      "category_id": "cat-sugar",
      "name": "Antique Premium Organic Muscovado Sugar (50kg Commercial Sack)",
      "sku": "LAU-MUSC-50KG",
      "unit": "sack",
      "base_price": 4250,
      "min_order_quantity": 2,
      "lead_time_days": 3,
      "origin_municipality": "Laua-an",
      "stock_available": 75,
      "is_made_to_order": false
    }
  ]
}
```

### `POST /api/v1/products`
Creates and lists a new wholesale product under the authenticated supplier organization.

---

## 2. RFQ & Quotation API

### `GET /api/v1/rfqs`
Lists RFQs with optional status filter (`open`, `quoted`, `closed`).

### `POST /api/v1/rfqs`
Publishes a new RFQ containing one or more line items.

**Request Payload:**
```json
{
  "title": "500kg Muscovado Sugar for Resort Kitchen",
  "buyer_org_id": "org-buy-001",
  "delivery_address": "Station 1 Receiving Area",
  "delivery_municipality": "Boracay (Malay)",
  "delivery_province": "Aklan",
  "target_delivery_date": "2026-11-20T00:00:00Z",
  "response_deadline": "2026-11-05T23:59:59Z",
  "target_budget": 45000,
  "items": [
    {
      "item_title": "Organic Muscovado Sugar (50kg)",
      "specifications": "Steam-evaporator processed, moisture < 2%",
      "quantity": 10,
      "unit": "sack",
      "target_unit_price": 4200
    }
  ]
}
```

### `POST /api/v1/quotations`
Suppliers submit a binding commercial bid with unit pricing, lead time, and valid-until expiration.

---

## 3. Purchase Orders & Fulfillment API

### `GET /api/v1/orders`
Retrieves commercial purchase orders for the active organization.

### `POST /api/v1/orders`
Converts an accepted quotation into an active Purchase Order. Validates inventory availability and locks stock atomically.

### `POST /api/v1/orders/{id}/transition`
Advances the order state machine.

**Request Payload:**
```json
{
  "nextStatus": "dispatched",
  "notes": "Dispatched via Panay Express Freight (Driver: Juan Perez)",
  "trackingReference": "PANAY-LOG-2026-991"
}
```

**State Transition Safety Rules:**
Transitions are rejected with HTTP 422 if an illegal jump is attempted (e.g., `draft` -> `delivered`).

---

## 4. Inventory API

### `GET /api/v1/inventory?product_id={id}`
Returns current physical, reserved, and available stock levels.

### `POST /api/v1/inventory`
Logs an inventory movement (`stock_in`, `damage_writeoff`, `manual_adjustment`).
