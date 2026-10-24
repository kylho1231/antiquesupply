# AntiqueSupply — Local Products. Bigger Markets.

**AntiqueSupply** is a full-stack B2B marketplace, procurement management, and supplier operations platform engineered specifically for local cooperatives, smallholder agricultural producers, and artisanal manufacturers across Antique Province, Philippines, and commercial buyers across Panay Island and Boracay.

---

## Highlights & Features

- **Buyer Procurement Portal**: Discover authentic producers across all 18 Antique municipalities (Laua-an, Bugasong, Tibiao, Pandan, Patnongon, San Jose de Buenavista, etc.), generate multi-item RFQs, compare bids side-by-side, issue purchase orders, and track deliveries.
- **Supplier Hub & Cooperative Workspace**: Catalog listings, pricing & MOQ control, stock management, RFQ response builder, and order fulfillment pipeline (Submitted → Confirmed → Preparing → Ready → Dispatched → Delivered).
- **GetLayers-Inspired Cinematic UI**: Built with a reactive canvas shader background, dark slate and emerald forest accents, amber micro-accents, and accessible contrast design tokens.
- **Atomic Inventory Locking**: Eliminates overselling via row-level locks and strict reservation rules. Supports made-to-order capacity scheduling.
- **Native Android Application**: Kotlin, Jetpack Compose, Material 3, Room offline draft caching (`draft_rfqs`), and Retrofit API client.
- **PostgreSQL / Supabase Ready**: Normalized schema, Row Level Security (RLS) tenant isolation, triggers, audit logging, and realistic seed data.

---

## Quick Start

### 1. Web Portal
```bash
# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 2. Run Tests
```bash
npm test
```
Executes all 10 mandatory acceptance test scenarios verifying state machine rules, inventory locks, and RFQ validation.

### 3. Android Studio
Open the `apps/android` directory in Android Studio (Gradle Kotlin DSL, Jetpack Compose, Room).

---

## Documentation

- [Architecture & Domain Model](docs/ARCHITECTURE.md)
- [API v1 Specification](docs/API_SPECIFICATION.md)
- [Developer Setup Guide](docs/DEVELOPER_SETUP.md)
- [PostgreSQL Schema DDL](supabase/migrations/20261024000001_initial_schema.sql)
- [Antique Province Seed Data](supabase/migrations/20261024000002_seed_antique_data.sql)

---

## License & Compliance
Compliant with Philippine Data Privacy Act of 2012 (RA 10173).  
All rights reserved © 2026 AntiqueSupply Team.
