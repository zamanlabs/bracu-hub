/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/bracu-hub.github.io' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bracu-hub.github.io/' : '',
  trailingSlash: true,
}

module.exports = nextConfig
