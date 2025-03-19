/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/bracu-hub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bracu-hub/' : '',
}

module.exports = nextConfig
