'use client'

import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

// ---------------- DELIVERY CONFIG ----------------
const deliveryConfig = {
  GIG: {
    eta: 'GIG delivers in 2–5 days',
    rates: {
      Lagos: 5500, Abuja: 5500, adamawa: 6500, bauchi: 6500, damaturu: 6500, gombe: 6500,
      jigawa: 6500, jos: 6500, kaduna: 6500, kano: 6500, kastina: 6500, kebbi: 6500,
      lafia: 6500, lokoja: 6500, maduguri: 6500, makurdi: 6500, minna: 6500, sokoto: 6500,
      taraba: 6500, zamfara: 6500, zaria: 6500, aba: 4600, awka: 4600, enugu: 4600,
      nnewi: 4600, onitsha: 4600, owerri: 4600, umuahia: 4600, abakaliki: 4600, asaba: 4600,
      auchi: 4600, bayelsa: 4600, benin: 4600, calabar: 4600, ughelli: 4600, eket: 4600,
      uyo: 4600, warri: 4600, yenagoa: 4600, abeokuta: 5500, adoekiti: 5500, akure: 5500,
      ibadan: 5500, ileife: 5500, ilorin: 5500, ogbomosho: 5500, ondotown: 5500,
      osogbo: 5500,
    },
  },
  GUO: {
    eta: 'GUO delivers in 2–5 days',
    rates: {
      Lagos: 3500, Abuja: 3500, Uyo: 3500, Benin: 3500, Asaba: 3500, jalingo: 4500,
      jos: 4500, kano: 4500, zaria: 4500, kaduna: 4500, bauchi: 4500, yola: 4500,
      umuaka: 3500, owerri: 3500, orlu: 3500, akokwa: 3500, enugu: 3500, afikpo: 3500,
      abakaliki: 3500, umunze: 3500, onitsha: 3500, nnewi: 3500, ihiala: 3500,
      ekwulobia: 3500, awka: 3500, umuahia: 3500, aba: 3500,
    },
  },
  Portharcourt: {
    eta: 'Delivery in 1–3 days',
    rates: {
      PortHarcourt: 100,
    },
  },
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    town: '',
    service: 'GIG',
    portDeliveryOption: '',
  })
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [eta, setEta] = useState('')
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => setPaystackLoaded(true)
    script.onerror = () => console.error('Paystack failed to load')
    document.body.appendChild(script)
  }, [])

  // Calculate subtotal & grand total
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const grandTotal = subtotal + deliveryFee

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBuyerInfo((prev) => ({ ...prev, [name]: value }))
  }

  // Update delivery fee whenever town/service changes
  useEffect(() => {
    if (!buyerInfo.town || !buyerInfo.service) return setDeliveryFee(0)

    if (buyerInfo.service === 'Portharcourt' && buyerInfo.town === 'PortHarcourt') {
      const fee = buyerInfo.portDeliveryOption === 'delivery' ? 2500 : 0
      setDeliveryFee(fee)
      setEta('Delivery in 1–3 days')
      return
    }

    const service = deliveryConfig[buyerInfo.service]
    const fee = service.rates[buyerInfo.town] || 0
    setDeliveryFee(fee)
    setEta(service.eta)
  }, [buyerInfo.town, buyerInfo.service, buyerInfo.portDeliveryOption])

  // Show review page
  const handleReview = () => {
    const { name, email, phone, address, town, service, portDeliveryOption } = buyerInfo
    if (!cartItems.length) return alert('Cart is empty.')
    if (!name || !email || !phone || !address || !town)
      return alert('Please fill in all delivery details.')
    if (service === 'Portharcourt' && town === 'PortHarcourt' && !portDeliveryOption)
      return alert('Please select pickup or delivery for PortHarcourt.')

    setShowReview(true)
  }

  const handlePaystack = () => {
  const { name, email, phone, address, town, service, portDeliveryOption } = buyerInfo

  // Validation
  if (!cartItems.length) return alert('Cart is empty.')
  if (!name || !email || !phone || !address || !town)
    return alert('Please fill in all delivery details.')

  if (
    service === 'Portharcourt' &&
    town === 'PortHarcourt' &&
    !portDeliveryOption
  ) {
    return alert('Please select pickup or delivery for Port Harcourt.')
  }

  if (!window.PaystackPop) {
    return alert('Paystack not loaded yet')
  }

  const reference = crypto.randomUUID()

  const handler = window.PaystackPop.setup({
  key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  email,
  amount: Number(grandTotal) * 100, // kobo
  currency: 'NGN',
  ref: reference,

  // 🔥 THIS IS THE MISSING LINK
  metadata: {
    buyer: {
      name,
      phone,
      address,
      town,
      service,
      portDeliveryOption,
    },

    cartItems: cartItems.map(item => ({
      _id: item._id,
      qty: item.quantity,
      size: item.size || null,
      price: item.price,
    })),
  },

  onClose: function () {
    alert('Payment was cancelled')
  },

  callback: function (response) {
    console.log('Payment success:', response.reference)

    fetch('/api/orders/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: response.reference,
      }),
    })

    alert('Payment successful!')
    clearCart()
  },
})


  // MUST be directly triggered by button click
  handler.openIframe()
}


  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <h1 className="text-3xl font-bold">Checkout</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-400 text-lg">Your cart is empty.</p>
        ) : !showReview ? (
          <div className="grid md:grid-cols-2 gap-10">
            {/* Cart Items */}
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item._id + item.size} className="flex items-center justify-between bg-white/10 p-4 rounded-xl">
                  <Image src={item.image} alt={item.title} width={100} height={100} className="object-contain rounded" />
                  <div className="flex-1 ml-4">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    {item.size && <p className="text-gray-300">Size: {item.size}</p>}
                    <p className="text-green-400 font-bold">₦{(item.price * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item._id, item.size, Number(e.target.value))}
                        className="w-20 p-1 rounded text-black"
                      />
                      <button onClick={() => removeFromCart(item._id, item.size)} className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-white/20 pt-6">
                <p className="text-xl font-semibold">Subtotal: ₦{subtotal.toLocaleString()}</p>
                <p className="text-xl font-semibold">Delivery Fee: ₦{deliveryFee.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center border-t border-white/20 pt-2">
                <p className="text-2xl font-bold">Grand Total: ₦{grandTotal.toLocaleString()}</p>
              </div>
              {eta && <p className="text-gray-400 italic mt-2">Estimated Delivery: {eta}</p>}
            </div>

            {/* Buyer Info Form */}
            <div className="bg-white/10 p-6 rounded-xl space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Delivery Details</h2>
              <div className="space-y-3">
                <input type="text" name="name" placeholder="Full Name" value={buyerInfo.name} onChange={handleInputChange} className="w-full p-2 rounded text-black" />
                <input type="email" name="email" placeholder="Email" value={buyerInfo.email} onChange={handleInputChange} className="w-full p-2 rounded text-black" />
                <input type="text" name="address" placeholder="Street/House Address" value={buyerInfo.address} onChange={handleInputChange} className="w-full p-2 rounded text-black" />
                <input type="tel" name="phone" placeholder="Phone Number" value={buyerInfo.phone} onChange={handleInputChange} className="w-full p-2 rounded text-black" />

                <p className="text-sm text-yellow-300 italic">Please select your choice of delivery (for customers outside Rivers State)</p>

                <select name="service" value={buyerInfo.service} onChange={handleInputChange} className="w-full p-2 rounded text-black">
                  {Object.keys(deliveryConfig).map((service) => (
                    <option key={service} value={service}>
                      {service === 'Portharcourt' ? 'Portharcourt (for Portharcourt residents only)' : service}
                    </option>
                  ))}
                </select>

                <select name="town" value={buyerInfo.town} onChange={handleInputChange} className="w-full p-2 rounded text-black">
                  <option value="">Select Town</option>
                  {buyerInfo.service &&
                    Object.keys(deliveryConfig[buyerInfo.service].rates).map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}

                </select>

                {buyerInfo.service === 'Portharcourt' && buyerInfo.town === 'PortHarcourt' && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-yellow-300 italic">Choose how you want your order delivered:</p>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="portDeliveryOption" value="delivery" checked={buyerInfo.portDeliveryOption === 'delivery'} onChange={() => setBuyerInfo((prev) => ({ ...prev, portDeliveryOption: 'delivery' }))} />
                        <span>Delivery to your location (₦2,500)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="portDeliveryOption" value="pickup" checked={buyerInfo.portDeliveryOption === 'pickup'} onChange={() => setBuyerInfo((prev) => ({ ...prev, portDeliveryOption: 'pickup' }))} />
                        <span>Pick up from store (₦0)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleReview} className="w-full mt-4 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition">
                Review Order
              </button>
            </div>
          </div>
        ) : (
          // ---------------- ORDER REVIEW ----------------
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Order Review</h2>

            {/* Buyer Info */}
            <div className="bg-white/10 p-4 rounded space-y-2">
              <p><strong>Name:</strong> {buyerInfo.name}</p>
              <p><strong>Email:</strong> {buyerInfo.email}</p>
              <p><strong>Phone:</strong> {buyerInfo.phone}</p>
              <p><strong>Address:</strong> {buyerInfo.address}, {buyerInfo.town}</p>
              <p><strong>Delivery Service:</strong> {buyerInfo.service}</p>
              {buyerInfo.service === 'Portharcourt' && buyerInfo.portDeliveryOption && (
                <p><strong>PortHarcourt Option:</strong> {buyerInfo.portDeliveryOption}</p>
              )}
              <p><strong>Delivery Fee:</strong> ₦{deliveryFee.toLocaleString()}</p>
              <p><strong>Grand Total:</strong> ₦{grandTotal.toLocaleString()}</p>
            </div>

            {/* Cart Items Review */}
            <div className="bg-white/20 p-4 rounded space-y-2 max-h-96 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={'review-' + item._id + item.size} className="flex items-center space-x-3 bg-white/10 p-2 rounded">
                  <Image src={item.image} alt={item.title} width={60} height={60} className="object-contain rounded" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{item.title}</p>
                    {item.size && <p>Size: {item.size}</p>}
                    <p>Qty: {item.quantity}</p>
                    <p>Subtotal: ₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePaystack}
              disabled={isProcessing}
              className="w-full mt-4 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition disabled:opacity-50"
            >
              Pay & Complete Order
            </button>

            <button
              onClick={() => setShowReview(false)}
              className="w-full mt-2 px-6 py-2 bg-gray-500 text-black font-semibold rounded-xl hover:bg-gray-400 transition"
            >
              Edit Details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
