import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

// Conference videos are member-portal-only content — unlike the other
// content types, even the published list requires being logged in (any
// role), not just admin. So this doesn't use the generic createContentRouter
// factory, which always allows anonymous reads of published items.
export const conferenceVideosRouter = Router();

const conferenceVideoSchema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().min(1),
  year: z.number().int().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

conferenceVideosRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const items = await prisma.conferenceVideo.findMany({
      where: isAdmin ? undefined : { published: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  })
);

conferenceVideosRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const item = await prisma.conferenceVideo.findUnique({ where: { id: Number(req.params.id) } });
    if (!item || (!isAdmin && !item.published)) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  })
);

conferenceVideosRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = conferenceVideoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const item = await prisma.conferenceVideo.create({ data: parsed.data });
    res.status(201).json({ item });
  })
);

conferenceVideosRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = conferenceVideoSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const item = await prisma.conferenceVideo.update({ where: { id: Number(req.params.id) }, data: parsed.data });
    res.json({ item });
  })
);

conferenceVideosRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.conferenceVideo.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);
