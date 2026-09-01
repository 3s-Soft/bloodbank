---
name: release
description: Use when cutting a release of this app, tagging a version, deploying to production, promoting a branch to main, or applying a schema change to the production database.
---

# Releasing BloodBank

## Overview

Vercel deploys the app when its configured production branch updates (set in the Vercel
dashboard, not in this repo). The database is never touched by that deploy.

**Migrations are applied by a person from a developer machine and are not part of the
build.** Schema and code therefore arrive separately, and the order you do them in decides
whether the site breaks. Everything below follows from that.

## The ordering rule

A deploy is safe only when the database is compatible with **both** the old and new code,
because both run at once during the rollover.

| Change | Order | Why |
|---|---|---|
| Additive (new table, new nullable column, new index) | **Migrate first, then merge** | New code needs the column; old code ignores it. |
| Destructive (drop/rename a column, tighten a constraint) | **Merge first, then migrate** — and split across two releases | Dropping a column the running code still selects takes the site down. |
| No schema change | Just merge | `npm run db:generate` says "No schema changes". |

For a rename, never do it in one step. Release 1: add the new column, write both, read the
old. Release 2: read the new. Release 3: drop the old.

## Sequence

1. **Preflight**
   ```bash
   git status --short          # must be empty
   git fetch origin && git log --oneline origin/main..HEAD
   ```

2. **Verify** — all four must pass:
   ```bash
   npm run lint            # 0 errors (warnings are tolerated)
   npm run typecheck       # 0 errors
   npm run build
   npm run smoke           # needs a seeded DB and a running server
   ```
   `npm run smoke` runs against demo data. Point it at a local or staging database
   (`SMOKE_BASE_URL`), **never** at production — it writes rows.

3. **Schema** — only if `lib/db/schema.ts` changed:
   ```bash
   npm run db:generate     # writes drizzle/NNNN_*.sql — commit it
   npm run db:migrate      # applies it; run from your machine, never CI
   ```
   Commit the generated SQL. It is the record of what production ran.

4. **Version** — bumps `package.json`, commits, and tags in one step:
   ```bash
   npm version patch       # or minor / major
   ```
   Add the matching entry at the top of `CHANGELOG.md` first, in the existing style:
   what changed and why, not a list of commits.

5. **Ship**
   ```bash
   git push origin main --follow-tags
   ```

6. **Confirm** — do not walk away before this:
   ```bash
   curl -s https://<deployed-host>/api/health
   ```
   Expect `{"status":"ok","database":"connected"}`. A 503 means Vercel cannot reach
   Hostinger: check the env vars and that Remote MySQL still allows the host.

## Before the first production deploy

Every variable in `.env.example` must exist in Vercel → Settings → Environment Variables,
for **both** Production and Preview. Two are easy to get wrong: `NEXTAUTH_URL` must be the
deployed URL rather than localhost, and `MYSQL_POOL_LIMIT` must stay at 1.

Preview deployments share the production database unless you create a second schema.

## Common mistakes

| Mistake | What happens | Instead |
|---|---|---|
| `npm run release` | It is a bare `npm version`, which only **prints** version numbers. Nothing is bumped or tagged, and it looks like it worked. | `npm version patch` |
| Tagging by hand | `v2.1.0` exists while `package.json` still says `2.0.0` — the tag and the manifest disagree, so nobody can tell what shipped. | Let `npm version` create the tag |
| `npm run db:seed` against production | Deletes every row and replaces it with demo accounts whose password is `demo123`. The guard refuses above 5 organizations or 100 donors, but a small real database looks like demo data. | Never point it at production |
| Merging a destructive migration with the code | The old instances still select the dropped column and 500 until they cycle out. | Split across two releases (see ordering rule) |
| Raising `MYSQL_POOL_LIMIT` to "handle load" | Hostinger caps `max_user_connections` at 50 and each Vercel instance holds its own. Raising it multiplies connections and exhausts the cap. | Leave it at 1; if you are hitting limits, move to a serverless-native MySQL |
| Raising the pool `idleTimeout` | The server's `wait_timeout` is 20s. Above it, the server kills idle connections and the pool serves dead sockets (`ECONNRESET`). | Keep it well under 20s |

## Rollback

Vercel keeps previous deployments — promote the last good one from the dashboard. That
reverts code only. **Migrations do not roll back**, which is the reason for the ordering
rule: an additive migration is safe to leave in place under old code, a destructive one is
not.

Undo a release in git with `git revert <merge-commit>` — not `reset`, since the branch is
shared.
