/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig 