'use client'

// import { useCart } from '@/context/Cartcontext'
// import Navbar from '@/components/Navbar'
// import Image from 'next/image'
// import dynamic from 'next/dynamic'
// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'

// // Dynamically load PaystackButton without SSR
// const PaystackButton = dynamic(
//   () => import('react-paystack').then(mod => mod.PaystackButton),
//   { ssr: false }
// )

// export default function CartPage() {
//   const { cartItems, clearCart, removeFromCart } = useCart()

//   // Buyer contact details
//   const [contact, setContact] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//   })

//   const [selectedCourier, setSelectedCourier] = useState('')
//   const [selectedLocation, setSelectedLocation] = useState('')
//   const [deliveryFee, setDeliveryFee] = useState(0)
//   const [eta, setEta] = useState('')

//   const deliveryConfig = {
//     GIG: {
//       eta: 'GIG delivers in 2–5 days',
//       rates: {
//         Lagos: 5500, Abuja: 5500, adamawa: 6500, bauchi: 6500, damaturu: 6500,
//         gombe: 6500, jigawa: 6500, jos: 6500, kaduna: 6500, kano: 6500,
//         kastina: 6500, kebbi: 6500, lafia: 6500, lokoja: 6500, maduguri: 6500,
//         makurdi: 6500, minna: 6500, sokoto: 6500, taraba: 6500, zamfara: 6500,
//         zaria: 6500, aba: 4600, awka: 4600, enugu: 4600, nnewi: 4600,
//         onitsha: 4600, owerri: 4600, umuahia: 4600, abakaliki: 4600, asaba: 4600,
//         auchi: 4600, bayelsa: 4600, benin: 4600, calabar: 4600, ughelli: 4600,
//         eket: 4600, uyo: 4600, warri: 4600, yenagoa: 4600, abeokuta: 5500,
//         adoekiti: 5500, akure: 5500, ibadan: 5500, ileife: 5500, ilorin: 5500,
//         ogbomosho: 5500, ondotown: 5500, osogbo: 5500,
//       },
//     },
//     GUO: {
//       eta: 'GUO delivers in 2–5 days',
//       rates: {
//         Lagos: 3500, Abuja: 3500, Uyo: 3500, Benin: 3500, Asaba: 3500,
//         jalingo: 4500, jos: 4500, kano: 4500, zaria: 4500, kaduna: 4500,
//         bauchi: 4500, yola: 4500, umuaka: 3500, owerri: 3500, orlu: 3500,
//         akokwa: 3500, enugu: 3500, afikpo: 3500, abakaliki: 3500, umunze: 3500,
//         onitsha: 3500, nnewi: 3500, ihiala: 3500, ekwulobia: 3500, awka: 3500,
//         umuahia: 3500, aba: 3500,
//       },
//     },
//     Portharcourt: {
//       eta: 'delivery in 1–3 days',
//       rates: { PortHarcourt: 100 },
//     },
//   }

//   // --- Event handlers
//   const handleCourierSelect = (courier) => {
//     if (courier === selectedCourier) return
//     setSelectedCourier(courier)
//     setSelectedLocation('')
//     setDeliveryFee(0)
//     setEta('')
//   }

//   const handleLocationChange = (e) => {
//     const location = e.target.value
//     setSelectedLocation(location)

//     const fee = deliveryConfig[selectedCourier]?.rates?.[location] ?? 0
//     setDeliveryFee(fee)
//     setEta(fee > 0 ? deliveryConfig[selectedCourier]?.eta : '')
//   }

//   useEffect(() => {
//     if (selectedCourier && selectedLocation) {
//       const fee = deliveryConfig[selectedCourier]?.rates?.[selectedLocation] ?? 0
//       setDeliveryFee(fee)
//       setEta(deliveryConfig[selectedCourier]?.eta ?? '')
//     } else {
//       setDeliveryFee(0)
//       setEta('')
//     }
//   }, [selectedCourier, selectedLocation])

//   const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
//   const grandTotal = subtotal + deliveryFee

//   const isFormValid =
//     contact.name.trim() !== '' &&
//     contact.email.includes('@') &&
//     contact.phone.trim() !== '' &&
//     contact.address.trim() !== '' &&
//     selectedCourier !== '' &&
//     selectedLocation !== ''

