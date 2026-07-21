import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface ApiUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const res = await fetch(`${process.env.API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) return null;

        const data: { token: string; user: ApiUser } = await res.json();
        return {
          id: String(data.user.id),
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          apiToken: data.token,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "admin" | "member" }).role;
        token.apiToken = (user as { apiToken: string }).apiToken;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "admin" | "member";
      }
      session.apiToken = token.apiToken as string;
      return session;
    },
  },
});
