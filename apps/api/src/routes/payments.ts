import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const paymentsRouter = Router();

paymentsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({
      where: { userId: req.auth!.userId },
      include: { membership: true, donation: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  })
);
