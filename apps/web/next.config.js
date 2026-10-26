const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@antiquesupply/shared-schemas'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    // Editorial photography is served locally. Private supplier media uses the
    // authenticated same-origin media endpoint; no arbitrary remote optimizer.
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
};

module.exports = nextConfig;