//   const paystackConfig = {
//     email: contact.email || 'customer@example.com',
//     amount: grandTotal * 100,
//     publicKey: 'pk_live_236709ee538755e5ff702b540108b0d2ecbd290e',
//     metadata: {
//       custom_fields: [
//         { display_name: 'Customer Name', value: contact.name },
//         { display_name: 'Phone Number', value: contact.phone },
//         { display_name: 'Delivery Address', value: contact.address },
//         { display_name: 'Courier', value: selectedCourier },
//         { display_name: 'Location', value: selectedLocation },
//         { display_name: 'Delivery Fee', value: `₦${deliveryFee}` },
//         { display_name: 'ETA', value: eta },
//         ...cartItems.map((item, i) => ({
//           display_name: `${item.title} (${item.size ?? 'N/A'})`,
//           variable_name: `item_${i}`,
//           value: `₦${item.price} ×${item.quantity}`,
//         })),
//       ],
//     },
//     onSuccess: async (ref) => {
//       alert(`Payment successful! Reference: ${ref.reference}`)
//       try {
//         await fetch('/api/orders', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             ...contact,
//             items: cartItems,
//             subtotal,
//             deliveryFee,
//             courier: selectedCourier,
//             location: selectedLocation,
//             eta,
//             total: grandTotal,
//             paymentRef: ref.reference,
//           }),
//         })
//         await fetch('/api/sendMail', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             email: contact.email,
//             name: contact.name,
//             address: contact.address,
//             cartItems,
//             subtotal,
//             deliveryFee,
//             courier: selectedCourier,
//             location: selectedLocation,
//             eta,
//             totalAmount: grandTotal,
//           }),
//         })
//       } catch (err) {
//         console.error('Order save/email failed:', err)
//       }
//       clearCart()
//     },
//     onClose: () => alert('Payment window closed'),
//   }

//   return (
//     <div className="relative min-h-screen bg-gradient-to-b from-[#fafafa] to-[#e9e9e9] overflow-hidden">
//       <Navbar />

//       <div className="max-w-3xl mx-auto px-4 py-10">
//         <motion.h2
//           initial={{ opacity: 0, y: -8 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-3xl font-semibold mb-6 text-center text-zinc-800"
//         >
//           Your Cart
//         </motion.h2>

//         <AnimatePresence>
//           {cartItems.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-sm rounded-2xl p-6 text-center text-gray-500"
//             >
//               Your cart is empty.
//             </motion.div>
//           ) : (
//             <div className="space-y-6">
//               {cartItems.map((item, idx) => (
//                 <motion.div
//                   key={`${item._id}-${item.size ?? 'default'}-${idx}`}
//                   initial={{ opacity: 0, scale: 0.98 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.22, delay: idx * 0.03 }}
//                   className="flex gap-4 items-center bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200 ease-in-out"
//                 >
//                   <Image
//                     src={
//                       item.image
//                         ? item.image.startsWith('http')
//                           ? item.image
//                           : `/images/${item.image}`
//                         : '/images/placeholder.png'
//                     }
//                     alt={item.title || 'Product Image'}
//                     width={80}
//                     height={80}
//                     className="rounded-xl object-cover"
//                     onError={(e) => { e.currentTarget.src = '/images/placeholder.png' }}
//                   />

//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-zinc-800">{item.title}</h3>
//                     <p className="text-sm text-green-700">₦{item.price.toLocaleString()}</p>
//                     <p className="text-sm text-zinc-500">
//                       Size: {item.size ?? 'N/A'} | Qty: {item.quantity}
//                     </p>
//                     <button
//                       onClick={() => removeFromCart(item._id, item.size)}
//                       className="mt-2 text-sm text-red-500 hover:text-red-600"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </motion.div>
//               ))}

//               {/* Subtotal */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="bg-zinc-100/70 border border-green-200 rounded-2xl p-4 shadow-md text-right text-xl font-bold text-zinc-800"
//               >
//                 Subtotal: ₦{subtotal.toLocaleString()}
//               </motion.div>

//               {/* Courier selection */}
//               <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {Object.entries(deliveryConfig).map(([courierKey, courierData]) => {
//                   const ratesForThis = courierData.rates
//                   const isSelected = selectedCourier === courierKey

//                   return (
//                     <motion.div
//                       key={courierKey}
//                       whileTap={{ scale: 0.995 }}
//                       onClick={() => handleCourierSelect(courierKey)}
//                       className={`cursor-pointer rounded-2xl p-4 backdrop-blur-xl border transition-all ${isSelected
//                         ? 'bg-green-600/90 text-white shadow-lg border-transparent'
//                         : 'bg-white/40 border-white/50 text-zinc-800 hover:bg-white/50'
//                         }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
//                             <span className="font-bold">{courierKey}</span>
//                           </div>
//                           <div>
//                             <div className="font-semibold text-lg">{courierKey}</div>
//                             <div className="text-sm opacity-80">{courierData.eta}</div>
//                           </div>
//                         </div>
//                         <div className="text-sm font-medium">{isSelected ? 'Selected' : 'Choose'}</div>
//                       </div>

