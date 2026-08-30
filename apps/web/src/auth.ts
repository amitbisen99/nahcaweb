import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

interface ApiUser {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
}

// Thrown instead of returning null so the login form can show "This account
// has been deactivated" instead of the generic "Invalid email or password" —
// distinct from a wrong-password failure, not a security-sensitive
// distinction to hide. Errors thrown from authorize() propagate through
// signIn() intact (instanceof and all) when signIn is called directly from a
// Server Action, so this is safe to catch specifically in login/actions.ts.
export class AccountDeactivatedError extends CredentialsSignin {
  code = "account_deactivated";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Auth.js only auto-trusts the host on Vercel/Cloudflare or when NODE_ENV
  // isn't "production" — on any other self-hosted server (NODE_ENV=production,
  // no AUTH_URL set) every request is rejected with UntrustedHost unless this
  // is set explicitly. That's what breaks sign-in/session after deployment.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        let res: Response;
        try {
          res = await fetch(`${process.env.API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            // Without this, a hung API request (a slow/cold DB connection,
            // a stalled proxy) leaves the sign-in page spinning forever
            // instead of failing in a way the user can retry.
            signal: AbortSignal.timeout(10_000),
          });
        } catch (err) {
          // A network-level failure here (wrong API_URL, API down, DNS/firewall,
          // a timed-out request) looks identical to a wrong password unless
          // logged distinctly — this is almost always an infra issue, not a
          // user's typo.
          console.error(`NextAuth: could not reach API_URL (${process.env.API_URL}) for /auth/login:`, err);
          return null;
        }

        if (res.status === 403) {
          // Account exists, password is correct, but an admin deactivated
          // it — deserves a clearer message than "wrong password".
          throw new AccountDeactivatedError();
        }

        if (!res.ok) {
          if (res.status !== 401) {
            console.error(`NextAuth: /auth/login returned unexpected status ${res.status}`);
          }
          return null;
        }

        // A 2xx status only means headers arrived — the body can still fail
        // to parse if the connection drops mid-response (a transient blip
        // between this server and the API, seen intermittently in
        // production). An uncaught throw here isn't a next-auth AuthError,
        // so it escapes signIn() and login/actions.ts re-throws it (it must
        // — a real success redirect looks the same to that catch block),
        // which then renders as a full "Something went wrong" error page
        // instead of a retry-able "Invalid email or password". Treat it the
        // same as any other infra hiccup above: log distinctly, fail closed.
        let data: { token: string; user: ApiUser };
        try {
          data = await res.json();
          if (!data?.token || !data?.user?.id) {
            throw new Error("Response body missing token/user");
          }
        } catch (err) {
          console.error("NextAuth: /auth/login returned a 2xx response with an unusable body:", err);
          return null;
        }

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
