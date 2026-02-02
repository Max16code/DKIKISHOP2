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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch product + real-time stock refresh
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/product/${id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        setProduct(data)
      } catch (err) {
        console.error('❌ Failed to load product:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()

    // Real-time stock polling (every 25 seconds)
    const interval = setInterval(() => {
      if (id && !loading) fetchProduct()
    }, 25000)

    return () => clearInterval(interval)
  }, [id, loading])

  const isOutOfStock = product && (product.stock <= 0 || !product.isAvailable)

  const canAddToCart = !isOutOfStock && selectedQuantity <= product?.stock && selectedQuantity >= 1

  const handleAddToCart = () => {
    if (isOutOfStock) return alert('🚫 Item is out of stock.')
    if (!selectedSize && product?.sizes?.length > 0) return alert('Please select a size')
    if (selectedQuantity > product.stock) return alert(`Only ${product.stock} available`)

    addToCart({
      _id: product._id,
      title: product.title,
      image: product.images?.[0],
      price: product.price,
      size: selectedSize || null,
      quantity: selectedQuantity,
      shopId: product.shopId || null
    })

    alert(`✅ Added ${selectedQuantity} to cart!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black/80">
        <p className="text-lg animate-pulse">Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black/80">
        <p className="text-lg text-red-500">Product not found or error loading.</p>
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

      <div className="max-w-6xl mx-auto mt-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl
      p-6 md:p-10 grid md:grid-cols-2 gap-10 items-start">

        {/* PRODUCT IMAGE */}
        <div className="flex justify-center items-center">
          <div className="relative w-full h-[350px] sm:h-[500px] md:h-[650px] rounded-2xl overflow-hidden bg-black/20">
            <Image
              src={product.images?.[0] || '/images/placeholder.png'}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-2xl md:text-4xl font-bold">
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

          {/* Stock status */}
          <div className="text-lg font-medium">
            {isOutOfStock ? (
              <span className="text-red-500">Out of Stock</span>
            ) : (
              <span className="text-green-400">
                In Stock: {product.stock} left
              </span>
            )}
          </div>

          {/* Sizes */}
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

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div>
              <label className="block mb-1 text-white font-medium">Quantity:</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={selectedQuantity}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setSelectedQuantity(Math.max(1, Math.min(val, product.stock)))
                }}
                className="w-24 p-2 rounded border text-black bg-white/90"
              />
              {selectedQuantity > product.stock && (
                <p className="text-red-400 text-sm mt-1">Maximum available: {product.stock}</p>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full bg-gray-600 text-white font-semibold px-6 py-4 rounded-xl cursor-not-allowed text-lg"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || !selectedSize && product.sizes?.length > 0}
              className={`w-full font-semibold px-6 py-4 rounded-xl transition text-lg ${
                canAddToCart && (!product.sizes?.length || selectedSize)
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black active:scale-95'
                  : 'bg-gray-600 text-white cursor-not-allowed'
              }`}
            >
              {canAddToCart && (!product.sizes?.length || selectedSize)
                ? `Add ${selectedQuantity} to Cart`
                : product.sizes?.length > 0 && !selectedSize
                ? 'Select Size First'
                : 'Add to Cart'}
            </button>
          )}

        </div>
      </div>
    </motion.div>
  )
}