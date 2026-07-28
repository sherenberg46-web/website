/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Встроенный оптимизатор отключён: он гонял каждую обложку через sharp,
    // а тот держит крупные буферы в памяти. Память — 96 % счёта Railway
    // ($8.03 из $8.35 за полмесяца, CPU при этом стоил 6 центов), и на
    // каталоге в сорок тысяч обложек оптимизатор был основным едоком.
    //
    // Вместо него — lib/image-loader.ts: просит у CDN PlayStation готовое
    // превью нужной ширины через ?w=. Размеры и srcset продолжают работать,
    // но sharp не загружается вовсе.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // Кэш оптимизированных картинок — сутки (меньше повторной работы оптимизатора)
    minimumCacheTTL: 86400,
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
