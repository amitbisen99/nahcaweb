import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requirePermission } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

// Conference videos are member-portal-only content — unlike the other
// content types, even the published list requires being logged in (any
// role), not just admin. So this doesn't use the generic createContentRouter
// factory, which always allows anonymous reads of published items.
export const conferenceVideosRouter = Router();

const conferenceVideoSchema = z.object({
  title: z.string().min(1),
  videoUrl: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), "Must start with http:// or https://")
    .nullable()
    .optional(),
  videoFileUrl: z.string().nullable().optional(),
  embedCode: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  year: z.number().int().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

const NO_SOURCE_ERROR = "Add a video file, a video link or an embed code.";

function hasVideoSource(video: { videoUrl?: string | null; videoFileUrl?: string | null; embedCode?: string | null }) {
  return Boolean(video.videoUrl || video.videoFileUrl || video.embedCode);
}

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
  requirePermission("website_content"),
  asyncHandler(async (req, res) => {
    const parsed = conferenceVideoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!hasVideoSource(parsed.data)) return res.status(400).json({ error: NO_SOURCE_ERROR });
    const item = await prisma.conferenceVideo.create({ data: parsed.data });
    res.status(201).json({ item });
  })
);

conferenceVideosRouter.put(
  "/:id",
  requireAuth,
  requirePermission("website_content"),
  asyncHandler(async (req, res) => {
    const parsed = conferenceVideoSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    // Whatever the edit leaves behind must still be playable.
    const existing = await prisma.conferenceVideo.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!hasVideoSource({ ...existing, ...parsed.data })) return res.status(400).json({ error: NO_SOURCE_ERROR });
    const item = await prisma.conferenceVideo.update({ where: { id: Number(req.params.id) }, data: parsed.data });
    res.json({ item });
  })
);

conferenceVideosRouter.delete(
  "/:id",
  requireAuth,
  requirePermission("website_content"),
  asyncHandler(async (req, res) => {
    await prisma.conferenceVideo.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);
