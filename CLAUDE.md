# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                 # Dev server (Next 16 + Turbopack) on :3000
npm run build               # Production build
npm run lint                # ESLint (flat config, eslint-config-next)
npm run typecheck           # tsc --noEmit
npm run smoke               # End-to-end smoke suite against a running server
npm run db:generate         # Generate SQL migration from lib/db/schema.ts
npm run db:migrate          # Apply migrations (run from a dev machine, never CI)
npm run db:seed             # Wipe and reseed demo data
npm run db:studio           # Drizzle Studio
```

There is no unit-test framework. "Verified" means `npm run lint && npm run typecheck && npm run build`, then `npm run smoke` against a running server and a seeded database — 32 checks covering authorization, tenant isolation, the donor upsert, the donation transaction, the audit trail, and rate limiting. Run the seed first; the smoke suite assumes demo data.

Seeded logins (password `demo123`): super admin `01700000000` / `admin@bloodbank.org`; org admins `01710000001` (savar-blood-bank), `01710000002` (uttara-donors), `01710000003` (mirpur-life-savers).

## Architecture

Multi-tenant blood donation platform. Each organization is a tenant at `/[orgSlug]/...`. Next.js 16 App Router on **Vercel**, **MySQL (MariaDB 11.8) on Hostinger shared hosting** via Drizzle, NextAuth for auth, Firebase for push notifications only.

Four layers, strictly ordered:

```
app/api/**/route.ts     parse + validate (Zod) + authorize + call service + respond
        ↓
