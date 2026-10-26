import { prisma } from "../prisma";
import { formatProfileAddress } from "./memberProfile";

// The "All Users" admin page: everyone who isn't an admin, in one list —
// people with a membership, free "general" accounts, and people who only
// signed up for the newsletter (who have no account at all). The list and the
// Excel export both go through buildAllUsers so they always agree.

export type UserKind = "member" | "general" | "newsletter";

export interface AllUserRow {
  key: string;
  kind: UserKind;
  name: string | null;
  email: string;
  // Raw MembershipType, plus a display label, of the membership that best
  // represents this person (see pickMembership) — null unless a member.
  tier: string | null;
  tierLabel: string | null;
  status: string | null;
  membershipId: number | null;
  // Whether this email is on the newsletter list, whatever kind of user.
  newsletter: boolean;
  phone: string | null;
  address: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AllUsersFilters {
  search: string;
  kind: UserKind | "";
  tier: string;
  status: string;
  newsletter: "yes" | "no" | "";
  from: string;
  to: string;
}

const KINDS = ["member", "general", "newsletter"];
const TIERS = ["regular", "student", "institutional", "conference"];
const STATUSES = ["active", "pending", "expired"];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Reads filters off the query string, ignoring anything that isn't a known value.
export function parseAllUsersFilters(query: Record<string, unknown>): AllUsersFilters {
  const type = str(query.type);
  const tier = str(query.tier);
  const status = str(query.status);
  const newsletter = str(query.newsletter);
  return {
    search: str(query.search),
    kind: KINDS.includes(type) ? (type as UserKind) : "",
    tier: TIERS.includes(tier) ? tier : "",
    status: STATUSES.includes(status) ? status : "",
    newsletter: newsletter === "yes" || newsletter === "no" ? newsletter : "",
    from: str(query.from),
    to: str(query.to),
  };
}

const TIER_LABELS: Record<string, string> = {
  regular: "Regular",
  student: "Student",
  institutional: "Institutional",
  conference: "Conference",
};

function tierLabel(m: { type: string; groupId: string | null }): string {
  if (m.type === "institutional") return m.groupId === null ? "Institutional (Sponsor)" : "Institutional (Sponsored)";
  return TIER_LABELS[m.type] ?? m.type;
}

const STATUS_RANK: Record<string, number> = { active: 0, pending: 1, expired: 2 };

// Someone can hold several memberships over time (renewals). Show the one
// that matters most: a live one if there is one, otherwise the newest.
function pickMembership<T extends { status: string; createdAt: Date }>(memberships: T[]): T | null {
  return (
    [...memberships].sort(
      (a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || b.createdAt.getTime() - a.createdAt.getTime()
    )[0] ?? null
  );
}

// Loads everyone and filters in memory rather than in SQL: the two sources
// (accounts and newsletter signups) live in different tables, and at this
// organization's size merging them here is simpler than a UNION query and
// still instant. If the lists ever reach hundreds of thousands, move this
// into SQL.
export async function buildAllUsers(filters: AllUsersFilters): Promise<AllUserRow[]> {
  const [users, subscribers] = await Promise.all([
    prisma.user.findMany({
      where: { role: "member" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            mailingAddress: true,
            addressStreet: true,
            addressState: true,
            addressPostalCode: true,
            addressCountry: true,
          },
        },
        memberships: { select: { id: true, type: true, status: true, groupId: true, createdAt: true } },
      },
    }),
    prisma.newsletterSubscriber.findMany({ select: { email: true, createdAt: true } }),
  ]);

  const subscribed = new Set(subscribers.map((s) => s.email.toLowerCase()));
  const accountEmails = new Set(users.map((u) => u.email.toLowerCase()));

  const rows: AllUserRow[] = [
    ...users.map((u): AllUserRow => {
      const membership = pickMembership(u.memberships);
      return {
        key: `user-${u.id}`,
        kind: membership ? "member" : "general",
        name: u.name,
        email: u.email,
        tier: membership?.type ?? null,
        tierLabel: membership ? tierLabel(membership) : null,
        status: membership?.status ?? null,
        membershipId: membership?.id ?? null,
        newsletter: subscribed.has(u.email.toLowerCase()),
        phone: u.profile?.phone ?? null,
        address: u.profile ? formatProfileAddress(u.profile) : "",
        isActive: u.isActive,
        createdAt: u.createdAt,
      };
    }),
    // Newsletter signups with no account — anyone who also has one is already
    // in the list above, flagged `newsletter: true`.
    ...subscribers
      .filter((s) => !accountEmails.has(s.email.toLowerCase()))
      .map(
        (s, i): AllUserRow => ({
          key: `newsletter-${i}-${s.email}`,
          kind: "newsletter",
          name: null,
          email: s.email,
          tier: null,
          tierLabel: null,
          status: null,
          membershipId: null,
          newsletter: true,
          phone: null,
          address: "",
          isActive: true,
          createdAt: s.createdAt,
        })
      ),
  ];

  const search = filters.search.toLowerCase();
  const from = filters.from ? new Date(filters.from) : null;
  const to = filters.to ? new Date(filters.to) : null;
  // Inclusive of the whole "to" day, not just midnight.
  if (to) to.setHours(23, 59, 59, 999);

  return rows
    .filter((r) => {
      if (search && !`${r.name ?? ""} ${r.email}`.toLowerCase().includes(search)) return false;
      if (filters.kind && r.kind !== filters.kind) return false;
      if (filters.tier && r.tier !== filters.tier) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.newsletter === "yes" && !r.newsletter) return false;
      if (filters.newsletter === "no" && r.newsletter) return false;
      if (from && r.createdAt < from) return false;
      if (to && r.createdAt > to) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
