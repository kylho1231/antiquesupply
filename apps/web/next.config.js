/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@antiquesupply/shared-schemas'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
