import type { NextConfig } from "next";

const isStaticExport = process.env.DEPLOY_TARGET === 'github-pages';

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  ...(!isStaticExport && {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: '**' },
      ],
    },
  }),
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
