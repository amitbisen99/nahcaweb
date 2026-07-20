import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth";
import { asyncHandler } from "./asyncHandler";

// Loosely typed on purpose — this wires up any Prisma model delegate
// (prisma.event, prisma.article, ...) without fighting each model's
// distinct generated arg types.
interface ContentDelegate {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

// Shared CRUD pattern for the 6 content types: public GET routes return only
// published items, except to an admin (who sees drafts too, for the admin
// content-management UI). Writes are always admin-only.
export function createContentRouter(opts: {
  delegate: ContentDelegate;
  schema: z.ZodObject<z.ZodRawShape>;
  orderBy?: Record<string, "asc" | "desc">;
}) {
  const { delegate, schema, orderBy } = opts;
  const router = Router();

  router.get(
    "/",
    optionalAuth,
    asyncHandler(async (req, res) => {
      const isAdmin = req.auth?.role === "admin";
      const items = await delegate.findMany({
        where: isAdmin ? undefined : { published: true },
        orderBy,
      });
      res.json({ items });
    })
  );

  router.get(
    "/:id",
    optionalAuth,
    asyncHandler(async (req, res) => {
      const isAdmin = req.auth?.role === "admin";
      const item = await delegate.findUnique({ where: { id: Number(req.params.id) } });
      if (!item || (!isAdmin && !item.published)) {
        return res.status(404).json({ error: "Not found" });
      }
      res.json({ item });
    })
  );

  router.post(
    "/",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      const item = await delegate.create({ data: parsed.data });
      res.status(201).json({ item });
    })
  );

  router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = schema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }
      const item = await delegate.update({
        where: { id: Number(req.params.id) },
        data: parsed.data,
      });
      res.json({ item });
    })
  );

  router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      await delegate.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    })
  );

  return router;
}
