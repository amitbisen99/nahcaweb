import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Matches apps/api's own multer upload limit (10MB) — content forms
      // (event/board photos, newsletter PDFs, etc.) submit as Server Actions,
      // and Next.js's 1MB default was rejecting normal-sized images.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
