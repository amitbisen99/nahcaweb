import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requirePermission, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

// One kind of record for everything in the Resource Library. What an item is
// ("tags") and where it shows ("pages") are both picked in the admin form:
//
//   tags  -> a section of the Resource Library (/resources/<tag>)
//   pages -> a "Resources for ..." page         (/resources/<page>)
//
// An item can carry several of each and appears in all of them.
export const RESOURCE_TAGS = ["academic-papers", "websites", "podcasts", "videos", "articles", "newsletters"] as const;
export const RESOURCE_PAGES = ["chaplains", "students", "community"] as const;

export const resourcesRouter = Router();

// A blank text box arrives as "" — that means "no link", not an invalid one.
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), "Must start with http:// or https://")
    .nullable()
    .optional()
);

const resourceSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  websiteUrl: optionalUrl,
  podcastUrl: optionalUrl,
  videoUrl: optionalUrl,
  embedCode: z.string().nullable().optional(),
  publishedDate: z.coerce.date().nullable().optional(),
  tags: z.array(z.enum(RESOURCE_TAGS)).optional(),
  pages: z.array(z.enum(RESOURCE_PAGES)).optional(),
  published: z.boolean().optional(),
});

const unique = <T>(values: T[]) => [...new Set(values)];

// tags/pages come out of the database as JSON (or null on a row that never had
// any); the rest of the app always gets plain arrays.
function present<T extends { tags: unknown; pages: unknown }>(item: T) {
  const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);
  return { ...item, tags: list(item.tags), pages: list(item.pages) };
}

// Newest first by the date shown on the item (a newsletter's issue date), else
// when it was added.
function byDisplayDate(a: { publishedDate: Date | null; createdAt: Date }, b: { publishedDate: Date | null; createdAt: Date }) {
  return (b.publishedDate ?? b.createdAt).getTime() - (a.publishedDate ?? a.createdAt).getTime();
}

resourcesRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const tag = typeof req.query.tag === "string" ? req.query.tag : "";
    const page = typeof req.query.page === "string" ? req.query.page : "";

    const rows = await prisma.resource.findMany({ where: isAdmin ? undefined : { published: true } });
    const items = rows
      .map(present)
      .filter((item) => (!tag || item.tags.includes(tag)) && (!page || item.pages.includes(page)))
      .sort(byDisplayDate);
    res.json({ items });
  })
);

resourcesRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.auth?.role === "admin";
    const item = await prisma.resource.findUnique({ where: { id: Number(req.params.id) } });
    if (!item || (!isAdmin && !item.published)) return res.status(404).json({ error: "Not found" });
    res.json({ item: present(item) });
  })
);

resourcesRouter.post(
  "/",
  requireAuth,
  requirePermission("website_content"),
  asyncHandler(async (req, res) => {
    const parsed = resourceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { tags, pages, ...rest } = parsed.data;
    const item = await prisma.resource.create({
      data: { ...rest, tags: unique(tags ?? []), pages: unique(pages ?? []) },
    });
    res.status(201).json({ item: present(item) });
  })
);

resourcesRouter.put(
  "/:id",
  requireAuth,
  requirePermission("website_content"),
  asyncHandler(async (req, res) => {
    const parsed = resourceSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const id = Number(req.params.id);
    const existing = await prisma.resource.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { tags, pages, ...rest } = parsed.data;
    const item = await prisma.resource.update({
      where: { id },
      data: {
        ...rest,
        ...(tags ? { tags: unique(tags) } : {}),
        ...(pages ? { pages: unique(pages) } : {}),
      },
    });
    res.json({ item: present(item) });
  })
);

resourcesRouter.delete(
  "/:id",
  requireAuth,
  requirePermission("website_content"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.resource.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: "Not found" });
    await prisma.resource.delete({ where: { id } });
    res.status(204).send();
  })
);
