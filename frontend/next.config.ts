import type { NextConfig } from "next";

// In production /cdn/* is proxied to MinIO by the ingress; in dev we rewrite
// it here so `next dev` can load images from local MinIO at :9000.
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone/server.js) so the
  // runtime Docker stage can run `node server.js` without node_modules.
  output: "standalone",
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: "/cdn/:path*",
        destination: "http://localhost:9000/:path*",
      },
    ];
  },
};

export default nextConfig;
