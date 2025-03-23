/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ixgkcseieqsayechntmx.supabase.co', 'randomuser.me'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : 'https://editors-hub.netlify.app'
  }
}

module.exports = nextConfig 