//                       {/* Expandable rates */}
//                       <AnimatePresence>
//                         {isSelected && (
//                           <motion.div
//                             key={`${courierKey}-expand`}
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: 'auto' }}
//                             exit={{ opacity: 0, height: 0 }}
//                             className="mt-4 overflow-hidden"
//                           >
//                             {/* Rates list */}
//                             <div className="mb-3 space-y-1">
//                               {Object.entries(ratesForThis).map(([loc, fee]) => (
//                                 <div key={loc} className="flex justify-between text-sm py-1 px-2 rounded-md">
//                                   <span className="text-zinc-700">{loc}</span>
//                                   <span className="font-medium">₦{fee.toLocaleString()}</span>
//                                 </div>
//                               ))}
//                             </div>

//                             {/* Dropdown */}
//                             <label className="block text-sm font-medium mb-2">Select delivery destination</label>
//                             <select
//                               value={isSelected ? selectedLocation : ''}
//                               onChange={handleLocationChange}
//                               className="w-full border border-white/50 bg-white/70 backdrop-blur-md rounded-lg text-black p-2 mb-2 focus:ring-2 focus:ring-green-300"
//                             >
//                               <option value="">-- Choose location --</option>
//                               {Object.entries(ratesForThis).map(([loc, fee]) => (
//                                 <option key={loc} value={loc}>
//                                   {loc} — ₦{fee.toLocaleString()}
//                                 </option>
//                               ))}
//                             </select>

//                             {/* Fee + ETA */}
//                             {selectedLocation && (
//                               <div className="mt-2 text-sm font-medium">
//                                 <div className="text-green-700">Delivery Fee: ₦{deliveryFee.toLocaleString()}</div>
//                                 <div className="text-zinc-200/90 mt-1 italic">{eta}</div>
//                               </div>
//                             )}
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </motion.div>
//                   )
//                 })}
//               </motion.div>

//               {/* Grand total */}
//               <motion.div
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-[0_0_25px_-5px_rgba(34,197,94,0.18)] text-right text-xl font-bold text-zinc-800"
//               >
//                 <div>Delivery: ₦{deliveryFee.toLocaleString()}</div>
//                 <div className="text-green-700 mt-1">Grand Total: ₦{grandTotal.toLocaleString()}</div>
//               </motion.div>

//               {/* Buyer details & actions */}
//               <motion.div
//                 className="mt-8 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg"
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 <h3 className="text-lg font-semibold mb-4 text-black">Your Details</h3>
//                 <div className="space-y-3">
//                   {['name','email','phone','address'].map(field => (
//                     <input
//                       key={field}
//                       type={field === 'email' ? 'email' : 'text'}
//                       name={field}
//                       placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//                       value={contact[field]}
//                       onChange={(e) => setContact(prev => ({ ...prev, [field]: e.target.value }))}
//                       className="w-full border border-white/50 bg-white/60 backdrop-blur-md p-2 rounded-lg text-black focus:ring-2 focus:ring-green-300"
//                     />
//                   ))}
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-between items-center mt-8 gap-4">
//                   <button
//                     onClick={clearCart}
//                     className="px-4 py-2 bg-red-500/90 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
//                   >
//                     Clear Cart
//                   </button>

//                   <PaystackButton
//                     className={`px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all ${
//                       isFormValid
//                         ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
//                         : 'bg-gray-400 text-gray-200 cursor-not-allowed'
//                     }`}
//                     {...paystackConfig}
//                     disabled={!isFormValid}
//                   >
//                     Pay ₦{grandTotal.toLocaleString()} with Paystack
//                   </PaystackButton>
//                 </div>
//               </motion.div>
//             </div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   )
// }

