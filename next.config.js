/** @type {import('next').NextConfig} */
const nextConfig = {
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
      }
    ],
    // Add these configurations for better image handling
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Add this configuration for larger payloads and streaming
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Increase the maximum payload size for API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },

  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;
