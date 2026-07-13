# NAHCA Web Portal — Development Prompt Playbook

A complete, ordered set of prompts to build this portal with Claude Code, organized against the
5 contractual milestones in the signed proposal. Run them roughly in order — later prompts assume
earlier ones are done. Each prompt is written to be pasted directly into a Claude Code session.

**Status key:** ✅ already done in the current build (`C:\xampp\htdocs\Nahca`) · 🔲 still to do

---

## Scope notes — read before starting

Two things in the Milestones section are **not** in the original Section 4 feature spec, and
materially change the data model:

- **Community Forum** (Milestone 1 design, Milestone 4 full build): post, reply, moderation,
  email notifications, search. This is effectively a small standalone subsystem — topics, posts,
  moderation flags, and a notification pipeline.
- **Web Store**: Milestone 4 specifies "product listings, Stripe checkout, **secure download
  links**, purchase history" — real digital-product e-commerce, not just a webinar/video listing
  page as the original Section 3.3 sitemap implied.

Also worth flagging to the client before Milestone 4 work starts (see the Open Questions appendix
at the end): the **Endorsement Fee** amount was left blank in the requirements doc, and it's
unclear what the Store's digital products actually are.

---

## Milestone 1 — Project Setup + Design Approval

**Contractual deliverables:** signed SOW · GitHub repo under NAHCA's account · dev/staging/prod
environments · finalized sitemap · page designs (Home, About, Events, Membership, Donate, Forum,
Store) · mobile-responsive layouts · design system (colors, fonts, buttons, forms).

1. ✅ **Scaffold the monorepo.** *(Done: `apps/web` Next.js+Tailwind+NextAuth, `apps/api`
   Express+Prisma+MySQL, `apps/cms` Strapi.)*

2. 🔲 **Push to GitHub under NAHCA's account.**
   > Initialize this repo's remote pointing at NAHCA's GitHub organization (ask me for the org/repo
   > name if you don't have it), push the current state as an initial commit, and set up a
   > `.github/CODEOWNERS` plus branch protection notes in the README for `main`. Do not push
   > `.env` files — confirm `.gitignore` already excludes them.

3. 🔲 **Set up dev/staging/production environment configuration.**
   > Create `.env.staging.example` and `.env.production.example` for `apps/api` and `apps/web`
   > alongside the existing `.env.example`/`.env.local.example`. Document in the README how each
   > environment differs (staging uses Stripe/SendGrid/Mailchimp test keys and a staging DB;
   > production uses live keys). Add an environment banner component to `apps/web` that shows a
   > small "STAGING" ribbon when `NEXT_PUBLIC_ENV=staging`, so testers can never confuse the two.

4. 🔲 **Establish the design system.**
   > Define NAHCA's design tokens in `apps/web`: a Tailwind theme extension (`tailwind.config` or
   > the v4 `@theme` block in `globals.css`) with a primary/secondary color palette, heading and
   > body font choices, and reusable button/form-input style variants (primary, secondary, danger,
   > disabled states). Ask me for NAHCA's actual brand colors/fonts if not already supplied;
   > otherwise propose a palette appropriate for a Hindu spiritual-care nonprofit and flag it as
   > provisional pending client approval.

5. 🔲 **Finalize and document the sitemap.**
   > Produce a sitemap document (`docs/SITEMAP.md`) listing every route in `apps/web/src/app`,
   > cross-referenced against the Milestone 1 required pages (Home, About, Events, Membership,
   > Donate, Forum, Store) plus every other page from the original proposal's sitemap. Mark each
   > as Redesign / New / Enhanced per the original doc.

6. 🔲 **High-fidelity page designs for Home, About, Events, Membership, Donate, Forum, Store.**
   > Working page-by-page, replace the current placeholder styling on `/`, `/about`, `/events`,
   > `/membership`, `/donate`, `/store` with a polished, on-brand layout using the design tokens
   > from step 4. For `/forum`, design a new placeholder page (topic list layout, empty state) —
   > full functionality comes in Milestone 4. Keep content structure from the existing scaffold;
   > this pass is visual only.

7. 🔲 **Mobile responsiveness pass.**
   > Audit every page built so far at mobile (375px), tablet (768px), and desktop (1280px)
   > breakpoints using the browser preview tool. Fix any overflow, nav collapse, or touch-target
   > issues. The header nav in particular needs a mobile hamburger menu — it currently only shows
   > on `lg:` breakpoints and up.

---

## Milestone 2 — Backend Core: Database, Auth & CMS

**Contractual deliverables:** MySQL live on staging · registration/login for all 4 membership
tiers · role-based access (Member vs Admin) · CMS live with Events/Videos/Articles/Newsletters/
**Board** content types · CMS admin login working · member portal shell visible on staging.

