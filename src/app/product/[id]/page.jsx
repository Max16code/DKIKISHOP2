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
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch product + polling
  useEffect(() => {
    if (!id) return

    const fetchProduct = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true)
        const res = await fetch(`/api/product/${id}`)
        if (!res.ok) throw new Error('Failed to fetch product')
        const data = await res.json()

        setProduct(data)
        setError(null)
      } catch (err) {
        console.error('❌ Failed to load product:', err)
        setError(err.message)
      } finally {
        if (isInitial) setLoading(false)
      }
    }

    // Initial fetch
    fetchProduct(true)

    // Polling every 60 seconds (only when tab visible)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProduct() // silent update
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [id])

  // Image auto-flip effect (only if multiple images)
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % product.images.length)
    }, 4000) // flip every 4 seconds

    return () => clearInterval(interval)
  }, [product?.images])

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

  const isOutOfStock = product.stock <= 0 || !product.isAvailable
  const canAddToCart = !isOutOfStock && selectedQuantity <= (product.stock || 0) && selectedQuantity >= 1

  const handleAddToCart = () => {
    if (isOutOfStock) return alert('🚫 Item is out of stock.')
    if (product.sizes?.length > 0 && !selectedSize) return alert('Please select a size')
    if (selectedQuantity > product.stock) return alert(`Only ${product.stock} available`)

    addToCart({
      _id: product._id,
      title: product.title,
      image: product.images?.[0],
      price: product.price,
      size: selectedSize || null,
      quantity: selectedQuantity,
      shopId: product.shopId || null,
      stock: product.stock ?? product.quantity ?? 9999
    })

    alert(`✅ Added ${selectedQuantity} to cart!`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-10 bg-gradient-to-br from-black via-gray-900 to-black text-white relative z-10"
    >
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-10 items-start">
        {/* PRODUCT IMAGE with auto-flip */}
        <div className="relative w-full h-[350px] sm:h-[500px] md:h-[650px] rounded-2xl overflow-hidden bg-black/20">
          {product.images && product.images.length > 0 ? (
            <div className="relative w-full h-full">
              {product.images.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`${product.title} - Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}

              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-white scale-125 shadow-md' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Image
              src="/images/placeholder.png"
              alt={product.title || "Product placeholder"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          )}

          {/* Official DKIKISHOP logo – top-right corner */}
          <div className="absolute top-2 right-2 w-12 h-12 overflow-hidden rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 z-10">
            <Image
              src="/images/kikiLogo.jpg"
              alt="Dkikishop Logo"
              fill
              className="object-cover"
              sizes="48px"
              priority
            />
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-2xl md:text-4xl font-bold z-20">
              Out of Stock
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-6 md:mt-0">
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
                className="w-full rounded-lg px-4 py-2 bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
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
              <label className="block mb-2 text-white font-medium">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                  disabled={selectedQuantity <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded-full text-white text-xl font-bold hover:bg-yellow-500/20 hover:border-yellow-400/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  -
                </button>

                <div className="w-16 h-10 flex items-center justify-center bg-black/50 border border-white/20 rounded-lg text-white font-semibold text-lg">
                  {selectedQuantity}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedQuantity(prev => Math.min(prev + 1, product.stock))}
                  disabled={selectedQuantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded-full text-white text-xl font-bold hover:bg-yellow-500/20 hover:border-yellow-400/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  +
                </button>
              </div>

              {selectedQuantity >= product.stock && (
                <p className="text-yellow-400 text-sm mt-2 font-medium">
                  Maximum available: {product.stock}
                </p>
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
              disabled={!canAddToCart || (product.sizes?.length > 0 && !selectedSize)}
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