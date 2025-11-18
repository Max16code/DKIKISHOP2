'use client'

import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamically load PaystackButton without SSR
const PaystackButton = dynamic(
  () => import('react-paystack').then(mod => mod.PaystackButton),
  { ssr: false }
)

export default function CartPage() {
  const { cartItems, clearCart, removeFromCart } = useCart()

  // Buyer contact details
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  // --- STATES ---
  const [selectedCourier, setSelectedCourier] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [eta, setEta] = useState('')

  // --- DELIVERY CONFIG (Scalable Model) ---
  const deliveryConfig = {
    GIG: {
      eta: 'GIG delivers in 2–5 days',
      rates: {
        Lagos: 5500,
        Abuja: 5500,
        adamawa: 6500,
        bauchi: 6500,
        damaturu: 6500,
        gombe: 6500,
        jigawa: 6500,
        jos: 6500,
        kaduna: 6500,
        kano: 6500,
        kastina: 6500, 
        kebbi: 6500,
        lafia: 6500,
        lokoja: 6500,
        maduguri: 6500,
        makurdi: 6500,
        minna: 6500, 
        sokoto: 6500,
        taraba: 6500,
        zamfara: 6500,
        zaria: 6500,
        aba: 4600,
        awka: 4600,
        enugu: 4600,
        nnewi: 4600,
        onitsha: 4600,
        owerri: 4600,
        umuahia: 4600,
        abakaliki: 4600,
        asaba: 4600,
        auchi: 4600,
        bayelsa: 4600,
        benin: 4600,
        calabar: 4600,
        ughelli: 4600,
        eket: 4600,
        uyo: 4600,
        warri: 4600,
        yenagoa: 4600,
        abeokuta: 5500,
        adoekiti: 5500,
        akure: 5500,
        ibadan: 5500,
        ileife: 5500,
        ilorin: 5500,
        ogbomosho: 5500,
        ondotown: 5500,
        osogbo: 5500,
        // 'Northern States': 6500
        // 'South South': 4600,
        // 'South East': 4600,

      },
    },
    GUO: {
      eta: 'GUO delivers in 2–5 days',
      rates: {
        Lagos: 3500,
        Abuja: 3500,
        // 'Northern States': 4500,
        // 'South East': 3500,
        Uyo: 3500,
        Benin: 3500,
        Asaba: 3500,
        jalingo: 4500,
        jos: 4500,
        kano: 4500,
        zaria: 4500,
        kaduna: 4500,
        bauchi: 4500,
        yola: 4500,
        umuaka: 3500,
        owerri: 3500,
        orlu: 3500,
        akokwa: 3500,
        enugu: 3500,
        afikpo: 3500,
        abakaliki: 3500,
        umunze: 3500,
        onitsha: 3500,
        nnewi: 3500,
        ihiala: 3500,
        ekwulobia: 3500,
        awka: 3500,
        umuahia: 3500,
        aba: 3500,
      },
    },
    Portharcourt: {
      eta: 'delivery in 1–3 days',
      rates: {
        PortHarcourt: 2500,
        
      },
    },
  }

  // --- EVENT HANDLERS ---
  const handleCourierSelect = (courier) => {
    if (courier === selectedCourier) return
    setSelectedCourier(courier)
    setSelectedLocation('')
    setDeliveryFee(0)
    setEta('')
  }

  const handleLocationChange = (e) => {
    const location = e.target.value
    setSelectedLocation(location)

    if (selectedCourier && deliveryConfig[selectedCourier]) {
      const courierData = deliveryConfig[selectedCourier]
      const fee = courierData.rates[location] ?? 0
      setDeliveryFee(fee)
      setEta(fee > 0 ? courierData.eta : '')
    } else {
      setDeliveryFee(0)
      setEta('')
    }
  }

  // --- SYNC FEE + ETA ---
  useEffect(() => {
    if (selectedCourier && selectedLocation) {
      const fee = deliveryConfig[selectedCourier]?.rates?.[selectedLocation] ?? 0
      setDeliveryFee(fee)
      setEta(deliveryConfig[selectedCourier]?.eta ?? '')
    } else {
      setDeliveryFee(0)
      setEta('')
    }
  }, [selectedCourier, selectedLocation])

  // --- CART TOTALS ---
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const grandTotal = subtotal + deliveryFee

  // --- FORM VALIDATION ---
  const isFormValid =
    contact.name.trim() !== '' &&
    contact.email.includes('@') &&
    contact.phone.trim() !== '' &&
    contact.address.trim() !== '' &&
    selectedCourier !== '' &&
    selectedLocation !== ''

  // --- PAYSTACK CONFIG ---
  const paystackConfig = {
    email: contact.email || 'customer@example.com',
    amount: grandTotal * 100,
    publicKey: 'pk_live_236709ee538755e5ff702b540108b0d2ecbd290e',
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name', value: contact.name },
        { display_name: 'Phone Number', value: contact.phone },
        { display_name: 'Delivery Address', value: contact.address },
        { display_name: 'Courier', value: selectedCourier },
        { display_name: 'Location', value: selectedLocation },
        { display_name: 'Delivery Fee', value: `₦${deliveryFee}` },
        { display_name: 'ETA', value: eta },
        ...cartItems.map((item, i) => ({
          display_name: item.title,
          variable_name: `item_${i}`,
          value: `₦${item.price} ×${item.quantity}`,
        })),
      ],
    },
    onSuccess: async (ref) => {
      alert(`Payment successful! Reference: ${ref.reference}`)
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...contact,
            items: cartItems,
            subtotal,
            deliveryFee,
            courier: selectedCourier,
            location: selectedLocation,
            eta,
            total: grandTotal,
            paymentRef: ref.reference,
          }),
        })
        await fetch('/api/sendMail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: contact.email,
            name: contact.name,
            address: contact.address,
            cartItems,
            subtotal,
            deliveryFee,
            courier: selectedCourier,
            location: selectedLocation,
            eta,
            totalAmount: grandTotal,
          }),
        })
      } catch (err) {
        console.error('Order save/email failed:', err)
      }
      clearCart()
    },
    onClose: () => alert('Payment window closed'),
  }

  // --- JSX ---
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fafafa] to-[#e9e9e9] overflow-hidden">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-6 text-center text-zinc-800"
        >
          Your Cart
        </motion.h2>

        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-sm rounded-2xl p-6 text-center text-gray-500"
            >
              Your cart is empty.
            </motion.div>
          ) : (
            <>
              {/* Cart items */}
              <div className="space-y-6">
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item._id ?? `${idx}-${item.title}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, delay: idx * 0.03 }}
                    className="flex gap-4 items-center bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200 ease-in-out"
                  >
                    <Image
                        src={item.image.startsWith('/') ? item.image : `/${item.image}`}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-800">{item.title}</h3>
                      <p className="text-sm text-green-700">₦{item.price.toLocaleString()}</p>
                      <p className="text-sm text-zinc-500">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <button
                        onClick={() => removeFromCart(item._id, item.size)}
                        className="mt-2 text-sm text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Subtotal */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-zinc-100/70 border border-green-200 rounded-2xl p-4 shadow-md text-right text-xl font-bold text-zinc-800"
                >
                  Subtotal: ₦{subtotal.toLocaleString()}
                </motion.div>

                {/* Courier cards */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(deliveryConfig).map(([courierKey, courierData]) => {
                    const ratesForThis = courierData.rates
                    const isSelected = selectedCourier === courierKey

                    return (
                      <motion.div
                        key={courierKey}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => handleCourierSelect(courierKey)}
                        className={`cursor-pointer rounded-2xl p-4 backdrop-blur-xl border transition-all ${
                          isSelected
                            ? 'bg-green-600/90 text-white shadow-lg border-transparent'
                            : 'bg-white/40 border-white/50 text-zinc-800 hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                              <span className="font-bold">{courierKey}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-lg">{courierKey}</div>
                              <div className="text-sm opacity-80">{courierData.eta}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {isSelected ? 'Selected' : 'Choose'}
                          </div>
                        </div>

                        {/* Expandable rates */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              key={`${courierKey}-expand`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 overflow-hidden"
                            >
                              {/* Rates list */}
                              <div className="mb-3 space-y-1">
                                {Object.entries(ratesForThis).map(([loc, fee]) => (
                                  <div
                                    key={loc}
                                    className="flex justify-between text-sm py-1 px-2 rounded-md"
                                  >
                                    <span className="text-zinc-700">{loc}</span>
                                    <span className="font-medium">
                                      ₦{fee.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Dropdown */}
                              <label className="block text-sm font-medium mb-2">
                                Select delivery destination
                              </label>
                              <select
                                value={isSelected ? selectedLocation : ''}
                                onChange={handleLocationChange}
                                className="w-full border border-white/50 bg-white/70 backdrop-blur-md rounded-lg text-black p-2 mb-2 focus:ring-2 focus:ring-green-300"
                              >
                                <option value="">-- Choose location --</option>
                                {Object.entries(ratesForThis).map(([loc, fee]) => (
                                  <option key={loc} value={loc}>
                                    {loc} — ₦{fee.toLocaleString()}
                                  </option>
                                ))}
                              </select>

                              {/* Fee + ETA */}
                              {selectedLocation && (
                                <div className="mt-2 text-sm font-medium">
                                  <div className="text-green-700">
                                    Delivery Fee: ₦{deliveryFee.toLocaleString()}
                                  </div>
                                  <div className="text-zinc-200/90 mt-1 italic">{eta}</div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* Grand total summary */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-[0_0_25px_-5px_rgba(34,197,94,0.18)] text-right text-xl font-bold text-zinc-800"
                >
                  <div>Delivery: ₦{deliveryFee.toLocaleString()}</div>
                  <div className="text-green-700 mt-1">
                    Grand Total: ₦{grandTotal.toLocaleString()}
                  </div>
                </motion.div>

                {/* Buyer details */}
                <motion.div
                  className="mt-8 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold mb-4 text-black">Your Details</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={contact.name}
                      onChange={(e) =>
                        setContact((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full border border-white/50 bg-white/60 backdrop-blur-md p-2 rounded-lg text-black focus:ring-2 focus:ring-green-300"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full border border-white/50 bg-white/60 backdrop-blur-md p-2 rounded-lg text-black focus:ring-2 focus:ring-green-300"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={contact.phone}
                      onChange={(e) =>
                        setContact((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full border border-white/50 bg-white/60 backdrop-blur-md p-2 rounded-lg text-black focus:ring-2 focus:ring-green-300"
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Delivery Address"
                      value={contact.address}
                      onChange={(e) =>
                        setContact((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="w-full border border-white/50 bg-white/60 backdrop-blur-md p-2 rounded-lg text-black focus:ring-2 focus:ring-green-300"
                    />
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between items-center mt-8 gap-4"
                >
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 bg-red-500/90 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Clear Cart
                  </button>

                  <PaystackButton
                    className={`px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all ${
                      isFormValid
                        ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    {...paystackConfig}
                    disabled={!isFormValid}
                  >
                    Pay ₦{grandTotal.toLocaleString()} with Paystack
                  </PaystackButton>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
