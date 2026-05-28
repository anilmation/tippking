/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://flagcdn.com https://*.supabase.co https://crests.football-data.org",
      "connect-src 'self' https://*.supabase.co https://api.football-data.org",
      "frame-ancestors 'none'",
    ].join('; ')
  },
]

const nextConfig = {
  images: {
    domains: ['flagcdn.com', 'crests.football-data.org'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  // Prevent exposing server info
  poweredByHeader: false,
}

module.exports = nextConfig
