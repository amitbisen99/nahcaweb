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
