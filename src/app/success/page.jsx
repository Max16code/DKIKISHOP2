'use client'

import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation' // 🔹 Import router

// ✅ Lazy load PaystackButton client-side only
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
)

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, getTotal } = useCart()
  const router = useRouter() // 🔹 Initialize router

  const total = getTotal()
  const email = 'customer@example.com' // 🔸 Replace with real user email if available
  const publicKey = 'pk_test_xxx' // 🔸 Replace with your actual Paystack public key

  const paystackProps = {
    email,
    amount: total * 100, // Convert to kobo
    publicKey,
    text: 'Pay Now',
    onSuccess: () => {
      clearCart()
      router.push('/success/page') // 🔹 Redirect after payment
    },
    onClose: () => alert('❌ Payment cancelled'),
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-6">
              {cartItems.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row items-center border-b pb-4 gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-28 h-28 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-green-700 font-medium">
                      ₦{Number(item.price).toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id, item.size)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Total + Actions */}
            <div className="mt-10 space-y-4 text-right">
              <p className="text-xl font-semibold">
                Total: ₦{Number(total).toLocaleString()}
              </p>

              <button
                onClick={clearCart}
                className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
              >
                Clear Cart
              </button>

              <div className="mt-2">
                <PaystackButton
                  {...paystackProps}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded shadow-md transition"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
