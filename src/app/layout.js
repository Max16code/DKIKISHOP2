import Head from "next/head";
import "./globals.css";
import { CartProvider } from '@/context/Cartcontext'
import Image from "next/image";
import PageWrapper from '@/components/PageWrapper'
import Link from "next/link";

export const metadata = {
  title: "Dkikishop",
  description: "Trendy on a budget",
  icons: {
    icon: '/kikishop.png',  // Path to your file in /public

  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Sans&display=swap"
          rel="stylesheet"
        />

        {/* FIX: Viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />

        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <body style={{ fontFamily: 'Geist Sans, sans-serif' }} className="antialiased">
        <CartProvider>
          {/* Fixed background logo */}
          <div className="fixed inset-0 -z-10 opacity-10 pointer-events-none">
            <Image
              src="/images/kikiLogo.jpg"
              alt="Background Logo"
              fill
              className="object-contain object-center"
              priority
            />
          </div>

          

          <PageWrapper>
            {children}
          </PageWrapper>
        </CartProvider>
      </body>
    </html>
  );
}