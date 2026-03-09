'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import HomeCarousel from '@/components/HomeCarousel'

export default function Home() {
  const [productData, setProductData] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch('/api/getproducts/all?available=true')
        const data = await res.json()

        if (!Array.isArray(data)) throw new Error('Invalid product format')

        const availableProducts = data.filter(product =>
          product.isAvailable !== false &&
          (product.stock > 0 || product.quantity > 0)
        )

        setProductData(availableProducts)

        const featured = availableProducts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)

        setFeaturedProducts(featured)
      } catch (err) {
        console.error('❌ Error:', err)
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#121212] overflow-hidden">
      {/* Faint Logo Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/kikiLogo.jpg"
          alt="Background Logo"
          fill
          className="object-cover opacity-5"
          sizes="100vw"
          priority
        />
      </div>

      <Navbar />

      {/* Welcome Section */}
      <div className="relative z-10 text-center mt-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide">
          Welcome to{' '}
          <span className="text-yellow-400">DKIKISHOP</span>
        </h1>
        <p className="mt-2 text-gray-400">Luxury on a Budget</p>
      </div>

      {/* Carousel */}
      <HomeCarousel products={featuredProducts} />

      {/* Optimized Translucent Apple liquid glass discount banner */}
      <div className="fixed bottom-6 left-4 right-4 z-50 mx-auto pointer-events-auto max-w-[95vw] sm:max-w-[420px] md:left-8 lg:left-12 md:right-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl bg-white/10 backdrop-blur-xl md:backdrop-blur-2xl border border-white/15">
          {/* Liquid shine animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shine pointer-events-none" />

          {/* Soft inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/5 via-purple-100/5 to-transparent pointer-events-none" />

          <div className="relative px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 text-center">
            {/* Subtle top highlight */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-1 bg-gradient-to-r from-pink-300/60 to-fuchsia-300/60 rounded-full blur-sm" />

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-wide drop-shadow-md">
              Anniversary Launch Sales
            </h3>

            <p className="text-base sm:text-lg md:text-xl font-semibold text-pink-300 mb-1 drop-shadow-sm">
              20–30% OFF
            </p>

            <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium mb-3 sm:mb-4">
              20th – 24th March 2026
            </p>
            {/* Ribbon that wraps around the whole banner – moving left-to-right */}
            <div className="relative h-8 sm:h-9 md:h-10 overflow-hidden">
              {/* Ribbon background (full perimeter frame) */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/40 via-fuchsia-500/40 to-purple-500/40 rounded-full border border-pink-300/40 shadow-inner backdrop-blur-md" />

              {/* Scrolling text that flows around the frame */}
              <div className="absolute inset-0 flex items-center whitespace-nowrap animate-ribbon-flow">
                <span className="text-xs sm:text-sm md:text-base font-medium text-white/95 tracking-wider px-16">
                  Hurry up girlies and pick up the good stuff fast 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  Hurry up girlies and pick up the good stuff fast 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  Hurry up girlies and pick up the good stuff fast 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  Hurry up girlies and pick up the good stuff fast 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  Hurry up girlies and pick up the good stuff fast 💅✨
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="relative z-10 mt-10 px-6 text-center">
        {loading && <p className="text-gray-500">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && productData.length === 0 && !error && (
          <p className="text-gray-500">No products available at the moment.</p>
        )}
      </div>

      {/* Product Grid */}
      <div className="relative z-10 mt-10 px-2 sm:px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {productData.map((product, index) => {
          const isAvailable = product.isAvailable !== false
          const stock = product.stock || product.quantity || 0
          const inStock = isAvailable && stock > 0
          const lowStock = inStock && stock <= 5

          return (
            <Link href={`/product/${product._id}`} key={product._id || index} passHref>
              <motion.div
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`flex flex-col cursor-pointer shadow-md hover:shadow-yellow-500/20 transition-shadow duration-300 relative rounded-lg overflow-hidden ${!inStock ? 'opacity-70' : ''}`}
              >
                <div className="relative w-full h-54 sm:h-64 md:h-72 flex items-center justify-center bg-black/10">
                  <Image
                    src={product.images?.[0] || '/images/fallback.jpg'}
                    alt={product.title}
                    fill
                    className={`object-contain transition-opacity duration-300 ${!inStock ? 'opacity-50 grayscale' : ''}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={index < 6}
                  />
                  {/* Official DKIKISHOP logo – top-right corner */}
                  <div className="absolute top-2 right-4 w-8 h-8 overflow-hidden rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src="/images/kikiLogo.jpg"
                      alt="Dkikishop Logo"
                      fill
                      className="object-cover"
                      sizes="48px"  // exact size hint for performance
                      priority      // optional: loads faster if it's above the fold
                    />
                  </div>
                  {!inStock && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full z-10">
                      OUT OF STOCK
                    </div>
                  )}
                  {lowStock && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full z-10">
                      LOW STOCK
                    </div>
                  )}

                  {!inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold z-5">
                      Unavailable
                    </div>
                  )}
                </div>

                <div className="p-2 sm:p-3 flex flex-col items-start text-left">
                  <h2 className="text-sm sm:text-base font-semibold text-white line-clamp-1">
                    {product.title}
                  </h2>

                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                    {product.description}
                  </p>

                  <p className="text-yellow-400 font-bold text-sm mt-1">
                    ₦{Number(product.price).toLocaleString()}
                  </p>

                  <div className="mt-1 text-xs">
                    {inStock ? (
                      <span className={lowStock ? 'text-yellow-400' : 'text-green-400'}>
                        {lowStock ? `Only ${stock} left!` : 'In Stock'}
                      </span>
                    ) : (
                      <span className="text-red-400">Out of Stock</span>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-400 mt-1">
                    Sizes: {Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes.join(', ') : 'N/A'}
                  </p>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}