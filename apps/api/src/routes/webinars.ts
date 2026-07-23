import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

// Webinars have a visibility rule the other content types don't: "open" ones
// are public, "members_only" ones require any logged-in account (not just
// admin) — so this doesn't fit the generic createContentRouter factory,
// which only distinguishes admin vs anonymous.
export const webinarsRouter = Router();

const webinarSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  zoomOrYoutubeLink: z.string().optional(),
  priceCents: z.number().int().optional(),
  speakerInfo: z.string().optional(),
  access: z.enum(["open", "members_only"]).optional(),
  published: z.boolean().optional(),
});

webinarsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const isMember = Boolean(req.auth);

    const where = isAdmin ? undefined : isMember ? { published: true } : { published: true, access: "open" as const };

    const items = await prisma.webinar.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ items });
  })
);

webinarsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const isMember = Boolean(req.auth);

    const item = await prisma.webinar.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ error: "Not found" });
    if (!isAdmin && !item.published) return res.status(404).json({ error: "Not found" });
    if (!isAdmin && !isMember && item.access !== "open") return res.status(404).json({ error: "Not found" });

    res.json({ item });
  })
);

webinarsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = webinarSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const item = await prisma.webinar.create({ data: parsed.data });
    res.status(201).json({ item });
  })
);

webinarsRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = webinarSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const item = await prisma.webinar.update({ where: { id: Number(req.params.id) }, data: parsed.data });
    res.json({ item });
  })
);

webinarsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.webinar.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);
