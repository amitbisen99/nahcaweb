import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const usersRouter = Router();

const DEFAULT_PAGE_SIZE = 10;

// A "general user" is a free account with no Membership row at all — the
// same definition `hasMembership` uses at login to route someone to
// /dashboard instead of /portal. Admins are excluded by role.
usersRouter.get(
  "/general",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const where = { role: "member" as const, memberships: { none: {} } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          _count: { select: { productOrders: true, forumTopics: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, pageSize });
  })
);
