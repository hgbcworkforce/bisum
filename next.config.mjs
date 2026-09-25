/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.hgbcinfluencers.org',
      },
    ],
  },
};

export default nextConfig;

