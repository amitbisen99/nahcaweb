import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { findValidCoupon, isCouponError } from "../lib/coupons";

export const couponsRouter = Router();

const MEMBERSHIP_TYPES = ["regular", "student", "institutional", "conference"] as const;

const couponSchema = z.object({
  name: z.string().min(1),
  code: z
    .string()
    .min(1)
    .transform((v) => v.trim().toUpperCase()),
  discountType: z.enum(["percent", "fixed_amount", "complimentary"]),
  // Percentage (0-100) for `percent`, cents for `fixed_amount`, ignored for
  // `complimentary` — defaulted to 0 so the field can be omitted for that type.
  discountValue: z.number().int().min(0).default(0),
  appliesTo: z.array(z.enum(MEMBERSHIP_TYPES)).optional(),
  validFrom: z.coerce.date().nullable().optional(),
  validTill: z.coerce.date().nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  published: z.boolean().optional(),
});

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

couponsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = couponSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing) return res.status(409).json({ error: "A coupon with this code already exists" });

    const coupon = await prisma.coupon.create({ data: parsed.data });
    res.status(201).json({ item: coupon });
  })
);

couponsRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = couponSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (parsed.data.code) {
      const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
      if (existing && existing.id !== Number(req.params.id)) {
        return res.status(409).json({ error: "A coupon with this code already exists" });
      }
    }

    const coupon = await prisma.coupon.update({ where: { id: Number(req.params.id) }, data: parsed.data });
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
});

couponsRouter.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const result = await findValidCoupon(parsed.data.code, parsed.data.planType);
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
