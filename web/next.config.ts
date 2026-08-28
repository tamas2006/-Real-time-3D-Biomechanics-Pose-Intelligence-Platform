import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow mobile network IPs and tunnels
  allowedDevOrigins: [
    "192.168.0.135",
    "192.168.1.246",
    "*.loca.lt",
    "loca.lt",
    "localhost"
  ]
};

export default nextConfig;
