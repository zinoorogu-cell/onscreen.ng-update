/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'onscreen-ng.s3.amazonaws.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'upload.wikimedia.org',
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig
