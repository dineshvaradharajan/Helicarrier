import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@helicarrier/core",
    "@helicarrier/db",
    "@helicarrier/shared",
  ],
};

export default nextConfig;
