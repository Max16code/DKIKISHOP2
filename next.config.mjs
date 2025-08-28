/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: "/:path*",
      headers: [{
        key: "Set-Cookie",
        value: `next-auth.session-token; SameSite=Lax; Path=/; ${
          process.env.NODE_ENV === "production" ? "Secure; " : ""
        }HttpOnly`
      }]
    }];
  },
  experimental: {
    serverActions: {}
  },
  serverExternalPackages: ['next-auth']
};

export default nextConfig;  // ES Module export