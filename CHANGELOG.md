# Change Log and Future Updates

This markdown file tracks all significant changes and future update plans for the bloodbank project.

## Change Log

- **2026-09-02**: Settled the brand and added the pages the platform was missing. The name was live in three spellings — "Rural Blood Bank", "Bangladesh Bloodbank", "Bangladesh BloodBank" — now one constant in `lib/config/brand.ts`. The real logo replaced the placeholder, but every header drew its own lockup inline, so four navigation bars kept showing the old droplet until `components/BrandLogo.tsx` became the only place it is drawn. Added platform-level `/privacy`, `/terms`, `/cookies`, `/about` and `/contact`; the per-tenant policy copies now canonicalise to them instead of being excluded from search. Fixed `/register`, which had never existed: donor registration is tenant-scoped, so the URL fell through to `[orgSlug]`, resolved "register" as a slug and 404'd — it is now a chooser, and the homepage "Become a Donor" button points at it rather than at `/login`. All three footers carry the 3s-Soft credit.
- **2026-09-02**: SEO pass. `app/layout.tsx` held the only `metadata` object in the app, so all 28 pages shared one title and one description — every tenant's landing page, donor directory and request board answered as "Bangladesh Bloodbank - Every Drop Saves a Life". Each route segment now builds its own through `lib/seo.ts`, with a self-referencing canonical, OpenGraph and Twitter cards, and district-targeted titles per tenant. Added schema.org structured data (NGO, WebSite, MedicalOrganization, BreadcrumbList, ItemList). Fixed the PWA manifest, whose icons pointed at a `public/icons/` directory that did not exist and which nothing linked; and three assets shipped as JPEG data under a `.png` name, served as `image/png` under `nosniff`. The homepage was `force-dynamic`, paying a round trip to MySQL on every crawl; it is now cached for five minutes.
- **2026-09-01**: Fixed intermittent `ECONNRESET` failures against the database. Hostinger closes idle connections after 20 seconds (`wait_timeout`), while the pool held them for 10, so the server could reap a connection the pool then handed out. Lowered the pool idle timeout to 5 seconds and wrapped the pool to retry once on stale-connection errors. On serverless this would have failed most requests that followed any pause.
- **2026-09-01**: Fixed donor registration, which could not be completed at all. The page was a three-step wizard whose step state was never advanced (`nextStep`/`prevStep` existed and nothing called them), so steps two and three stayed hidden while a duplicate set of fields rendered on top of step one. Rebuilt it as a single-page form. Also fixed the validation contract it fed: optional fields submitted as empty strings were rejected (an empty date coerced to Invalid Date, an empty password failed the length check), so any registration leaving the password or last-donation blank returned 400; and the client schema collected age and gender that no column stores, with a password minimum that disagreed with the server's.
- **2026-09-01**: Production hardening. Added security headers (CSP, HSTS, frame/sniff/referrer/permissions policies) and `no-store` on API responses; rate limiting on public write endpoints; failed-login throttling; a `/api/health` endpoint; a destructive-seed safety guard; and a 32-check end-to-end smoke suite (`npm run smoke`). Raised the password minimum to 8 characters. Fixed two performance defects: the organization analytics endpoint fetched every donor and request to display five of each, and recording a donation scanned a donor's full history to read back one row.
- **2026-09-01**: Rebuilt the data layer on MySQL (Hostinger) with Drizzle ORM, replacing Firebase Firestore. Introduced a layered architecture (route -> service -> repository -> schema), Zod validation at every API boundary, and a consistent `{ data }` / `{ error }` response envelope. Numeric `id` replaces the Firestore-era `_id` string across the API and all client pages. Firebase is retained solely for Cloud Messaging push. The requests dashboard now polls instead of using Firestore `onSnapshot`. Security fixes bundled in: removed a plaintext-password authentication bypass, added authorization guards to 21 previously-unauthenticated API routes, and audit entries now take the actor from the server session instead of the request body.

- **2026-04-08**: All TypeScript and ESLint errors resolved. Project builds and lints cleanly. No 'any' types remain in critical logic. Only non-blocking warnings remain.

## Future Updates

- [ ] Address all remaining ESLint warnings (unused variables, recommended image usage, etc.)
- [ ] Add automated test suite for API and UI components
- [x] Improve image optimization by replacing <img> with Next.js <Image /> (done for the public pages; the dashboard settings avatar preview still uses <img>)
- [ ] Refactor unused code and variables for cleaner codebase
- [ ] Enhance documentation for API endpoints and components

---

**How to update this file:**
- Add new entries to the Change Log section with the date and a summary of the change.
- Add/update/remove items in the Future Updates section as work is planned or completed.
