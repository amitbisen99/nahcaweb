import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { speakersSchema } from "../lib/speakers";
import { createEventCode } from "../lib/eventCodes";

// Events now have the same open/members_only visibility rule as Webinars, so
// this uses the same bespoke-router pattern instead of the generic
// createContentRouter factory (which only distinguishes admin vs anonymous).
export const eventsRouter = Router();

const dateInput = z.coerce.date();

const eventSchema = z.object({
  title: z.string().min(1),
  date: dateInput,
  time: z.string().optional(),
  description: z.string().optional(),
  registrationLink: z.string().optional(),
  featuredImageUrl: z.string().nullable().optional(),
  speakers: speakersSchema,
  access: z.enum(["open", "members_only"]).optional(),
  published: z.boolean().optional(),
});

eventsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const isMember = Boolean(req.auth);

    const where = isAdmin ? undefined : isMember ? { published: true } : { published: true, access: "open" as const };

    const items = await prisma.event.findMany({ where, orderBy: { date: "asc" } });
    res.json({ items });
  })
);

eventsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const isMember = Boolean(req.auth);

    const item = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ error: "Not found" });
    if (!isAdmin && !item.published) return res.status(404).json({ error: "Not found" });
    if (!isAdmin && !isMember && item.access !== "open") return res.status(404).json({ error: "Not found" });

    res.json({ item });
  })
);

eventsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const eventCode = await createEventCode("EVT");
    const item = await prisma.event.create({ data: { ...parsed.data, eventCode } });
    res.status(201).json({ item });
  })
);

eventsRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = eventSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const item = await prisma.event.update({ where: { id: Number(req.params.id) }, data: parsed.data });
    res.json({ item });
  })
);

eventsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.event.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);
