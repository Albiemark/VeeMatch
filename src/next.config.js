/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Helpful for debugging production builds on Vercel
  // This ensures error details are displayed in production
  productionBrowserSourceMaps: true,

  // Add custom headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Configure routing redirects for better user experience
  async redirects() {
    return [
      // Ensure any root access redirects to home page properly
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
      // Ensure middleware removal doesn't break auth redirects
      {
        source: '/dashboard',
        has: [
          {
            type: 'cookie',
            key: '__session',
            value: undefined,
          },
        ],
        destination: '/login',
        permanent: false,
      },
    ];
  },
  
  // Add trailing slashes for consistent URLs
  trailingSlash: false,
  
  // Increase build output details for debugging
  output: 'standalone',
};

module.exports = nextConfig;
