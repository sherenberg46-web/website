/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // PlayStation CDN — все поддомены
      {
        protocol: 'https',
        hostname: '**.playstation.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.playstation.com',
        pathname: '/**',
      },
      // Наш API-сервер (статика баннеров)
      {
        protocol: 'https',
        hostname: 'tg-shop-production-1b03.up.railway.app',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
