/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/bracu-hub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bracu-hub/' : '',
  trailingSlash: true,
}

module.exports = nextConfig
