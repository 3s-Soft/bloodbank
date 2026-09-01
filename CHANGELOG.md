# Change Log and Future Updates

This markdown file tracks all significant changes and future update plans for the bloodbank project.

## Change Log

- **2026-09-01**: Production hardening. Added security headers (CSP, HSTS, frame/sniff/referrer/permissions policies) and `no-store` on API responses; rate limiting on public write endpoints; failed-login throttling; a `/api/health` endpoint; a destructive-seed safety guard; and a 32-check end-to-end smoke suite (`npm run smoke`). Raised the password minimum to 8 characters. Fixed two performance defects: the organization analytics endpoint fetched every donor and request to display five of each, and recording a donation scanned a donor's full history to read back one row.
- **2026-09-01**: Rebuilt the data layer on MySQL (Hostinger) with Drizzle ORM, replacing Firebase Firestore. Introduced a layered architecture (route -> service -> repository -> schema), Zod validation at every API boundary, and a consistent `{ data }` / `{ error }` response envelope. Numeric `id` replaces the Firestore-era `_id` string across the API and all client pages. Firebase is retained solely for Cloud Messaging push. The requests dashboard now polls instead of using Firestore `onSnapshot`. Security fixes bundled in: removed a plaintext-password authentication bypass, added authorization guards to 21 previously-unauthenticated API routes, and audit entries now take the actor from the server session instead of the request body.

- **2026-04-08**: All TypeScript and ESLint errors resolved. Project builds and lints cleanly. No 'any' types remain in critical logic. Only non-blocking warnings remain.

## Future Updates

- [ ] Address all remaining ESLint warnings (unused variables, recommended image usage, etc.)
- [ ] Add automated test suite for API and UI components
- [ ] Improve image optimization by replacing <img> with Next.js <Image />
- [ ] Refactor unused code and variables for cleaner codebase
- [ ] Enhance documentation for API endpoints and components

---

**How to update this file:**
- Add new entries to the Change Log section with the date and a summary of the change.
- Add/update/remove items in the Future Updates section as work is planned or completed.
