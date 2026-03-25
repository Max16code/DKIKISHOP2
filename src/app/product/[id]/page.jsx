'use client'

import { useParams, useRouter } from 'next/navigation'  // <-- added useRouter
import { useEffect, useState, useCallback } from 'react'
import { useCart } from '@/context/Cartcontext'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useShutdown } from '@/hooks/useShutDown'

export const dynamic = 'force-dynamic'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()  // <-- for navigation back
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { shutdown, loading: shutdownLoading } = useShutdown()

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    dragFree: false,
    speed: 10,
  })

  useEffect(() => {
    if (!id) return

    const fetchProduct = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true)
        const res = await fetch(`/api/product/${id}?t=${Date.now()}`)
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

    fetchProduct(true)

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProduct()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (!emblaApi || !product?.images || product.images.length <= 1) return

    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [emblaApi, product?.images])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (loading || shutdownLoading) {
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
  const cannotAddDueToShutdown = shutdown
  const canAddToCart = !isOutOfStock && !cannotAddDueToShutdown && selectedQuantity <= (product.stock || 0) && selectedQuantity >= 1

  const handleAddToCart = () => {
    if (shutdown) {
      alert('Store is closed for maintenance. New items cannot be added.')
      return
    }
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
      {/* Beautiful Back Button */}
      <div className="max-w-6xl mx-auto mt-20">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-md"
          aria-label="Go back"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <Navbar />

      {/* Shutdown Banner */}
      {shutdown && (
        <div className="max-w-6xl mx-auto mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-md">
          <p className="font-medium">
            ⚠️ The store is currently closed for maintenance. You cannot add new items to your cart.
            If you have existing items, you can still proceed to checkout.
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-10 items-start">
        {/* PRODUCT IMAGE with manual swipe carousel */}
        <div className="relative w-full h-[350px] sm:h-[500px] md:h-[650px] rounded-2xl overflow-hidden bg-black/20">
          {product.images && product.images.length > 0 ? (
            <div className="embla h-full" ref={emblaRef}>
              <div className="embla__container flex h-full">
                {product.images.map((imgSrc, index) => (
                  <div key={index} className="embla__slide min-w-full h-full">
                    <img
                      src={imgSrc}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
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

          {/* Navigation arrows */}
          {product.images?.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all z-10 opacity-70 hover:opacity-100"
                onClick={scrollPrev}
              >
                ←
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all z-10 opacity-70 hover:opacity-100"
                onClick={scrollNext}
              >
                →
              </button>
            </>
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
                disabled={isOutOfStock || shutdown}
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
          {!isOutOfStock && !shutdown && (
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
          ) : shutdown ? (
            <button
              disabled
              className="w-full bg-gray-600 text-white font-semibold px-6 py-4 rounded-xl cursor-not-allowed text-lg"
            >
              Store Closed – Cannot Add New Items
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