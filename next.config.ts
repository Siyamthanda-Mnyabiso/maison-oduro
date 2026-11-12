import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Media uploaded from /admin lives in the Supabase Storage bucket.
    remotePatterns: [
      { protocol: "https", hostname: "voyrerlmmtobyhdonkvq.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
