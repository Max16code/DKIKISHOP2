'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/Cartcontext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function CheckoutPage() {
  const { cartItems, getTotal, clearCart } = useCart()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  // ✅ Load Paystack script once
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  // ✅ Verify payment, save order, and trigger email
  const verifyAndSaveOrder = async (reference) => {
    try {
      const res = await fetch('/api/verifyPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          name,
          address,
          email,
          cartItems,
          totalAmount: getTotal(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        // 🔑 Trigger email notifications (admin + customer)
        await fetch('/api/sendMail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            address,
            email,
            cartItems,
            totalAmount: getTotal(),
          }),
        })

        clearCart()
        router.push('/success/page')
      } else {
        alert('⚠️ Payment was successful but order not saved.')
      }
    } catch (error) {
      console.error('Verification failed:', error)
      alert('⚠️ Something went wrong during verification.')
    }
  }

  // ✅ Trigger Paystack payment
  const handlePayment = () => {
    if (!name || !address || !email || !email.includes('@')) {
      alert('Please enter your name, address, and a valid email')
      return
    }

    if (typeof window === 'undefined' || !window.PaystackPop) {
      alert('Paystack SDK not loaded')
      return
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_live_236709ee538755e5ff702b540108b0d2ecbd290e', // 🔑 Replace with your Paystack public key
      email,
      amount: getTotal() * 100, // in Kobo
      currency: 'NGN',
      ref: `${Date.now()}`,
      metadata: {
        cart: cartItems,
        name,
        address,
      },
      callback: (response) => verifyAndSaveOrder(response.reference),
      onClose: () => alert('❌ Transaction was cancelled.'),
    })

    handler.openIframe()
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-black">
      <Navbar />
      <h1 className="text-3xl font-bold text-yellow-500 mb-6 text-center">Checkout</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">No items in cart.</p>
      ) : (
        <div className="max-w-3xl mx-auto">
          <ul className="divide-y">
            {cartItems.map((item, index) => (
              <li key={index} className="flex items-center py-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <p className="text-green-600 font-bold">
                    ₦{Number(item.price).toLocaleString()} x {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-right mt-6">
            <p className="text-lg font-bold mb-3">
              Total: ₦{Number(getTotal()).toLocaleString()}
            </p>

            <label className="block mb-2 text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="border rounded px-4 py-2 w-full mb-4"
            />

            <label className="block mb-2 text-sm font-medium">Delivery Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State"
              className="border rounded px-4 py-2 w-full mb-4"
            />

            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border rounded px-4 py-2 w-full mb-4"
            />

            <button
              onClick={handlePayment}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg"
            >
              Pay with Paystack
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
