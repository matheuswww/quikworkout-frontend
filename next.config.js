/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.0.103',
        port: '8080',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'sandbox.api.pagseguro.com',
        pathname: '/qrcode/**',
      },
    ],
  }
}
module.exports = nextConfig
