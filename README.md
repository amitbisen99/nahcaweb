# NAHCA Web Portal

Redevelopment of [hinduchaplains.com](https://www.hinduchaplains.com/) for the North American Hindu
Chaplains Association (NAHCA) — a single owned platform replacing Flipcause/Google Forms, covering
membership management, donations, a headless CMS, newsletter integration, and admin reporting.

See [docs/PROMPT-PLAYBOOK.md](docs/PROMPT-PLAYBOOK.md) for the full, milestone-by-milestone build plan.

## Architecture

Three independent apps:

| App | Stack | Port | Purpose |
|---|---|---|---|
| `apps/web` | Next.js 16 + Tailwind + NextAuth | 3000 | Public site, member portal, admin dashboard |
| `apps/api` | Express + TypeScript + Prisma | 4000 | Auth, memberships, donations, payments, reporting |
| `apps/cms` | Strapi | 1337 | Events, Webinars, Conference Videos, Articles, Newsletters, Board |

`apps/api` uses MySQL (`nahca_app`). `apps/cms` currently runs on its local SQLite quickstart
database — migrating it to its own MySQL database (`nahca_cms`), alongside defining its content
types, is a planned next step (see [docs/PROMPT-PLAYBOOK.md](docs/PROMPT-PLAYBOOK.md), item 12).

## Prerequisites

- Node.js 20.9+ (LTS)
- MySQL — locally this project assumes XAMPP's bundled MySQL server (default `root` user, no password)

## Setup

1. Start MySQL and create the app database (`nahca_cms` isn't needed yet — see the CMS note above):
   ```sql
   CREATE DATABASE IF NOT EXISTS nahca_app;
   ```

2. **API** (`apps/api`):
   ```
   cd apps/api
   npm install
   cp .env.example .env   # fill in real Stripe/SendGrid/Mailchimp keys when ready — placeholders work for local dev
   npx prisma migrate dev
   npm run dev
   ```

3. **CMS** (`apps/cms`):
   ```
   cd apps/cms
   npm install
   npm run develop
   ```

4. **Web** (`apps/web`):
   ```
   cd apps/web
   npm install
   cp .env.local.example .env.local   # set a real AUTH_SECRET — `openssl rand -hex 32`
   npm run dev
   ```

Visit `http://localhost:3000`.

## Status

**Foundation complete:** monorepo scaffold, full Prisma schema (Users, Memberships, Donations,
Coupons, Payments, Receipts), working auth (register/login/JWT, role-based access), an end-to-end
donation flow (Stripe Checkout → webhook → SendGrid receipt), route skeleton for every page in the
sitemap, and a Home page with an original design system pulling live content from Strapi.

**Deferred to follow-up phases** (see the playbook): membership tier signup logic + group discounts,
coupon redemption UI, admin reporting dashboard, automated receipt/tax-letter templates, Mailchimp
sync, member-portal gated content, the community forum, the digital-product store, and the full
visual build-out of every remaining page.
