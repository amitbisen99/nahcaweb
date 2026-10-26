import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireSuperAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const activityLogRouter = Router();

const DEFAULT_PAGE_SIZE = 25;

// Super admin only: the log shows what every admin has done.
activityLogRouter.get(
  "/",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

    const [entries, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activityLog.count(),
    ]);

    res.json({ entries, total, page, pageSize });
  })
);
