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

};

export default nextConfig;
