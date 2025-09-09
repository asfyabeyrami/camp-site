import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.api.koohnegar.com",
        port: "",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
