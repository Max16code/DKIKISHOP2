'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`)
        const data = await res.json()
        if (data._id) setProduct(data)
        else throw new Error('product not found')
      } catch (err) {
        console.error('❌ Failed to load product:', err)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }

    addToCart({
      _id: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      size: selectedSize,
      quantity: 1,
    })

    alert('✅ Added to cart!')
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black/80">
        <p className="text-lg animate-pulse">Loading product...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-10 bg-gradient-to-br from-black via-gray-900 to-black text-white relative z-10"
    >
      <Navbar />

      <div className="max-w-5xl mx-auto mt-10 rounded-2xl bg-white/10 border
       border-white/20 backdrop-blur-md shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-8">
        <motion.img
          src={product.image}
          alt={product.title}
          className="w-full h-[400px] object-cover rounded-xl shadow-md"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">{product.title}</h1>
          <p className="mt-4 text-gray-300 text-sm md:text-base">{product.description}</p>

          <p className="mt-6 text-green-400 text-2xl font-semibold">
            ₦{Number(product.price).toLocaleString()}
          </p>

          {product.sizes?.length > 0 ? (
            <div className="mt-6">
              <label className="block mb-2 font-medium text-white">Choose Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full rounded-lg px-4 py-2 bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">-- Select Size --</option>
                {product.sizes.map((size, idx) => (
                  <option key={idx} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              {product.quantity === 0 ? (
                <button
                  disabled
                  className="mt-6 w-full bg-gray-500 text-white font-semibold px-6 py-3 rounded-xl opacity-60 cursor-not-allowed"
                >
                  🚫 Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="mt-6 w-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-6 py-3 rounded-xl transition duration-200"
                >
                  Add to Cart
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 text-red-400 font-semibold">🚫 Out of Stock</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
