/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost', 'xsgames.co'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    forceSwcTransforms: true
  },
  swcMinify: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  compress: false,
  poweredByHeader: false,
  generateEtags: false,
  distDir: '.next',
  output: 'standalone',
  trailingSlash: false,
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true
}

module.exports = nextConfig