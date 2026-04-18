'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Create a component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const orderId = searchParams.get('order')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Thank you for your purchase</p>
        
        {reference && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">Reference:</p>
            <p className="font-mono text-gray-800">{reference}</p>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          Your order has been confirmed. You'll receive an email with the details shortly.
        </p>
        
        <a
          href="/"
          className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}