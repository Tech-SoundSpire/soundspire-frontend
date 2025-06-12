/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
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
  ],
},

};

module.exports = nextConfig;
