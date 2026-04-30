import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Support Web Workers
    config.module.rules.push({
      test: /\.worker\.ts$/,
      use: { loader: 'worker-loader', options: { inline: 'fallback' } },
    });
    // Exclude onnxruntime from server bundle
    if (isServer) {
      config.externals.push('onnxruntime-node');
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
};

export default withPWA(nextConfig);
