# AntiqueSupply photography

The approved inventory is [image-manifest.json](../apps/web/public/image-manifest.json). The website exposes it at `/image-manifest.json` and provides human-readable attribution at `/image-credits`. Android bundles matching WebP assets and the same manifest for offline use.

## Page audit

| Interface | Image treatment |
| --- | --- |
| Homepage / marketplace | Tibiao rice terraces, 16:9 source crop; square sample product cards; explicit sample labels |
| Product details | Contained images, selectable gallery, source credits, product origin separate from photo provenance |
| Supplier directory | Sector illustrations on 16:9 covers, explicitly not supplier facility photography; fabricated photo logos removed |
| Supplier dashboard | Nasipit warehouse illustration, accurately captioned as Mindanao rather than Antique |
| Supplier catalog / add product | Supplier photo previews, main selection, ordering, replacement and removal; no automatic stock fallback |
| Android marketplace | Same licensed WebP assets, Coil loading/error states, adaptive square cards, gallery, offline assets and cache |
| RFQ / orders / admin | No decorative photography added to transaction-heavy screens |
| Onboarding | No onboarding screen exists in the current repository; no invented supplier identity images |

## Provenance and sourcing

`node scripts/research-images.mjs 'targeted query'` queries Wikimedia Commons image metadata. `scripts/source-images.mjs` contains the reviewed selection. It resolves original URLs using the Commons API, validates the license allowlist, records metadata evidence, downloads serially with rate-limit handling, optimizes WebP, and copies assets into Android. `--offline` rebuilds manifests and the contact sheet from existing files without network access.

Review every new photograph visually before adding it to the curated selection. Verify the creator, copyright license, source identity, commercial permission, and any non-copyright restrictions. This script does not certify model/property releases or detect all watermarks. Do not automatically publish search results. Do not infer an Antique location from a generic photo or a supplier relationship from the filename.

The textile images lack machine-readable creator fields. The source pages identify a self-published upload by Valenzuela400; this manually checked attribution is recorded in the script and evidence. Creative Commons BY and BY-SA licenses permit commercial reuse with attribution; BY-SA adaptations retain the source license. Source and license links, creator credits, and conversion/cropping notes are exposed in the application.

The branded `Muscovado 02.jpg` candidate was rejected during visual review. The usable sugar texture illustrates two sample pack sizes. Guimaras tultul salt is used only as regional food illustration on a sample supplier cover; it is not substituted for Patnongon salt flakes. The salt listing retains a clear supplier-photo-pending state until a suitable authorized photograph is available. The warehouse download initially returned HTTP 429; its Retry-After cooldown was respected before a successful retry.

## Web delivery

`Photo` uses Next.js Image, explicit responsive sizes, lazy loading below the fold and priority for the hero. Editorial files are local, version-controlled WebP; no external hotlinks or random endpoints are used. Remote optimizer sources are denied by default. Authenticated media bypasses the shared optimizer to preserve access control. Images keep aspect ratio with cover for scenery and contain for product details. `ProductPhoto` refuses editorial assets on non-demo listings. Old seed Unsplash references are migrated without resetting orders or supplier edits.

## Supplier photo storage: demo versus deployment

The current application has a role switcher and browser-local data, not a connected login or database client. Its photo editor is functional **local demo storage**, not private cloud storage. It accepts at most six JPEG/PNG/WebP files, checks signatures and size, decodes and resizes, re-encodes to strip metadata, confirms rights, previews changes, and reports browser-storage quota failures. Local demo role checks are not a security boundary.

Production media endpoints and the [storage migration](../supabase/migrations/20261024000003_product_photos.sql) are provided but require deployment configuration and integration with the application's real authenticated product repository:

1. Apply the existing schema and new migration to Supabase. Ensure `user_profiles.id` and `organization_members.user_id` correspond to verified Supabase Auth user IDs.
2. Set server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key in Android, browser code, or a `NEXT_PUBLIC_` variable.
3. With a verified supplier access token, POST raw JPEG/PNG/WebP bytes to `/api/v1/media?product_id=<uuid>`, with `Authorization: Bearer <token>`, the image Content-Type, and `X-Photo-Rights-Confirmed: true`.
4. Uploads are decoded server-side with Sharp, limited to 8 MB and 40 megapixels, re-encoded to WebP, stripped of metadata, and assigned random object keys in a private bucket. Supplier membership and an owner/admin/sales_rep role are checked against the product's real organization. Anonymous writes are rejected. The DB serializes quota checks (12 including replacements).
5. PUT `{ "photo_ids": ["uuid", "uuid"] }` to `/api/v1/products/<uuid>/photos` with the bearer token. At most six IDs belonging to that product are accepted; the atomic transaction sets display order, main image and published visibility. Omitted photos become private. An empty array unpublishes the gallery.
6. GET `/api/v1/media/<uuid>` streams published photos publicly; private photos require a verified organization member's bearer token and return `private, no-store`. For private browser previews, fetch with the token, create an object URL, and revoke it after use. Do not cache private media in shared caches.
7. DELETE `/api/v1/media/<uuid>` requires the supplier write role and removes the record, catalog reference and object. Replacements use a new ID. Add operational cleanup for failed-delete orphan objects and expired private drafts before large-scale deployment. Published images may remain in downstream caches for up to five minutes.

The existing product REST routes still serve seed data. They are not a live product repository. Applying the storage migration does not automatically convert that demo into a production marketplace. Live Supabase authorization/RLS integration cannot be verified without a configured project and test accounts.

## Android

Coil 2.7 uses a single application ImageLoader, bounded memory cache and 64 MB disk cache. Public HTTP cache headers are respected, including private/no-store boundaries. A failed remote load retries cache-only; editorial demo images ship in assets and work without network. Stable item keys and adaptive columns support scrolling and screen sizes. Photo credits include the author, license, source link and resize disclosure.

The Android application is also a demo catalog. It does not yet contain authenticated supplier account screens or a native supplier upload flow. Connect the guarded media endpoints through the real supplier workflow when that application layer is implemented.

## Checks

- `npm.cmd run build`
- `node --test tests/images.test.mjs tests/procurement-lifecycle.test.mjs`
- Android: `gradle :app:assembleDebug` with JDK/Android SDK configured.
- Review desktop and narrow browser layouts, decode every image, inspect credits, test missing images, edit galleries and reload, and launch Android online and offline.
- No production Supabase migration is automatically applied by the sourcing or build scripts.
