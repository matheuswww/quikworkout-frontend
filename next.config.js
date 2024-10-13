/** @type {import('next').NextConfig} */
const nextConfig = {
 images: {
  remotePatterns: [
   {
    protocol: 'http',
    hostname: 'localhost',
    port: '8080',
    pathname: '/images/**',
   },
   {
    protocol: 'https',
    hostname: 'sandbox.api.pagseguro.com',
    pathname: '/qrcode/**',
   },
   {
    protocol: 'https',
    hostname: 'api.pagseguro.com',
    pathname: '/qrcode/**',
   },
   {
    protocol: 'https',
    hostname: 'backend.quikworkout.com.br',
    pathname: '/images/**',
   },
  ],
 },
};
module.exports = nextConfig;
