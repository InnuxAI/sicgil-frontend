import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sicgil.com',
        port: '',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'www.innuxai.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
