/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.cdnfonts.com',
        pathname: '/**',
      },
    ],
    // Optimisation des images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 heures
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Compression gzip/brotli
  compress: true,

  // Optimisations de production
  poweredByHeader: false,

  // React strict mode for better development experience
  reactStrictMode: true,

  // Output standalone for Docker/serverless
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,

  // Headers de sécurité et cache
  async headers() {
    return [
      {
        // Cache des assets statiques
        source: '/:path*.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache des fichiers JS/CSS
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache court pour les pages
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Redirections
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimise les imports - tree shaking for large packages
    optimizePackageImports: [
      'lucide-react',
      '@tremor/react',
      'recharts',
      'framer-motion',
      '@react-pdf/renderer',
      'date-fns',
    ],
    // Enable partial prerendering when available
    // ppr: true,
  },

  // Turbopack (faster dev server)
  // turbo: {
  //   rules: {},
  // },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Ignore punycode deprecation warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];

    return config;
  },
};

export default nextConfig;
