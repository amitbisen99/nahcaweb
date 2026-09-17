import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // This is a single global ceiling shared by every Server Action in the
      // app — the largest of the various upload limits wins. Content forms
      // (event/board photos, newsletter PDFs) go through apps/api's generic
      // 10MB multer limit; Store product files go through the dedicated
      // 50MB one (see apps/api/src/routes/products.ts) — this just has to
      // clear the bigger of the two, since Next.js's 1MB default rejects
      // anything past that regardless of what the API would accept.
      bodySizeLimit: "50mb",
    },
    // A separate, independent limit from the one above — this is how much
    // of the request body proxy.ts's middleware itself is allowed to see
    // before Next.js truncates it, since every request (including this
    // app's Server Action POSTs) passes through it first. `serverActions
    // .bodySizeLimit` alone doesn't help: even at 50mb, the middleware
    // still silently cut a 50MB file's upload short at the OLD 10MB
    // default here, corrupting it before the action ever saw the rest.
    // (This key was renamed from `middlewareClientMaxBodySize` in this
    // project's Next.js version — see node_modules/next/dist/docs.)
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
