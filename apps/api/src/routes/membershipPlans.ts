import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const membershipPlansRouter = Router();

// Fixed set of 4 plans (regular/student/institutional/conference) — content
// and pricing are editable from the admin panel, but no create/delete: the
// row set itself is seeded once via prisma/seed.ts and never changes.

membershipPlansRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const plans = await prisma.membershipPlan.findMany({ orderBy: { id: "asc" } });
    res.json({ plans });
  })
);

membershipPlansRouter.get(
  "/:type",
  asyncHandler(async (req, res) => {
    const plan = await prisma.membershipPlan.findUnique({
      where: { type: req.params.type as never },
    });
    if (!plan) return res.status(404).json({ error: "Not found" });
    res.json({ plan });
  })
);

const updateSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().min(0),
  term: z.string().min(1),
  note: z.string().min(1),
  benefits: z.string().min(1),
  minStudents: z.number().int().min(1).nullable().optional(),
  pricePerStudentCents: z.number().int().min(0).nullable().optional(),
});

membershipPlansRouter.put(
  "/:type",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const plan = await prisma.membershipPlan.update({
      where: { type: req.params.type as never },
      data: parsed.data,
    });
    res.json({ plan });
  })
);
