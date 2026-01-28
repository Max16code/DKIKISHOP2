'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`)
        const data = await res.json()
        if (data?._id) setProduct(data)
        else throw new Error('Product not found')
      } catch (err) {
        console.error('❌ Failed to load product:', err)
      }
    }

    if (id) fetchProduct()
  }, [id])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black/80">
        <p className="text-lg animate-pulse">Loading product...</p>
      </div>
    )
  }

  const isOutOfStock = product.quantity <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) return alert('🚫 Item is out of stock.')
    if (!selectedSize) return alert('Please select a size')

    addToCart({
      _id: product._id,
      title: product.title,
      image: product.images?.[0],
      price: product.price,
      size: selectedSize,
      quantity: selectedQuantity,
    })

    alert('✅ Added to cart!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-10 bg-gradient-to-br from-black via-gray-900 to-black text-white relative z-10"
    >
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl
      p-6 md:p-10 grid md:grid-cols-2 gap-10 items-start">

        {/* ✅ PRODUCT IMAGE */}
        <div className="flex justify-center items-center">
          <div className="relative w-full h-[350px] sm:h-[500px] md:h-[650px] rounded-2xl overflow-hidden bg-black/20">
            <Image
              src={product.images?.[0]}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-6 md:mt-10">

          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
            {product.title}
          </h1>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            {product.description}
          </p>

          <p className="text-green-400 text-2xl font-semibold">
            ₦{Number(product.price).toLocaleString()}
          </p>

          {product.sizes?.length > 0 && (
            <>
              <label className="block mb-2 font-medium text-white">Choose Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={isOutOfStock}
                className="w-full rounded-lg px-4 py-2 bg-white/20 text-white border border-white/30
                focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              >
                <option value="">-- Select Size --</option>
                {product.sizes.map((size, idx) => (
                  <option key={idx} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}

          {!isOutOfStock && (
            <div>
              <label className="block mb-1 text-white font-medium">Quantity:</label>
              <input
                type="number"
                min={1}
                max={product.quantity}
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="w-20 p-2 rounded border text-black"
              />
            </div>
          )}

          {isOutOfStock ? (
            <button
              disabled
              className="w-full bg-gray-400 text-white font-semibold px-6 py-3 rounded-xl cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white hover:bg-gray-900 font-semibold px-6 py-3 rounded-xl transition active:scale-95"
            >
              Add to Cart
            </button>
          )}

          <div className="text-sm text-gray-400">
            {isOutOfStock ? 'Currently unavailable' : `Only ${product.quantity} left in stock`}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
