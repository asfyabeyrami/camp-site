import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.koohnegar.com",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
