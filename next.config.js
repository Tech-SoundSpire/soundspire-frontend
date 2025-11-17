/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure environment variables are available at build time
  env: {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '2.img-dpreview.com',
        pathname: '/files/p/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'app.soundspire.online',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.amplifyapp.com',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'wrapped-images.spotifycdn.com',
        pathname: '**',
      }
    ],
    // Add these configurations for better image handling
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Add this configuration for larger payloads and streaming
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Server external packages for S3
  serverExternalPackages: ['@aws-sdk/client-s3'],

  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;
