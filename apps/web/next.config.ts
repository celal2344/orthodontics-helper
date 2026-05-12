import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@orthodontics-helper/api-client",
    "@orthodontics-helper/constants",
    "@orthodontics-helper/i18n",
  ],
};

export default nextConfig;