lib/services/*.ts       business rules, transactions, audit writes, push dispatch
        ↓
lib/repositories/*.ts   Drizzle queries, joins, aggregates — the ONLY SQL in the app
        ↓
lib/db/schema.ts        table definitions — the single source of truth for types
```

- **Routes never import `drizzle-orm`.** If a handler writes SQL, it is in the wrong layer.
- DTOs derive from the schema via `InferSelectModel` in `lib/types.ts`. Do not hand-maintain parallel interfaces.
- Rows carry `Date`; the API contract is ISO strings. `lib/api/serialize.ts` does that conversion and strips the password hash.

### The tenant boundary

Non-negotiable: resolve `orgSlug` → organization row → filter every query by `organization_id`. **Never accept an organization id from the client.** Guards return the resolved org, so handlers use `organization.id`, not user input.

Services additionally re-check ownership on id-addressed records (a donor id, a request id), because an admin of one org must not act on another's rows by guessing an id.

## Database constraints that bite

- **MariaDB has no `LATERAL` join**, so Drizzle's relational API (`db.query.<table>.findMany({ with: ... })`) fails at *runtime* with ER_PARSE_ERROR 1064 — not at compile time. Use explicit `db.select().innerJoin(...)`. The `relations()` in `lib/db/schema.ts` exist to document foreign keys, not to license `db.query`.
- **The pool holds ONE connection per instance** (`MYSQL_POOL_LIMIT=1`), because Hostinger caps `max_user_connections` at 50 and each Vercel lambda holds its own. Consequence: **any read issued against `db` while a transaction is open deadlocks** — the transaction holds the only connection and the read waits for one that cannot be freed. Repository functions therefore take an optional `executor`; inside `db.transaction(async (tx) => ...)` you must pass `tx` to every nested call. This has already caused one bug.
- Every query is a public-internet round trip, not localhost. Prefer one grouped aggregate over N sequential counts; the analytics repository exists for exactly this.
- `db` in `lib/db/index.ts` is a lazy Proxy: the pool opens on first use, so scripts can call `dotenv.config()` before importing it.
- MySQL `TIMESTAMP` ends in 2038 — bookkeeping columns use `timestamp`, user-supplied dates use `datetime`.
- Connection charset is `utf8mb4`; the app stores Bangla.

## Auth

- NextAuth v4, JWT strategy, no database adapter. Providers: two `CredentialsProvider`s distinguished by id — **`"phone"`** and **`"email"`** — plus Google.
- Passwords are bcrypt-only. An earlier `bcrypt.compare(...) || plaintext === stored` fallback was an authentication bypass and was removed; do not reintroduce a plaintext path.
- `proxy.ts` at the repo root (Next 16 renamed `middleware.ts`) guards **pages**: `/admin/:path*` and `/:orgSlug/dashboard/:path*`.
- `proxy.ts` does **not** protect API routes. Authorization for those lives in `lib/auth/guards.ts`: `requireSession`, `requireOrgAdmin(orgSlug)`, `requireSuperAdmin`. Guards throw `HttpError`, which `withErrorHandling` turns into a response.
- Deliberately public: donor registration, blood request creation, feedback submission, org stats, public donor/request/event listings. Everything else needs a guard.
- Audit `performedById` always comes from the session, never the request body.
- Credentials sign-in throttles failed attempts (8 per identifier per 15 minutes) in `lib/authOptions.ts`.

## Abuse controls and their limits

`lib/api/rateLimit.ts` guards the public write endpoints (registration, blood requests, feedback, organization applications, push subscribe). Both it and the login throttle keep counters **in the memory of one serverless instance**, so the effective allowance is higher than configured and resets on cold start. They are speed bumps against casual abuse and double submits, not defences against a distributed attacker. A real global limit needs shared state (Upstash Redis); doing it in MySQL would add a round trip per request against a 50-connection cap. Do not describe these as rate limiting without the caveat.

Authenticated admin routes are deliberately unlimited — they are already behind a session and a role check.

## Conventions

- Path alias `@/*` → repo root. App Router `params` are Promises: `const { orgSlug } = await params;`.
- Every route wraps its handler in `withErrorHandling` and answers `{ data }` or `{ error }`. Clients call through `lib/api/client.ts` (`apiGet`/`apiPost`/`apiPut`/`apiDelete`, `query`), which unwraps `data` and throws `ApiRequestError`.
- Ids are numeric (`id`), not the Firestore-era `_id` string. Nothing should reintroduce `_id`.
- Input is parsed with the Zod schemas in `lib/validation/schemas.ts`, shared between forms and routes.
- Audit action values are **snake_case** because `app/[orgSlug]/dashboard/audit-log/page.tsx` keys its label/icon map off those exact strings.
- District/upazila inputs use `<LocationSelect>` backed by `lib/data/locations.ts` — never free text.
- `cn()` is redefined locally in each `components/ui/*` file; there is no shared `lib/utils.ts`.
- i18n: `useLanguage()` from `lib/i18n` gives `t` from `en.ts`/`bn.ts`. Add new strings to both.
- Dark-mode only in practice: `<html className="dark">` is hardcoded in `app/layout.tsx`.
- Org branding (`primaryColor`) is applied via inline styles, since it is per-tenant data.

## Firebase is push-only

`lib/firebase/adminApp.ts` exports `adminMessaging` (and `adminAuth`); `lib/firebase/clientApp.ts` exports `app` for `getMessaging`. **No Firestore.** Push subscriptions are FCM tokens stored in MySQL. Push is fire-and-forget: a notification failure must never fail the blood request that triggered it.

## Realtime

There is none, deliberately. `app/[orgSlug]/dashboard/requests/page.tsx` polls `/api/requests` every 15s (and refetches after mutations, and on window focus). Socket.IO cannot run on Vercel serverless — it needs an always-on process. Emergency requests reach donors instantly via FCM, which is the genuinely time-critical path.

## Production hardening

- Security headers are set in `next.config.ts`: CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `poweredByHeader: false`. `/api/*` additionally sends `Cache-Control: no-store` so tenant-scoped data is never held by a shared cache. The CSP allowlist covers Google Fonts, FCM endpoints and Google OAuth; **adding a third-party script or API means updating `connect-src`/`script-src`, or it will be blocked at runtime.** It still needs `'unsafe-inline'`/`'unsafe-eval'` for the Next.js runtime; tightening that requires nonce-based CSP.
- `GET /api/health` reports database reachability and round-trip latency for uptime monitoring. It reveals no driver detail on failure.
- `npm run db:seed` **deletes every row**. It refuses to run against a database that does not look like demo data (>5 organizations or >100 donor profiles); override with `SEED_FORCE=true`. Never point it at production casually.

## Deployment

App on Vercel, database on Hostinger. Migrations run from a developer machine (`npm run db:migrate`), never from the build; the runtime DB user needs no DDL grants. Set the `MYSQL_*` and NextAuth/Firebase variables in Vercel project settings.

Remote MySQL is allowlisted to `%`, so the database port is internet-reachable and credentials are the only barrier. The compensating controls are a least-privilege user scoped to this one schema, a long password, and TLS on the connection (`rejectUnauthorized: false`, since shared hosting serves a self-signed certificate — it encrypts without validating). Preview deployments share the production database unless a second schema is created.

`Dockerfile`, `docker-compose.yml`, and `output: "standalone"` remain for local Docker and the self-host option; they are not the deploy path.

## Stale docs

`README.md`, `.ai`, `PROGRESS.md`, `FEATURES.md`, and `release-v2.0.0.md` predate this architecture and variously describe MongoDB/Mongoose or Firestore, plus features that no longer exist (riders, deliveries). Treat the code as truth.
