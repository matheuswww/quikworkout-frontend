/** @type {import('next').NextConfig} */
const nextConfig = {
 images: {
  remotePatterns: [
   {
    protocol: 'http',
    hostname: 'localhost',
    port: '8081',
    pathname: '/images/**',
   },
   {
    protocol: 'https',
    hostname: 'sandbox.api.pagseguro.com',
    pathname: '/qrcode/**',
   },
   {
    protocol: 'https',
    hostname: 'backend.quikworkout.com.br',
    port: '8081',
    pathname: '/images/**',
   },
  ],
 },
};
module.exports = nextConfig;
