/** @type {import('next').NextConfig} */
const nextConfig = {
     // Expose your admin password hash to server-side only
  env: {
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  },
};

export default nextConfig;

