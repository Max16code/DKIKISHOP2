import Head from "next/head";
import "./globals.css";
import { CartProvider } from '@/context/Cartcontext'
import Image from "next/image";
import PageWrapper from '@/components/PageWrapper'

export const metadata = {
  title: "Dkikishop",
  description: "Luxury on a budget",
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

        {/* FIX: This viewport meta tag is REQUIRED for iOS Chrome/Safari to respect mobile widths and Tailwind grid-cols-2 */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" 
        />

        {/* Optional but recommended for iOS/Chrome mobile */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <body style={{ fontFamily: 'Geist Sans, sans-serif' }} className="antialiased">
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

        <CartProvider>
          <PageWrapper>
            {children}
          </PageWrapper>
        </CartProvider>
      </body>
    </html>
  );
}