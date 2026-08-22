import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { findValidCoupon, isCouponError, listActiveProgrammeCoupons } from "../lib/coupons";
import { eventCodeExists } from "../lib/eventCodes";

export const couponsRouter = Router();

// Real membership plan types — used by /validate's planType, which checks
// an actual Membership purchase against Coupon.appliesTo. Unrelated to
// COUPON_SCOPES below (appliesTo's own value domain is a superset — it
// also has to represent "this coupon is for a specific event/webinar",
// which isn't a membership type at all).
const MEMBERSHIP_TYPES = ["regular", "student", "institutional", "conference"] as const;

// What a coupon's "Applied to which plan" can be set to. "conference" was
// removed from here (per the client) in favor of "nahca_programmes" — a
// coupon scoped to one specific Event or Webinar via eventCode below.
// Actual Conference memberships (MEMBERSHIP_TYPES above) are unaffected;
// this only changes what a *coupon* can be scoped to.
const COUPON_SCOPES = ["regular", "student", "institutional", "nahca_programmes"] as const;

function couponRefinement(data: { appliesTo?: string[]; eventCode?: string }) {
  return !data.appliesTo?.includes("nahca_programmes") || Boolean(data.eventCode);
}
const COUPON_REFINEMENT_ISSUE = {
  message: "Enter the event code this coupon applies to",
  path: ["eventCode"],
};

const couponFields = {
  name: z.string().min(1),
  code: z
    .string()
    .min(1)
    .transform((v) => v.trim().toUpperCase()),
  discountType: z.enum(["percent", "fixed_amount", "complimentary"]),
  // Percentage (0-100) for `percent`, cents for `fixed_amount`, ignored for
  // `complimentary` — defaulted to 0 so the field can be omitted for that type.
  discountValue: z.number().int().min(0).default(0),
  // At least one required — there's no more "leave blank to apply to
  // everything" state (client's explicit requirement).
  appliesTo: z.array(z.enum(COUPON_SCOPES)).min(1, "Select at least one option"),
  eventCode: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => v || undefined),
  validFrom: z.coerce.date().nullable().optional(),
  validTill: z.coerce.date().nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  published: z.boolean().optional(),
};

const couponSchema = z.object(couponFields).refine(couponRefinement, COUPON_REFINEMENT_ISSUE);

// Used for PUT — appliesTo/eventCode are individually optional (a partial
// update might not touch them at all), but if appliesTo IS present in the
// payload and includes "nahca_programmes", eventCode is still required.
const couponUpdateSchema = z
  .object({ ...couponFields, appliesTo: couponFields.appliesTo.optional() })
  .partial()
  .refine(couponRefinement, COUPON_REFINEMENT_ISSUE);

// Admin CRUD — list, view, create, update, delete.

couponsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ items: coupons });
  })
);

// Member-facing (any logged-in account, not just admins) — every currently
// usable coupon scoped to a specific Event/Webinar, so the portal
// dashboard can remind both general and sponsored members it exists.
// Registered before /:id so "programmes" is never swallowed as an id.
couponsRouter.get(
  "/programmes",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const items = await listActiveProgrammeCoupons();
    res.json({ items });
  })
);

couponsRouter.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.findUnique({ where: { id: Number(req.params.id) } });
    if (!coupon) return res.status(404).json({ error: "Not found" });
    res.json({ item: coupon });
  })
);

// Shared by POST/PUT — 400s if the coupon is scoped to Nahca Programmes but
// the entered code doesn't match a real Event or Webinar.
async function checkEventCode(eventCode: string | undefined) {
  if (eventCode && !(await eventCodeExists(eventCode))) {
    return { error: { fieldErrors: { eventCode: ["No event or webinar found with this code"] } } };
  }
  return null;
}

couponsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = couponSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing) return res.status(409).json({ error: "A coupon with this code already exists" });

    const isProgramme = parsed.data.appliesTo.includes("nahca_programmes");
    const codeError = await checkEventCode(isProgramme ? parsed.data.eventCode : undefined);
    if (codeError) return res.status(400).json(codeError);

    const coupon = await prisma.coupon.create({
      data: { ...parsed.data, eventCode: isProgramme ? parsed.data.eventCode : null },
    });
    res.status(201).json({ item: coupon });
  })
);

couponsRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = couponUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (parsed.data.code) {
      const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
      if (existing && existing.id !== Number(req.params.id)) {
        return res.status(409).json({ error: "A coupon with this code already exists" });
      }
    }

    // appliesTo may be absent entirely on a partial update — only touch
    // eventCode's stored value when appliesTo was actually part of this
    // payload (the admin form always sends it, but the schema allows not).
    const data: Omit<typeof parsed.data, "eventCode"> & { eventCode?: string | null } = { ...parsed.data };
    if (parsed.data.appliesTo) {
      const isProgramme = parsed.data.appliesTo.includes("nahca_programmes");
      const codeError = await checkEventCode(isProgramme ? parsed.data.eventCode : undefined);
      if (codeError) return res.status(400).json(codeError);
      data.eventCode = isProgramme ? parsed.data.eventCode : null;
    }

    const coupon = await prisma.coupon.update({ where: { id: Number(req.params.id) }, data });
    res.json({ item: coupon });
  })
);

couponsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.coupon.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);

// Public — validate a code before checkout. Does NOT redeem it (usedCount is
// only incremented once the payment actually succeeds, via activatePayment).

const validateSchema = z.object({
  code: z.string().min(1),
  planType: z.enum(MEMBERSHIP_TYPES).optional(),
  eventCode: z.string().optional(),
});

couponsRouter.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const result = await findValidCoupon(parsed.data.code, {
      planType: parsed.data.planType,
      eventCode: parsed.data.eventCode,
    });
    if (isCouponError(result)) {
      return res.status(result.status).json({ error: result.message });
    }
    const coupon = result;

    res.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  })
);
