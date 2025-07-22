'use client'

import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import Image from 'next/image'

export default function CartPage() {
  const { cartItems } = useCart()

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="relative min-h-screen bg-[#f9f9f9] overflow-hidden">
      {/* Blurred Kiki Logo background - already included sitewide */}
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold mb-6 text-center text-zinc-800">
          Your Cart
        </h2>

        {cartItems.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md shadow-sm rounded-2xl p-6 text-center text-gray-500 border border-zinc-200">
            Your cart is empty.
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 items-center bg-grey-600/60 backdrop-blur-md border border-zinc-200 shadow-lg rounded-2xl p-4 hover:scale-[1.01] transition-transform duration-200 ease-in-out"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-green-700">₦{item.price}</p>
                  <p className="text-sm text-zinc-500">
                    Size: {item.size} | Qty: {item.quantity}
                  </p>
                </div>
              </div>
            ))}

            <div className="bg-grey-800/60 backdrop-blur-md border border-green-200 rounded-2xl p-4 shadow-md text-right text-xl font-bold text-zinc-800">
              Total: ₦{totalPrice}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
