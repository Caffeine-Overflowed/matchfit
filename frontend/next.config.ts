import type { NextConfig } from "next";

// In production /cdn/* is proxied to MinIO by the ingress; in dev we rewrite
// it here so `next dev` can load images from local MinIO at :9000.
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
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

// preview live test 1784278675
