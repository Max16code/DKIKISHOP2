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
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Sans&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body style={{ fontFamily: 'Geist Sans, sans-serif' }} className="antialiased">


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
