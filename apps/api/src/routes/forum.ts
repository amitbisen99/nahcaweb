import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { isActiveMember } from "../lib/forumAccess";

export const forumRouter = Router();

const authorSelect = { select: { id: true, name: true } };

// Every forum route below requires requireAuth — reading is gated behind
// having an account (even a free "general user" one), not just posting.
// A visitor with no account sees nothing here at all.
//
// "member" for forum purposes means an active Membership record, checked
// via isActiveMember() — separate from the User.role field, which is just
// admin/member as a login role and says nothing about whether the account
// holds a paid, currently-active membership.

forumRouter.get(
  "/categories",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const categories = await prisma.forumCategory.findMany({ orderBy: { id: "asc" } });
    res.json({ categories });
  })
);

const DEFAULT_PAGE_SIZE = 20;

// Public topic list — only ever "published" topics, and "members_only"
// ones are filtered out entirely for anyone who isn't a member or admin
// (they never learn such a topic exists, matching the client's explicit
// "fully hidden" requirement) rather than shown-but-locked.
forumRouter.get(
  "/topics",
  requireAuth,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const categoryId = Number(req.query.categoryId) || undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const canSeeMembersOnly = req.auth!.role === "admin" || (await isActiveMember(req.auth!.userId));

    const where: Prisma.ForumTopicWhereInput = {
      status: "published",
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
      ...(canSeeMembersOnly ? {} : { visibility: "public" }),
      ...(search
        ? { OR: [{ title: { contains: search } }, { body: { contains: search } }] }
        : {}),
    };

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: { author: authorSelect, category: true, _count: { select: { replies: { where: { deletedAt: null } } } } },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumTopic.count({ where }),
    ]);

    res.json({ topics, total, page, pageSize });
  })
);

// A user's own topics regardless of status — the only place a pending or
// rejected topic is visible to its author (the main list above only ever
// shows published topics).
forumRouter.get(
  "/my-topics",
  requireAuth,
  asyncHandler(async (req, res) => {
    const topics = await prisma.forumTopic.findMany({
      where: { authorId: req.auth!.userId, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ topics });
  })
);

forumRouter.get(
  "/topics/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const topic = await prisma.forumTopic.findUnique({
      where: { id },
      include: {
        author: authorSelect,
        category: true,
        replies: {
          where: { deletedAt: null },
          include: { author: authorSelect },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!topic || topic.deletedAt) return res.status(404).json({ error: "Topic not found" });

    const isOwnerOrAdmin = req.auth!.role === "admin" || topic.authorId === req.auth!.userId;

    // A pending/rejected topic is only visible to its own author or admin —
    // everyone else gets the same 404 as a nonexistent topic, not a 403
    // (never confirm a pending/rejected topic even exists to a stranger).
    if (topic.status !== "published" && !isOwnerOrAdmin) {
      return res.status(404).json({ error: "Topic not found" });
    }

    if (topic.status === "published" && topic.visibility === "members_only" && !isOwnerOrAdmin) {
      const canSee = await isActiveMember(req.auth!.userId);
      if (!canSee) return res.status(404).json({ error: "Topic not found" });
    }

    res.json({ topic });
  })
);

const createTopicSchema = z.object({
  categoryId: z.number().int(),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  visibility: z.enum(["public", "members_only"]).default("public"),
});

forumRouter.post(
  "/topics",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createTopicSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { categoryId, title, body, visibility } = parsed.data;

    const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ error: "Invalid category" });

    if (visibility === "members_only") {
      const allowed = req.auth!.role === "admin" || (await isActiveMember(req.auth!.userId));
      if (!allowed) {
        return res.status(403).json({ error: "Only members can post a members-only topic." });
      }
    }

    // New topics always start pending — visible only to the author and
    // admin until admin approves it (see /admin/topics/:id/approve below).
    const topic = await prisma.forumTopic.create({
      data: { categoryId, title, body, visibility, authorId: req.auth!.userId, status: "pending" },
    });

    res.status(201).json({ topic });
  })
);

const replySchema = z.object({ body: z.string().min(1) });

forumRouter.post(
  "/topics/:id/replies",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const topic = await prisma.forumTopic.findUnique({ where: { id } });
    if (!topic || topic.deletedAt || topic.status !== "published") {
      return res.status(404).json({ error: "Topic not found" });
    }
    if (topic.locked) {
      return res.status(400).json({ error: "This topic is locked and no longer accepting replies." });
    }

    if (topic.visibility === "members_only" && req.auth!.role !== "admin") {
      const allowed = await isActiveMember(req.auth!.userId);
      if (!allowed) return res.status(404).json({ error: "Topic not found" });
    }

    const reply = await prisma.forumReply.create({
      data: { topicId: id, authorId: req.auth!.userId, body: parsed.data.body },
      include: { author: authorSelect },
    });

    res.status(201).json({ reply });
  })
);

// ---- Admin moderation ----

forumRouter.get(
  "/admin/topics",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const statusParam = req.query.status;
    const status = ["pending", "published", "rejected"].includes(statusParam as string)
      ? (statusParam as "pending" | "published" | "rejected")
      : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const where: Prisma.ForumTopicWhereInput = { deletedAt: null, ...(status ? { status } : {}) };

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: { author: authorSelect, category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumTopic.count({ where }),
    ]);

    res.json({ topics, total, page, pageSize });
  })
);

forumRouter.post(
  "/admin/topics/:id/approve",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const topic = await prisma.forumTopic.findUnique({ where: { id } });
    if (!topic || topic.deletedAt) return res.status(404).json({ error: "Topic not found" });

    const updated = await prisma.forumTopic.update({
      where: { id },
      data: { status: "published", rejectionReason: null },
    });
    res.json({ topic: updated });
  })
);

const rejectSchema = z.object({ reason: z.string().min(1) });

forumRouter.post(
  "/admin/topics/:id/reject",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const topic = await prisma.forumTopic.findUnique({ where: { id } });
    if (!topic || topic.deletedAt) return res.status(404).json({ error: "Topic not found" });

    const updated = await prisma.forumTopic.update({
      where: { id },
      data: { status: "rejected", rejectionReason: parsed.data.reason },
    });
    res.json({ topic: updated });
  })
);

const moderateTopicSchema = z.object({
  pinned: z.boolean().optional(),
  locked: z.boolean().optional(),
});

forumRouter.patch(
  "/admin/topics/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = moderateTopicSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.pinned === undefined && parsed.data.locked === undefined) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const topic = await prisma.forumTopic.findUnique({ where: { id } });
    if (!topic || topic.deletedAt) return res.status(404).json({ error: "Topic not found" });

    const updated = await prisma.forumTopic.update({ where: { id }, data: parsed.data });
    res.json({ topic: updated });
  })
);

// Soft-delete — used both for ordinary moderation ("delete/hide" a topic)
// and for admin clearing out a rejected topic it no longer needs to keep
// around (per the client's explicit "give option to delete it later").
forumRouter.delete(
  "/admin/topics/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const topic = await prisma.forumTopic.findUnique({ where: { id } });
    if (!topic || topic.deletedAt) return res.status(404).json({ error: "Topic not found" });

    await prisma.forumTopic.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).end();
  })
);

forumRouter.delete(
  "/admin/replies/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const reply = await prisma.forumReply.findUnique({ where: { id } });
    if (!reply || reply.deletedAt) return res.status(404).json({ error: "Reply not found" });

    await prisma.forumReply.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(204).end();
  })
);