// deepseek//////



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

  const [selectedCourier, setSelectedCourier] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [eta, setEta] = useState('')

  // NEW: Validation states
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [orderReference, setOrderReference] = useState(null)

  const deliveryConfig = {
    GIG: {
      eta: 'GIG delivers in 2–5 days',
      rates: {
        Lagos: 5500, Abuja: 5500, adamawa: 6500, bauchi: 6500, damaturu: 6500,
        gombe: 6500, jigawa: 6500, jos: 6500, kaduna: 6500, kano: 6500,
        kastina: 6500, kebbi: 6500, lafia: 6500, lokoja: 6500, maduguri: 6500,
        makurdi: 6500, minna: 6500, sokoto: 6500, taraba: 6500, zamfara: 6500,
        zaria: 6500, aba: 4600, awka: 4600, enugu: 4600, nnewi: 4600,
        onitsha: 4600, owerri: 4600, umuahia: 4600, abakaliki: 4600, asaba: 4600,
        auchi: 4600, bayelsa: 4600, benin: 4600, calabar: 4600, ughelli: 4600,
        eket: 4600, uyo: 4600, warri: 4600, yenagoa: 4600, abeokuta: 5500,
        adoekiti: 5500, akure: 5500, ibadan: 5500, ileife: 5500, ilorin: 5500,
        ogbomosho: 5500, ondotown: 5500, osogbo: 5500,
      },
    },
    GUO: {
      eta: 'GUO delivers in 2–5 days',
      rates: {
        Lagos: 3500, Abuja: 3500, Uyo: 3500, Benin: 3500, Asaba: 3500,
        jalingo: 4500, jos: 4500, kano: 4500, zaria: 4500, kaduna: 4500,
        bauchi: 4500, yola: 4500, umuaka: 3500, owerri: 3500, orlu: 3500,
        akokwa: 3500, enugu: 3500, afikpo: 3500, abakaliki: 3500, umunze: 3500,
        onitsha: 3500, nnewi: 3500, ihiala: 3500, ekwulobia: 3500, awka: 3500,
        umuahia: 3500, aba: 3500,
      },
    },
    Portharcourt: {
      eta: 'delivery in 1–3 days',
      rates: { PortHarcourt: 100 },
    },
  }

  // --- Event handlers
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

    const fee = deliveryConfig[selectedCourier]?.rates?.[location] ?? 0
    setDeliveryFee(fee)
    setEta(fee > 0 ? deliveryConfig[selectedCourier]?.eta : '')
  }

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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const grandTotal = subtotal + deliveryFee

  const isFormValid =
    contact.name.trim() !== '' &&
    contact.email.includes('@') &&
    contact.phone.trim() !== '' &&
    contact.address.trim() !== '' &&
    selectedCourier !== '' &&
    selectedLocation !== ''

  // NEW: Validate cart before payment
  const validateCartBeforePayment = async () => {
    if (cartItems.length === 0) {
      setValidationError('Your cart is empty');
      return false;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Prepare cart items for validation
      const itemsForValidation = cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        size: item.size || null
      }));

      // Call cart validation API
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsForValidation })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Validation failed');
      }

      if (!result.isValid) {
        // Show validation errors
        const errorMessages = result.validationResults
          .filter(item => !item.valid)
          .map(item => `${item.productTitle || 'Product'}: ${item.message}`)
          .join('\n');

        setValidationError(errorMessages);
        alert(`Stock issues detected:\n\n${errorMessages}`);
        return false;
      }

      // Generate order reference for payment
      const shopId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setOrderReference(shopId);

      return {
        shopId: shopId,
        totalAmount: grandTotal
      };

    } catch (error) {
      console.error('Cart validation error:', error);
      setValidationError(error.message);
      alert(`Error: ${error.message}`);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // UPDATED: Paystack onSuccess handler
  const handlePaymentSuccess = async (ref) => {
    try {
      // 1. Verify payment and update stock
      const verifyResponse = await fetch('/api/verifypayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: ref.reference,
          cartItems: cartItems.map(item => ({
            productId: item._id,
            title: item.title,
            size: item.size || 'N/A',
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          email: contact.email,
          name: contact.name,
          phone: contact.phone,
          address: contact.address,
          totalAmount: grandTotal,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          courier: selectedCourier,
          location: selectedLocation,
          eta: eta,
        })
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        if (verifyResult.type === 'STOCK_ERROR') {
          alert(`⚠️ Payment Issue: ${verifyResult.message}\n\nContact support for assistance.`);
          // Refresh page to show updated stock
          setTimeout(() => window.location.reload(), 2000);
          return;
        }
        alert(`Payment verification failed: ${verifyResult.message}`);
        return;
      }

      // 2. Show success message with order number
      alert(`✅ Payment successful! Order #: ${verifyResult.order?.shopId || ref.reference}`);

      // 3. Clear cart
      clearCart();

      // 4. Redirect to success page
      window.location.href = `/order-success?reference=${ref.reference}&order=${verifyResult.order?.shopId || ref.reference}`;

    } catch (err) {
      console.error('Payment success error:', err);
      alert('Payment successful but error processing. Please contact support with your reference.');
    }
  };

  // UPDATED: Paystack configuration
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
          display_name: `${item.title} (${item.size ?? 'N/A'})`,
          variable_name: `item_${i}`,
          value: `₦${item.price} ×${item.quantity}`,
        })),
      ],
    },
    reference: orderReference || `cart_${Date.now()}`,
    onSuccess: handlePaymentSuccess,
    onClose: () => {
      setValidationError(null);
      alert('Payment window closed');
    },
  };

  // NEW: Handle Paystack button click
  const handlePaystackClick = async () => {
    if (isValidating || !isFormValid) return;

    // First validate cart
    const orderInfo = await validateCartBeforePayment();

    if (!orderInfo) {
      return; // Validation failed
    }

    // Set the reference for Paystack
    paystackConfig.reference = orderInfo.shopId;

    // Trigger the hidden Paystack button
    setTimeout(() => {
      document.querySelector('.paystack-button')?.click();
    }, 100);
  };

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

        {/* NEW: Validation Error Display */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl"
          >
            <p className="font-semibold">⚠️ Issues Detected:</p>
            <p className="text-sm mt-1 whitespace-pre-line">{validationError}</p>
            <button
              onClick={() => setValidationError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </motion.div>
        )}

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
            <div className="space-y-6">
              {cartItems.map((item, idx) => (
                <motion.div
                  key={`${item._id}-${item.size ?? 'default'}-${idx}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22, delay: idx * 0.03 }}
                  className="flex gap-4 items-center bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200 ease-in-out"
                >
                  <Image
                    src={
                      item.image
                        ? item.image.startsWith('http')
                          ? item.image
                          : `/images/${item.image}`
                        : '/images/placeholder.png'
                    }
                    alt={item.title || 'Product Image'}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder.png' }}
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-800">{item.title}</h3>
                    <p className="text-sm text-green-700">₦{item.price.toLocaleString()}</p>
                    <p className="text-sm text-zinc-500">
                      Size: {item.size ?? 'N/A'} | Qty: {item.quantity}
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

              {/* Courier selection */}
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(deliveryConfig).map(([courierKey, courierData]) => {
                  const ratesForThis = courierData.rates
                  const isSelected = selectedCourier === courierKey

                  return (
                    <motion.div
                      key={courierKey}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => handleCourierSelect(courierKey)}
                      className={`cursor-pointer rounded-2xl p-4 backdrop-blur-xl border transition-all ${isSelected
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
                        <div className="text-sm font-medium">{isSelected ? 'Selected' : 'Choose'}</div>
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
                                <div key={loc} className="flex justify-between text-sm py-1 px-2 rounded-md">
                                  <span className="text-zinc-700">{loc}</span>
                                  <span className="font-medium">₦{fee.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            {/* Dropdown */}
                            <label className="block text-sm font-medium mb-2">Select delivery destination</label>
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
                                <div className="text-green-700">Delivery Fee: ₦{deliveryFee.toLocaleString()}</div>
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

              {/* Grand total */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-[0_0_25px_-5px_rgba(34,197,94,0.18)] text-right text-xl font-bold text-zinc-800"
              >
                <div>Delivery: ₦{deliveryFee.toLocaleString()}</div>
                <div className="text-green-700 mt-1">Grand Total: ₦{grandTotal.toLocaleString()}</div>
              </motion.div>

              {/* Buyer details & actions */}
              <motion.div
                className="mt-8 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-black">Your Details</h3>
                <div className="space-y-3">
                  {['name', 'email', 'phone', 'address'].map(field => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={contact[field]}
                      onChange={(e) => setContact(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full border border-white/50 bg-white/60 backdrop-blur-md p-2 rounded-lg text-black focus:ring-2 focus:ring-green-300"
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-8 gap-4">
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 bg-red-500/90 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Clear Cart
                  </button>

                  {/* Hidden Paystack button for validation */}
                  <div className="hidden">
                    <PaystackButton
                      className="paystack-button"
                      {...paystackConfig}
                      disabled={!isFormValid || isValidating}
                    />
                  </div>

                  {/* Custom button that triggers validation first */}
                  <button
                    onClick={handlePaystackClick}
                    disabled={!isFormValid || isValidating}
                    className={`px-4 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center min-w-[200px] ${!isFormValid || isValidating
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                      }`}
                  >
                    {isValidating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validating...
                      </>
                    ) : (
                      `Pay ₦${grandTotal.toLocaleString()} with Paystack`
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}