import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "member";
    } & DefaultSession["user"];
    apiToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "member";
    apiToken?: string;
  }
}
