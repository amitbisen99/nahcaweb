import { Router } from "express";
import ExcelJS from "exceljs";
import { requireAuth, requirePermission } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { AllUserRow, UserKind, buildAllUsers, parseAllUsersFilters } from "../lib/allUsers";
import { formatDate } from "../lib/formatDate";

export const usersRouter = Router();

const DEFAULT_PAGE_SIZE = 10;

// Every non-admin: members, general (account, no membership) users, and
// newsletter-only signups — searchable and filterable. See lib/allUsers.ts.
usersRouter.get(
  "/all",
  requireAuth,
  requirePermission("all_users"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

    const rows = await buildAllUsers(parseAllUsersFilters(req.query));

    res.json({
      users: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      pageSize,
    });
  })
);

const KIND_LABELS: Record<UserKind, string> = {
  member: "Member",
  general: "General User",
  newsletter: "Newsletter Signup",
};

// The same list as above for whatever filters are on screen, unpaginated.
usersRouter.get(
  "/all/export",
  requireAuth,
  requirePermission("all_users"),
  asyncHandler(async (req, res) => {
    const rows: AllUserRow[] = await buildAllUsers(parseAllUsersFilters(req.query));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("All Users");
    sheet.columns = [
      { header: "Name", key: "name", width: 28 },
      { header: "Email", key: "email", width: 34 },
      { header: "User Type", key: "kind", width: 18 },
      { header: "Membership Tier", key: "tier", width: 24 },
      { header: "Membership Status", key: "status", width: 18 },
      { header: "Newsletter Subscriber", key: "newsletter", width: 20 },
      { header: "Contact Number", key: "phone", width: 18 },
      { header: "Address", key: "address", width: 44 },
      { header: "Joined / Signed Up", key: "joined", width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const r of rows) {
      sheet.addRow({
        name: r.name || "—",
        email: r.email,
        kind: KIND_LABELS[r.kind],
        tier: r.tierLabel ?? "—",
        status: r.status ?? "—",
        newsletter: r.newsletter ? "Yes" : "No",
        phone: r.phone || "—",
        address: r.address || "—",
        joined: formatDate(r.createdAt),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="All-Users.xlsx"`);
    res.send(Buffer.from(buffer));
  })
);
