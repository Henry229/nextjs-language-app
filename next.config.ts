import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_DISABLE_TURBO: 'true', // Turbopack 비활성화
  },
};

export default nextConfig;
