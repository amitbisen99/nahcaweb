import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";

export const reportsRouter = Router();

// TODO(phase 2): Member List Report (filter by type/status), Collections Report
// (Quarter/YTD/custom range over the Payment table), Upcoming Renewals Report
// (Membership.endDate within next 30/60/90 days).

reportsRouter.get("/members", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — see TODO in reports.ts" });
}));

reportsRouter.get("/collections", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — see TODO in reports.ts" });
}));

reportsRouter.get("/renewals", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — see TODO in reports.ts" });
}));
