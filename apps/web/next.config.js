/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,

  transpilePackages: ['@signbridge/ui', '@signbridge/types', '@signbridge/config'],

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
