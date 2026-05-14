// app/thank-you/page.tsx   (or pages/thank-you.tsx)

import Link from 'next/link';  // only if using Next.js — remove if plain React

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 py-12">
        <div className="text-6xl">🎉</div>
        
        <h1 className="text-4xl font-bold text-gray-800">
          Thank You!
        </h1>
        
        <p className="text-xl text-gray-600">
          Your message has been sent successfully. We'll get back to you soon.
        </p>
        
        <p className="text-gray-500">
          In the meantime, feel free to continue shopping at DkikiShop!
        </p>

        <div className="pt-6">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-md"
          >
            Back to Shop
          </Link>
        </div>

        {/* Optional: auto-redirect home after 8 seconds */}
        {/* <meta httpEquiv="refresh" content="8;url=/" /> */}
      </div>
    </div>
  );
}