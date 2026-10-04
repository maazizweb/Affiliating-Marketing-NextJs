import type { NextConfig } from "next";

// Product images are served from the WordPress media library.
const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
const storeHost = storeUrl ? new URL(storeUrl) : null;

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: storeHost
      ? [{ protocol: storeHost.protocol === "http:" ? "http" : "https", hostname: storeHost.hostname, port: storeHost.port }]
      : [],
  },
};

export default nextConfig;
