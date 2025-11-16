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
    // Allow any HTTPS domain for API images (for production flexibility)
    {
      protocol: 'https',
      hostname: '**',
      pathname: '/api/images/**',
    }
  ],
},

  webpack: (config) => {
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;
