import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/homePage",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
