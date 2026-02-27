/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose your admin password hash to server-side only
  env: {
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  },

  // ✅ Allow Next.js Image component to load images from Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
