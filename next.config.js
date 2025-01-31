/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['ixgkcseieqsayechntmx.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ixgkcseieqsayechntmx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : 'https://editors-hub.netlify.app'
  }
}

module.exports = nextConfig 