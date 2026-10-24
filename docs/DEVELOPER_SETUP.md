# AntiqueSupply — Developer & Operator Setup Guide

This guide details how to launch, test, and deploy the AntiqueSupply B2B platform across Web, Android Studio, and PostgreSQL.

---

## 1. Prerequisites

- **Node.js**: v20.x or v24.x LTS (Recommended)
- **Package Manager**: npm 10+ (or bun/pnpm)
- **Java Development Kit**: JDK 17 or JDK 21 / Android Studio bundled JBR
- **Android Studio**: Ladybug / Koala or later with Android SDK 35
- **Database**: PostgreSQL 15+ or Supabase CLI / hosted instance

---

## 2. Monorepo Structure

```
ANTIQUE SUPPLY/
├── apps/
│   ├── web/               # Next.js 15+ Web Portal (Buyer, Supplier & Admin)
│   └── android/           # Kotlin Jetpack Compose Native Mobile App
├── packages/
│   └── shared-schemas/    # Shared Zod contracts, validation & state machines
├── supabase/
│   └── migrations/        # DDL, RLS policies, atomic functions & seed data
├── docs/                  # System architecture, API specs, setup guides
└── tests/                 # Automated end-to-end and unit test suites
```

---

## 3. Web Application Quick Start

1. Install all dependencies across the monorepo:
   ```bash
   npm install
   ```

2. Start the local Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Testing Roles:
   - Use the **Active Persona Switcher** at the top banner to switch seamlessly between:
     - **Buyer View**: Boracay Palms Beach Resort or Panay Heritage Bistro
     - **Supplier View**: Laua-an Muscovado Coop, Bagtason Loom Weavers, or Tibiao VCO
     - **Admin View**: Antique Provincial Marketplace Administration

4. Build for Production:
   ```bash
   npm run build
   ```

---

## 4. Native Android Studio Setup

1. Open Android Studio.
2. Select **File -> Open...** and choose the `apps/android` directory.
3. Allow Gradle to sync dependencies. Gradle uses Kotlin 2.0 with the Compose compiler plugin.
4. If testing on the Android Emulator, network calls to `http://localhost:3000` automatically route via `http://10.0.2.2:3000`.
5. Run the app on an Android Emulator or physical device (API Level 26+).
6. Offline capability: If disconnected from the internet, you can create draft RFQs that will be persisted in the local Room database (`draft_rfqs`) and cached catalog (`cached_products`).

---

## 5. PostgreSQL Database & Migrations

If setting up your own PostgreSQL or Supabase instance:
1. Apply the initial schema:
   ```bash
   psql -h <host> -U <user> -d <database> -f supabase/migrations/20261024000001_initial_schema.sql
   ```
2. Apply the authentic Antique seed data:
   ```bash
   psql -h <host> -U <user> -d <database> -f supabase/migrations/20261024000002_seed_antique_data.sql
   ```

---

## 6. Running Automated Tests

Execute the comprehensive procurement lifecycle and state machine verification suite:
```bash
npm test
```
Or directly:
```bash
node --test tests/procurement-lifecycle.test.mjs
```
All 10 test scenarios will verify schema contracts, state machine legality, and inventory locking.
