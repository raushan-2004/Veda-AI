import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile monorepo packages
  transpilePackages: ['@veda-ai/ui', '@veda-ai/types'],

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
