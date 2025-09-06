/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',

            },
        ],
    },

    experimental: {
        appDir: true, // make sure App Router is enabled
    },
    // This makes Next.js look in src/ for app or pages
    srcDir: true,

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