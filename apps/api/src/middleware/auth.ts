import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { ADMIN_PERMISSION_KEYS, AdminPermission, parsePermissions } from "../lib/adminPermissions";

export interface AuthPayload {
  userId: number;
  role: "admin" | "member";
}

// Loaded fresh from the database on every admin request (not read from the
// JWT) so that deleting an admin, deactivating them, or changing their
// permissions takes effect immediately instead of when their token expires.
export interface AdminContext {
  id: number;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
      admin?: AdminContext;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function loadAdmin(req: Request): Promise<AdminContext | null> {
  if (req.auth?.role !== "admin") return null;

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, isSuperAdmin: true, adminPermissions: true },
  });
  if (!user || user.role !== "admin" || !user.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    permissions: user.isSuperAdmin ? [...ADMIN_PERMISSION_KEYS] : parsePermissions(user.adminPermissions),
  };
}

// Any admin, whatever they've been granted — for pages every admin may use
// (the dashboard, the shared image upload).
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await loadAdmin(req);
    if (!admin) return res.status(403).json({ error: "Admin access required" });
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

// An admin who has been granted this area (super admins have every area).
export function requirePermission(permission: AdminPermission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await loadAdmin(req);
      if (!admin) return res.status(403).json({ error: "Admin access required" });
      if (!admin.permissions.includes(permission)) {
        return res.status(403).json({ error: "You don't have permission to use this part of the admin panel." });
      }
      req.admin = admin;
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Managing other admins and reading the Activity Log.
export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await loadAdmin(req);
    if (!admin) return res.status(403).json({ error: "Admin access required" });
    if (!admin.isSuperAdmin) return res.status(403).json({ error: "Only a super admin can do this." });
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

// Parses a bearer token if present, but never rejects the request — used on
// public read routes that show extra data (e.g. drafts) to admins.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.auth = jwt.verify(header.slice("Bearer ".length), process.env.JWT_SECRET as string) as AuthPayload;
    } catch {
      // Invalid/expired token on a public route — treat as anonymous rather than failing.
    }
  }
  next();
}
