# NAHCA Web Portal

Redevelopment of [hinduchaplains.com](https://www.hinduchaplains.com/) for the North American Hindu
Chaplains Association (NAHCA) — a single owned platform replacing Flipcause/Google Forms, covering
membership management, donations, website content management, newsletter integration, and admin
reporting.

See [docs/PROMPT-PLAYBOOK.md](docs/PROMPT-PLAYBOOK.md) for the full, milestone-by-milestone build plan.

## Architecture

Two apps, one login for everything:

| App | Stack | Port | Purpose |
|---|---|---|---|
| `apps/web` | Next.js 16 + Tailwind + NextAuth | 3000 | Public site, member portal, and the single admin dashboard (members + website content) |
| `apps/api` | Express + TypeScript + Prisma | 4000 | Auth, memberships, donations, payments, reporting, and content (Events, Webinars, Conference Videos, Articles, Newsletters, Board) |

Everything lives in one MySQL database (`nahca_app`) behind one login system — there's no separate
CMS with its own admin login. Website content is managed at `/admin/content` inside the same admin
dashboard that manages members, using the same `admin`-role account.

## Prerequisites

- Node.js 20.9+ (LTS)
- MySQL — locally this project assumes XAMPP's bundled MySQL server (default `root` user, no password)

## Setup

1. Start MySQL and create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS nahca_app;
   ```

2. **API** (`apps/api`):
   ```
   cd apps/api
   npm install
   cp .env.example .env   # fill in real Stripe/SendGrid keys when ready — PAYMENTS_BYPASS=true works for local dev/demo without them
   npx prisma migrate dev
   npm run dev
   ```

3. **Web** (`apps/web`):
   ```
   cd apps/web
   npm install
   cp .env.local.example .env.local   # set a real AUTH_SECRET — `openssl rand -hex 32`
   npm run dev
   ```

Visit `http://localhost:3000`.

### Uploaded files (Board photos, Event images, etc.)

Stored on local disk under `apps/api/uploads/`, served at `/uploads/*`. Not committed to git.

## Deploying to a real server

Two env vars are the most common source of "it works locally but breaks after deploy":

- **`apps/web` `NEXTAUTH_URL`** must be the app's real public URL (e.g. `https://portal.hinduchaplains.com`),
  not `localhost`. NextAuth also needs `trustHost: true` (already set in `src/auth.ts`) — without it,
  every sign-in fails with an `UntrustedHost` error as soon as the app runs with `NODE_ENV=production`
  outside Vercel/Cloudflare, which is exactly what happens on a plain Node host.
- **`apps/api` `WEB_ORIGIN`** must be that same real public URL, or the API's CORS check will reject
  every request from the browser.

### Health / test endpoints

Use these right after deploying to confirm everything is actually wired up:

- `GET <api-url>/health` — checks the API process is up and can reach the database. Returns
  `{ ok: true, db: "connected" }` or a `503` with the underlying DB error.
- `GET <web-url>/api/health` — checks the web app's required env vars are set and that it can reach
  the API. Returns `{ ok: true, env: {...}, api: { reachable: true, ... } }` or a `503` explaining
  what's missing/unreachable.

Uncaught errors in the web app show a friendly fallback page (via `error.tsx`/`global-error.tsx`)
instead of a blank screen, and are logged server-side for diagnosis.

### Testing the API with Postman

Import [`docs/postman/NAHCA-API.postman_collection.json`](docs/postman/NAHCA-API.postman_collection.json)
into Postman. Set the `baseUrl` collection variable to wherever `apps/api` is deployed (defaults to
`http://localhost:4000`). Run **Auth → Register** or **Auth → Login** first — either one auto-saves its
token into the `token` variable, so every other request just works. For the admin-only requests (event
CRUD, membership plan edits, reports), log in with an admin account and paste its token into the
`adminToken` variable.

## Status

**Foundation + membership + content management complete:** monorepo scaffold, full Prisma schema
(Users, Memberships, Donations, Coupons, Payments, Receipts, and 6 content types), working auth
(register/login/JWT, role-based access), an end-to-end donation flow (Stripe Checkout → webhook →
SendGrid receipt), a 4-tier membership signup flow (Regular/Student/Institutional/Conference) with
Stripe checkout and webhook activation, a `PAYMENTS_BYPASS` mode for demoing without real Stripe
keys, a unified admin dashboard for both members and website content (with image/file upload), and
a Home page pulling live event data from the API.

**Deferred to follow-up phases** (see the playbook): coupon redemption UI, group-membership
discounts, admin reporting dashboard (collections/renewals), automated tax-letter templates,
Mailchimp sync, member-portal gated content, the community forum, the digital-product store, and
the full visual build-out of every remaining page.