8. ✅ **Prisma schema + MySQL.** *(Done: `User`, `Membership`, `Donation`, `Coupon`, `Payment`,
   `Receipt` models, migrated against local `nahca_app` MySQL DB.)*

9. ✅ **Auth: register/login/JWT + role middleware.** *(Done: `apps/api/src/routes/auth.ts`,
   `requireAuth`/`requireAdmin` middleware, NextAuth Credentials provider on the frontend.)*

10. 🔲 **Deploy MySQL to a staging server.**
    > Provision a staging MySQL instance on the chosen cloud host, create `nahca_app` and
    > `nahca_cms` databases there, and update `apps/api/.env.staging` / Strapi's staging DB config
    > to point at it. Run the existing Prisma migrations against staging and confirm connectivity.

11. 🔲 **Build the four membership-tier signup flows.**
    > Replace the stub in `apps/api/src/routes/memberships.ts` with real logic: Regular ($75/yr,
    > captures Full Name/Workplace/Email/Phone), Student ($60/yr single-year or $75 for 2-year,
    > with group-discount detection when 5+ students share an institutional email domain — use the
    > `Membership.groupId` field already in the schema), Institutional ($250/yr, org
    > name/contact/billing email/address fields), and Conference (admin-configurable amount, no
    > payment logic yet — that's step 15). Each should create a `Membership` + `Payment` row in
    > `pending` status; actual Stripe charging comes in Milestone 3. Build the corresponding
    > `/membership` signup form on the frontend with a tier-selector step.

12. 🔲 **Migrate Strapi from SQLite to MySQL and define content types.**
    > Reconfigure `apps/cms` (currently SQLite quickstart) to use the `nahca_cms` MySQL database —
    > update `config/database.ts` and install the `mysql2` driver. Then define these content
    > types: `Event` (title, date, time, description, registrationLink, featuredImage), `Webinar`
    > (title, description, zoomOrYoutubeLink, price, speakerInfo), `ConferenceVideo` (title,
    > videoUrl/embed, year, category), `Article` (title, richTextBody, category enum:
    > Podcast/Presentation/Referral/Ethics), `Newsletter` (title, pdfOrContent,
    > mailchimpCampaignUrl, publishedDate), and **`Board`** (name, title/role, bio, photo, order —
    > for the About Us page's NAHCA Board section). Enable public read permissions on all six.

13. 🔲 **CMS admin users for NAHCA staff.**
    > Set up Strapi's admin panel with at least one editor role (content create/edit, no
    > server-config access) so NAHCA staff can log in and manage content without developer
    > access. Document the login URL and role setup in `docs/CMS-GUIDE.md` (this becomes the
    > seed for the Milestone 5 admin guide).

14. 🔲 **Member portal shell on staging.**
    > Deploy the current `apps/web` `/portal` shell to staging and confirm it's reachable — this
    > milestone only requires the dashboard layout to exist, not full data (that's Milestone 4).

---

## Milestone 3 — Payments, Integrations & Email Automation

**Contractual deliverables:** Stripe test payments live for all membership tiers + donation +
conference fee · recurring annual billing for Regular/Institutional · discount/coupon codes
functional · automated receipt emails · welcome emails · Mailchimp connected with auto-subscribe.

15. ✅ **Donation Stripe Checkout + webhook + SendGrid receipt.** *(Done, tested end-to-end —
    see `apps/api/src/routes/donations.ts` and `webhooks.ts`.)*

16. 🔲 **Wire Stripe Checkout into the membership signup flows from step 11.**
    > For Regular and Institutional memberships, create a Stripe Checkout session in
    > `subscription` mode (annual recurring) reusing the pattern from `donations.ts`. For Student
    > memberships, support both the 1-year and 2-year one-time price options plus the group
    > discount. On `checkout.session.completed`, update the `Membership` status to `active` and
    > set `startDate`/`endDate`.

17. 🔲 **Conference fee payment + coupon code system.**
    > Build the Conference/Professional Development fee checkout using the existing `Coupon`
    > model: support 25%/40%/50%/100%-off codes with expiration dates and usage limits (increment
    > `usedCount`, reject if `maxUses` reached or expired). Give admins a way to generate coupon
    > codes (simple authenticated API endpoint is enough for this milestone; admin UI comes in
    > Milestone 4).

18. 🔲 **Receipt and welcome email templates.**
    > Extract the inline receipt body in `apps/api/src/lib/mailer.ts` into an admin-editable
    > template system (store templates in a new `EmailTemplate` table — key, subject, body with
    > `{{placeholders}}`). Build a separate "welcome email" template sent on successful membership
    > registration (distinct from the payment receipt). Receipts must include org name, EIN, amount,
    > date, payment reference, and purpose — confirm all fields are populated correctly for both
    > membership and donation payments.

19. 🔲 **Mailchimp integration.**
    > Implement `apps/api/src/routes/newsletter.ts` (currently stubbed): call the Mailchimp API to
    > add an email to NAHCA's audience list on `/newsletter/signup`. Wire the same call into the
    > membership signup flow's newsletter opt-in checkbox from step 11, so members who opt in are
    > auto-subscribed. Handle "already subscribed" and invalid-email responses gracefully.

20. 🔲 **Stripe test-mode verification pass.**
    > Walk through a full test-mode payment for every tier (card `4242 4242 4242 4242`) plus a
    > one-time and recurring donation, plus a coupon-code conference fee payment. Confirm: correct
    > amount charged, receipt email arrives with correct details, Mailchimp contact appears when
    > opted in. Fix anything that doesn't match the Milestone 3 "Client can verify" checklist.

---

## Milestone 4 — Full Frontend, Forum, Store & UAT Sign-off

**Contractual deliverables:** all public pages live · member portal complete (status/renewal/
payment history/members-only content) · community forum (post/reply/moderation/notifications/
search) · web store (listings/checkout/secure downloads/purchase history) · admin dashboard
(member management/reports/CSV export/CMS access) · full mobile responsiveness · UAT sign-off.

**Public pages — fill in real content:**

21. 🔲 **"What Is Hindu Chaplaincy?" + 4 sub-pages.**
    > Replace the placeholders at `/what-is-hindu-chaplaincy` and its `defining`/
    > `higher-education`/`healthcare`/`community` sub-routes with real content. Source the copy
    > from the current live site (hinduchaplains.com) as a starting point, refined for the new
    > design system.

22. 🔲 **About Us — Board + Organizational Partners.**
    > Wire `/about` to pull Board members from the Strapi `Board` content type (step 12) into
    > styled profile cards. Add an `OrganizationalPartner` content type (name, logo, website link)
    > if one doesn't already exist, and render it in a partners grid.

23. 🔲 **Learn More page.**
    > Wire `/learn-more` to pull from the Strapi `Article` content type, with filterable tabs for
    > Podcast / Presentation / Referral / Ethics categories, plus a static Code of Ethics section.

24. 🔲 **Endorsement page + fee payment.**
    > Write the full content for `/endorsement` (BCC via APC, ACPE educator certification,
    > eligibility criteria, application process) and integrate a Stripe Checkout payment for the
    > Endorsement Fee, reusing the donation/membership Checkout pattern. **Needs the fee amount
    > from the client first — flag this as blocking before building the payment part.**

25. 🔲 **Newsletter archive page.**
    > Wire `/newsletters` to list entries from the Strapi `Newsletter` content type, plus the
    > Mailchimp signup form from step 19.

26. 🔲 **Contact Us with service routing.**
    > Build `/contact` as a real form (name, email, inquiry type, message) that routes to
    > different admin email addresses based on inquiry type (e.g., General / Membership /
    > Endorsement / Media). Send via SendGrid.

**Member Portal — complete the real data:**

27. 🔲 **Membership status, renewal date, payment history.**
    > Replace the `/portal` placeholder with real queries against the logged-in user's
    > `Membership` and `Payment` records: current tier, status, renewal/expiry date, and a payment
    > history table.

28. 🔲 **Members-only content gating.**
    > Add a `membersOnly` boolean to relevant Strapi content types (Articles, Conference Videos)
    > and enforce it in the API — members-only content should 403 for unauthenticated or
    > non-member requests, and render normally for active members.

**Community Forum — new subsystem:**

29. 🔲 **Design and migrate the forum data model.**
    > Add Prisma models: `ForumCategory` (name, description), `ForumTopic` (categoryId, userId,
    > title, createdAt, pinned, locked), `ForumPost` (topicId, userId, body, createdAt, flagged),
    > and `ForumNotification` (userId, topicId, read, createdAt). Run the migration against
    > `nahca_app`.

30. 🔲 **Forum API.**
    > Build endpoints: list categories/topics, create topic, reply to topic, list posts in a
    > topic (paginated), and a full-text search endpoint over topic titles + post bodies (MySQL
    > `FULLTEXT` index is sufficient at this scale). Add moderation endpoints restricted to
    > `requireAdmin`: pin/unpin, lock/unlock, delete post, flag/unflag.

31. 🔲 **Forum frontend.**
    > Build `/forum` (category + topic list), `/forum/[topicId]` (thread view + reply composer),
    > and a search bar wired to the search endpoint. Gate posting/replying behind login
    > (`requireAuth`-equivalent on the frontend via the session).

32. 🔲 **Forum moderation UI + email notifications.**
    > Add a moderation panel to `/admin` for pinning/locking/deleting/flag-reviewing posts. Wire
    > SendGrid to email a topic's participants (original poster + anyone who replied) when a new
    > reply is posted, respecting the `ForumNotification.read` state to avoid duplicate emails.

**Web Store — digital products:**

33. 🔲 **Product and order data model.**
    > Add Prisma models: `Product` (name, description, priceCents, fileUrl or storage key) and
    > `Order` (userId, productId, stripeRef, status) — reuse the `Payment` table's pattern for
    > consistency with reporting. **Confirm with the client what the actual digital products are**
    > (recorded webinars? PDF resources?) before finalizing fields.

34. 🔲 **Store checkout + secure downloads.**
    > Build `/store` as a product listing pulling from the `Product` table, Stripe Checkout per
    > product, and on successful payment, generate a signed, time-limited download URL (short
    > expiry, single-use or capped-use token) rather than a permanent public file link.

35. 🔲 **Purchase history in member portal.**
    > Extend the `/portal` payment history (step 27) to include store purchases with re-downloadable
    > links for products the member has already bought (as long as the link/token hasn't expired —
    > regenerate rather than reuse the original if needed).

**Admin Dashboard — complete:**

36. 🔲 **Member management UI.**
    > Build the `/admin` member list view: search/filter by membership type and status
    > (Active/Expired/Pending), with the ability to view a member's full record.

37. 🔲 **Reports UI + CSV export.**
    > Implement the currently-stubbed `apps/api/src/routes/reports.ts` endpoints (member list,
    > collections by quarter/YTD/custom range, upcoming renewals at 30/60/90 days) and build the
    > corresponding `/admin` report views, each with a "Export CSV" button.

38. 🔲 **CMS access from admin dashboard.**
    > Add a clearly-labeled link/button in `/admin` to the Strapi admin panel (`NEXT_PUBLIC_CMS_URL/admin`)
    > so NAHCA staff have one place to find everything.

**Final QA:**

39. 🔲 **Full mobile responsiveness pass across every page.**
    > Re-run the responsiveness audit from step 7 now that every page has real content — pay
    > particular attention to the forum thread view and report tables, which are the pages most
    > likely to overflow on mobile.

40. 🔲 **UAT sign-off checklist.**
    > Produce `docs/UAT-CHECKLIST.md` mirroring the Milestone 4 "Client can verify" column exactly
    > (post as member/reply as admin and confirm notification email, purchase a digital product
    > and verify the download link, generate a quarterly report and export CSV, add a CMS event
    > and confirm it appears within minutes), so the client can walk through it and sign off.

---

## Milestone 5 — Production Launch

**Contractual deliverables:** DNS pointed to new platform · SSL live · Stripe switched to live
mode · content migrated · admin training completed · written CMS/admin guide delivered.

41. 🔲 **Production deployment.**
    > Deploy `apps/web`, `apps/api`, and `apps/cms` to production on the chosen cloud host, with
    > production environment variables (live Stripe keys, production DB, production
    > `WEB_ORIGIN`/CORS settings). Confirm all three services are reachable and talking to each
    > other correctly.

42. 🔲 **DNS + SSL cutover.**
    > This step is mostly a client-side action at NAHCA's domain registrar — prepare a short
    > checklist of exactly which DNS records to change (A/CNAME to the new host) and confirm SSL
    > auto-provisions (e.g., via the host's managed cert or Let's Encrypt) once DNS propagates.

43. 🔲 **Switch Stripe to live mode.**
    > Replace test-mode `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` with live-mode equivalents in
    > production env vars, and re-register the webhook endpoint in the Stripe dashboard against
    > the production URL. Do one real, small live payment to confirm end-to-end before
    > announcing launch.

44. 🔲 **Content migration.**
    > Migrate existing content from hinduchaplains.com (About text, past events, resources listed
    > under "Ten Useful Resources", Code of Ethics) into the corresponding Strapi content types.

45. 🔲 **Admin training + written guide.**
    > Expand `docs/CMS-GUIDE.md` from step 13 into a full admin guide covering: logging into
    > Strapi and adding/editing content, generating coupon codes, running and exporting reports,
    > moderating the forum, and triggering the year-end tax letter batch. Use this as the agenda
    > for a live training session with NAHCA staff.

---

## Open questions for the client (resolve before the blocking steps)

- **Endorsement Fee amount** — blocks step 24.
- **Conference/Professional Development fee amount** (already known to be admin-configurable, but
  needs an initial value) — blocks step 17 testing.
- **What are the Store's digital products, specifically?** — blocks step 33.
- **Forum moderation policy** — who are the moderators, what's the escalation process for flagged
  posts? — informs step 32.
- **NAHCA's GitHub organization name/access** — blocks step 2.
- **Final hosting provider** (Hostinger vs. AWS vs. other) — blocks steps 10 and 41.
- **NAHCA's brand colors/fonts**, if not already supplied — blocks step 4.
