import { CartProvider } from '@/context/Cartcontext'
import './globals.css'

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
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
