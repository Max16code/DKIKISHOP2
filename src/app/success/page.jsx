'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navbar from '@/components/Navbar'

function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${reference}`)
        const data = await res.json()
        if (data.success) {
          setOrder(data.data)
        }
      } catch (err) {
        console.error('❌ Error loading order:', err)
      } finally {
        setLoading(false)
      }
    }

    if (reference) fetchOrder()
  }, [reference])

  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      {loading ? (
        <p className="text-gray-400">Fetching your order...</p>
      ) : order ? (
        <>
          <h1 className="text-3xl font-semibold text-green-400">✅ Payment Successful</h1>
          <p className="text-sm text-gray-400">Thank you for your purchase!</p>

          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 shadow-md text-left">
            <p className="text-sm">
              <span className="font-medium text-white">Shop ID:</span>{' '}
              <span className="text-yellow-400 font-mono">{order.shopId}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Reference:</span>{' '}
              <span className="text-gray-400">{order.reference}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Amount:</span>{' '}
              <span className="text-green-300">₦{Number(order.totalAmount).toLocaleString()}</span>
            </p>

            <div className="mt-4">
              <p className="text-white font-medium mb-1">Items:</p>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.title} — {item.size} — ₦{item.price} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 italic">
            Your order will be processed shortly. We appreciate your trust in DKIKISHOP.
          </p>
        </>
      ) : (
        <p className="text-red-400">No order found for this reference.</p>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 pt-24">
      <Navbar />
      <Suspense fallback={<div className="text-center text-gray-400">Loading success details...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
