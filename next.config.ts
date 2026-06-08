import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apps Script endpoint lives on a different origin — allow server-side fetch
  // No client-side env vars needed; URL is kept server-side only
};

export default nextConfig;
