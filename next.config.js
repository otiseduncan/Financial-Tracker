const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: '**.vercel.app' },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
}

// Only load PWA config in production to avoid dev issues
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA(nextConfig)
