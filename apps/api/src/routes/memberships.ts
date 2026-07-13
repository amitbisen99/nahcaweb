import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const membershipsRouter = Router();

// TODO(phase 2): Regular/Student/Institutional/Conference signup flows, Stripe
// recurring billing, group-discount detection (5+ students on one email domain),
// and coupon redemption. Schema already in place: Membership, Coupon models.

membershipsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — see TODO in memberships.ts" });
}));

membershipsRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — see TODO in memberships.ts" });
}));
