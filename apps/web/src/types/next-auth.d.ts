import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "member";
      // Whether this account has ever held a Membership at all (any
      // status) — a "general user" (free forum-only account) has none and
      // can't reach the Member Portal; see proxy.ts.
      hasMembership: boolean;
    } & DefaultSession["user"];
    apiToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "member";
    hasMembership?: boolean;
    apiToken?: string;
  }
}
