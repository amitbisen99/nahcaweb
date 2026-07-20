# Render Staging Setup

This deploys `nahca-mysql`, `nahca-api`, and `nahca-cms` from the root `render.yaml`
Blueprint. `apps/web` keeps deploying to Vercel as it already does — only its env
vars change (see step 6).

## 1. Connect the repo

1. Sign up / log in at [render.com](https://render.com) with GitHub.
2. Dashboard → **New** → **Blueprint**.
3. Select the `nahcaweb` repo. Render reads `render.yaml` at the root and shows
   the three services it's about to create.
4. Where prompted for secret values it can't generate itself, enter (or leave
   blank and fill in later, see step 5):
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — from `dashboard.stripe.com/test/apikeys`
   - `SENDGRID_API_KEY` — from `app.sendgrid.com/settings/api_keys` (optional — skip if you don't need receipt emails yet)
   - `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID` — optional, newsletter signup is still a stub
   - `WEB_ORIGIN` — the deployed Vercel URL, e.g. `https://nahcaweb.vercel.app`
5. Click **Apply**. Render creates all three services. `nahca-api` will fail its
   first deploy — that's expected, it's still missing `DATABASE_URL` (see step 2).

## 2. Wire up the MySQL password for nahca-api and nahca-cms

Render Blueprints can't cross-reference another service's `generateValue`
secret directly, so this needs a one-time manual copy-paste into **two**
services:

1. Open the **nahca-mysql** service → **Environment** tab. Copy the generated
   `MYSQL_ROOT_PASSWORD` value.
2. Still on nahca-mysql → **Info**/**Connect** tab. Copy its internal hostname
   (looks like `nahca-mysql:3306` or similar — Render shows the exact internal
   address other services on your account can reach it at).
3. Open **nahca-api** → **Environment** tab → set `DATABASE_URL` to:
   ```
   mysql://root:<password from step 1>@<host from step 2>/nahca_app
   ```
4. Open **nahca-cms** → **Environment** tab → set `DATABASE_PASSWORD` to the
   same password from step 1. (`DATABASE_HOST`/`DATABASE_PORT` are already
   wired up automatically via `fromService` in the blueprint.)
5. Save both. Render redeploys each automatically — `nahca-api` should now
   build, run `prisma migrate deploy`, and boot successfully.

## 3. Create the CMS database

The MySQL image only auto-creates `nahca_app` on first boot. `nahca_cms` needs
one manual command:

1. Open **nahca-mysql** → **Shell** tab (gives a terminal inside the running container).
2. Run:
   ```
   mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE nahca_cms CHARACTER SET utf8mb4;"
   ```
3. Redeploy **nahca-cms** (Manual Deploy → Deploy latest commit) so it connects
   fresh against the new database.

## 4. First admin login (Strapi)

Once `nahca-cms` is live, visit `https://<nahca-cms-url>/admin` — Strapi's
first-run screen lets you create the first admin account directly (no seed
script needed). This is the account NAHCA staff will use to log in and manage
content.

## 5. Verify

- `https://<nahca-api-url>/health` → `{ "ok": true }`
- `https://<nahca-cms-url>/admin` → Strapi login screen
- Create a test Event in the CMS admin, then confirm
  `https://<nahca-cms-url>/api/events` returns it (public read permissions are
  set automatically on boot — see `apps/cms/src/index.ts`)

## 6. Point apps/web at the new URLs

In the Vercel project settings for `apps/web`, update:

- `NEXT_PUBLIC_API_URL` / `API_URL` → the `nahca-api` Render URL
- `NEXT_PUBLIC_CMS_URL` → the `nahca-cms` Render URL

Redeploy on Vercel to pick up the change.
