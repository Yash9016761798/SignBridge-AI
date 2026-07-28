/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Generate standalone output for Docker
  output: 'standalone',

  transpilePackages: ['@signbridge/ui', '@signbridge/types', '@signbridge/config'],

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
