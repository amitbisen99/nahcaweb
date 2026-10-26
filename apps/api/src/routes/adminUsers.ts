import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { ADMIN_PERMISSION_KEYS, parsePermissions } from "../lib/adminPermissions";

export const adminUsersRouter = Router();

const adminSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  isSuperAdmin: true,
  adminPermissions: true,
  createdAt: true,
} as const;

function toAdminUser(u: Prisma.UserGetPayload<{ select: typeof adminSelect }>) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    isActive: u.isActive,
    isSuperAdmin: u.isSuperAdmin,
    permissions: u.isSuperAdmin ? [...ADMIN_PERMISSION_KEYS] : parsePermissions(u.adminPermissions),
    createdAt: u.createdAt,
  };
}

// Whether, after changing `userId`, at least one *other* active super admin
// is left — the panel must never end up with nobody able to manage admins.
async function hasAnotherSuperAdmin(userId: number): Promise<boolean> {
  const count = await prisma.user.count({
    where: { role: "admin", isSuperAdmin: true, isActive: true, id: { not: userId } },
  });
  return count > 0;
}

// The signed-in admin's own access, for the sidebar and page guards.
adminUsersRouter.get(
  "/me",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ admin: req.admin });
  })
);

adminUsersRouter.get(
  "/",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { role: "admin" },
      select: adminSelect,
      orderBy: [{ isSuperAdmin: "desc" }, { createdAt: "asc" }],
    });
    res.json({ admins: users.map(toAdminUser) });
  })
);

const permissionsSchema = z.array(z.enum(ADMIN_PERMISSION_KEYS));

const createAdminSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  permissions: permissionsSchema.default([]),
});

adminUsersRouter.post(
  "/",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const parsed = createAdminSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { name, email, password, permissions } = parsed.data;

    if (await prisma.user.findUnique({ where: { email } })) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
        isSuperAdmin: false,
        adminPermissions: permissions,
      },
      select: adminSelect,
    });

    res.status(201).json({ admin: toAdminUser(user) });
  })
);

const updateAdminSchema = z.object({
  name: z.string().trim().min(1).optional(),
  permissions: permissionsSchema.optional(),
  isActive: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
});

adminUsersRouter.patch(
  "/:id",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = updateAdminSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { name, permissions, isActive, isSuperAdmin } = parsed.data;

    const target = await prisma.user.findUnique({ where: { id }, select: { ...adminSelect, role: true } });
    if (!target || target.role !== "admin") return res.status(404).json({ error: "Admin user not found" });

    const isSelf = id === req.admin!.id;
    const losesSuperAdmin = target.isSuperAdmin && (isSuperAdmin === false || isActive === false);

    if (isSelf && isActive === false) {
      return res.status(400).json({ error: "You can't deactivate your own account." });
    }
    if (losesSuperAdmin && !(await hasAnotherSuperAdmin(id))) {
      return res.status(400).json({ error: "There must always be at least one active super admin." });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(permissions !== undefined ? { adminPermissions: permissions } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isSuperAdmin !== undefined ? { isSuperAdmin } : {}),
      },
      select: adminSelect,
    });

    res.json({ admin: toAdminUser(updated) });
  })
);

// Sets a new password chosen by the super admin, who passes it on to the
// admin themselves — no email is sent.
adminUsersRouter.post(
  "/:id/reset-password",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = z.object({ password: z.string().min(8, "Password must be at least 8 characters.") }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid password" });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target || target.role !== "admin") return res.status(404).json({ error: "Admin user not found" });

    await prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
    });
    // Any reset link emailed to them earlier shouldn't be able to undo this.
    await prisma.passwordResetToken.deleteMany({ where: { userId: id } });

    res.json({ ok: true });
  })
);

adminUsersRouter.delete(
  "/:id",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    if (id === req.admin!.id) return res.status(400).json({ error: "You can't delete your own account." });

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isSuperAdmin: true } });
    if (!target || target.role !== "admin") return res.status(404).json({ error: "Admin user not found" });

    if (target.isSuperAdmin && !(await hasAnotherSuperAdmin(id))) {
      return res.status(400).json({ error: "There must always be at least one active super admin." });
    }

    try {
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } }),
      ]);
    } catch (err) {
      // Orders, payments, forum posts etc. point at the account — deleting it
      // would orphan them, so the database refuses.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        return res.status(409).json({
          error:
            "This account has activity tied to it (such as forum posts, orders or payments), so it can't be deleted. Deactivate it instead to block their login.",
        });
      }
      throw err;
    }

    res.status(204).end();
  })
);
