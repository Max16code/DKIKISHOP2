'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import HomeCarousel from '@/components/HomeCarousel'
import { FaSquareInstagram, FaSquareTiktok } from "react-icons/fa6";
import { BsFillGeoAltFill } from 'react-icons/bs'
import SearchSection from '@/components/SearchSection'



const ITEMS_PER_PAGE = 12 // Changed from 16 to 12 (3 rows of 4 on desktop)

export default function Home() {
  const [allProducts, setAllProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showLess, setShowLess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [bannerVisible, setBannerVisible] = useState(true)
  const [showClose, setShowClose] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowClose(true)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  const hideBanner = () => {
    setBannerVisible(false)
  }

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/getproducts/all?available=true')

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }

        const json = await res.json()

        let productArray = []

        if (Array.isArray(json)) {
          productArray = json
        } else if (json && Array.isArray(json.products)) {
          productArray = json.products
        } else if (json && Array.isArray(json.data)) {
          productArray = json.data
        } else {
          throw new Error('Invalid product format from API')
        }

        const availableProducts = productArray.filter(product =>
          product.isAvailable !== false &&
          (product.stock > 0 || product.quantity > 0)
        )

        setAllProducts(availableProducts)

        const featured = [...availableProducts]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 10)
        setFeaturedProducts(featured)

        setDisplayedProducts(availableProducts.slice(0, ITEMS_PER_PAGE))
        setHasMore(availableProducts.length > ITEMS_PER_PAGE)
      } catch (err) {
        setError('Failed to load products. Please refresh.')
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [])

  const loadMore = () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    const nextPage = page + 1
    const start = (nextPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE

    setDisplayedProducts(prev => [...prev, ...allProducts.slice(start, end)])
    setPage(nextPage)
    setHasMore(end < allProducts.length)
    setShowLess(true)
    setLoadingMore(false)
  }

  const seeLess = () => {
    setDisplayedProducts(allProducts.slice(0, ITEMS_PER_PAGE))
    setPage(1)
    setHasMore(allProducts.length > ITEMS_PER_PAGE)
    setShowLess(false)
  }

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
      <SearchSection />

      {/* Welcome Section */}
      <div className="relative z-10 text-center mt-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide">
          Welcome to{' '}
          <span className="text-yellow-400">DKIKISHOP</span>
        </h1>
        <p className="mt-2 text-gray-400">Trendy on a Budget</p>
      </div>

      {/* Carousel */}
      <HomeCarousel />

      {/* Responsive announcement banner – auto-hide + close button */}
      <div className={`fixed top-20 right-4 z-50 pointer-events-auto max-w-[90vw] sm:max-w-[420px] transition-all duration-700 ease-in-out ${bannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl bg-white/10 backdrop-blur-xl md:backdrop-blur-2xl border border-white/15">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shine pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/5 via-purple-100/5 to-transparent pointer-events-none" />

          {showClose && (
            <button
              onClick={hideBanner}
              className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white text-lg font-bold shadow-md transition-all hover:scale-110 active:scale-95"
              aria-label="Close announcement"
            >
              ×
            </button>
          )}

          <div className="relative px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 text-center">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-1 bg-gradient-to-r from-pink-300/60 to-fuchsia-300/60 rounded-full blur-sm" />

            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-wide drop-shadow-md">
              Anniversary / Website Launch Sales
            </h3>

            <p className="text-base sm:text-lg md:text-xl font-semibold text-pink-300 mb-1 drop-shadow-sm">
              20–30% OFF
            </p>

            <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium mb-3 sm:mb-4">
              6th – 9th April, 2026
            </p>

            <div className="relative h-8 sm:h-9 md:h-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/40 via-fuchsia-500/40 to-purple-500/40 rounded-full border border-pink-300/40 shadow-inner backdrop-blur-md" />
              <div className="absolute inset-0 flex items-center whitespace-nowrap animate-ribbon-flow">
                <span className="text-xs sm:text-sm md:text-base font-medium text-white/95 tracking-wider px-16">
                  free delivery when you shop from N100,000 and above 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  free delivery when you shop from N100,000 and above 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  free delivery when you shop from N100,000 and above 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  free delivery when you shop from N100,000 and above 💅✨&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  free delivery when you shop from N100,000 and above 💅✨
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
        {!loading && allProducts.length === 0 && !error && (
          <p className="text-gray-500">No products available at the moment.</p>
        )}
      </div>

      {/* Paginated Product Grid */}
      {!loading && allProducts.length > 0 && (
        <>
          <div className="relative z-10 mt-10 px-2 sm:px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product, index) => {
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
                    <div className="relative w-full h-54 sm:h-64 md:h-72 flex items-center justify-center bg-black/10 overflow-hidden">
                      <Image
                        src={
                          product.images?.[0]
                            ? `${product.images[0]}?q_auto,f_auto,w_800,c_fill`
                            : '/images/fallback.jpg'
                        }
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={`object-contain transition-opacity duration-300 ${!inStock ? 'opacity-50 grayscale' : ''}`}
                        priority={index < 6}
                        loading={index >= 6 ? 'lazy' : undefined}
                        quality={75}
                        placeholder="blur"
                        blurDataURL={
                          product.images?.[0]
                            ? `${product.images[0]}?w=20&q=10`
                            : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                        }
                      />

                      <div className="absolute top-2 right-4 w-8 h-8 overflow-hidden rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                        <Image
                          src="/images/kikiLogo.jpg"
                          alt="Dkikishop Logo"
                          fill
                          className="object-cover"
                          sizes="48px"
                          loading="lazy"
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

          <div className="relative z-10 mt-12 flex justify-center gap-6 pb-12">
            {showLess && (
              <button
                onClick={seeLess}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                See Less
              </button>
            )}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className={`px-10 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${loadingMore ? 'animate-pulse' : ''}`}
              >
                {loadingMore ? 'Loading more...' : 'Load More'}
              </button>
            )}
          </div>

          {!hasMore && allProducts.length > 0 && (
            <p className="relative z-10 mt-6 text-center text-gray-400 pb-12">
              All products loaded
            </p>
          )}
        </>
      )}



      <footer className="relative z-10 mt-20 border-t border-yellow-400/20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          
          {/* Policies Grid */}
          <div className="grid grid-cols-1 align-middle sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-8 border-t border-b border-yellow-400/20">
            {/* Terms of Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center lg:text-left"
            >
              <div className="flex justify-center lg:justify-start mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Terms of Service</h3>
              <p className="text-gray-400 text-sm">
                By using DKIKISHOP, you agree to our terms and conditions. Read our full terms for details on usage and policies.
              </p>
              <Link href="/terms" className="text-yellow-400 text-sm hover:underline inline-block mt-2">
                Read Terms →
              </Link>
            </motion.div>

            {/* Delivery Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <div className="flex justify-center lg:justify-start mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Delivery Policy</h3>
              <p className="text-gray-400 text-sm">
                Fast shipping nationwide. Delivery within 2-3 business days. Free shipping on orders over ₦250,000.
              </p>
            </motion.div>

            {/* Refund Policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center lg:text-left"
            >
              <div className="flex justify-center lg:justify-start mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Refund Policy</h3>
              <p className="text-gray-400 text-sm">
                2-day return policy for unworn items in original condition. Full refund or exchange available.
              </p>
            </motion.div>

            {/* Contact & Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center lg:text-left"
            >
              <div className="flex justify-center lg:justify-start mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">24/7 Customer Support</h3>
              <p className="text-gray-400 text-sm">
                Questions? Our support team is here to help anytime. Email, chat, or call us.
              </p>
              <Link href="/Contact" className="text-yellow-400 text-sm hover:underline inline-block mt-2">
                Contact Us →
              </Link>
            </motion.div>
          </div>

          {/* Bottom Bar with Trademark and Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-sm text-gray-400">
            <p className="mb-4 sm:mb-0">
              © 2026 DKIKISHOP. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-yellow-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-yellow-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Bottom Bar with Trademark and Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-sm text-gray-400">

            <div className="flex items-center justify-center gap-4">
              <p className="mb-0 text-sm sm:text-base">
                Developed by: @smoovdev
              </p>
              <a href="https://instagram.com/smoovdev" target="_blank" rel="noopener noreferrer">
                <FaSquareInstagram className="text-2xl hover:text-yellow-400 transition-colors duration-200" />
              </a>
            </div>

          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-yellow-400/20">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Authentic Products</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Free Shipping for purchases over N200,000</span>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center gap-4 mt-6">
            <Link href="https://instagram.com/dkikishop_backup" className="text-gray-400 hover:text-yellow-400 transition-colors">
              <FaSquareInstagram className="text-2xl" />
            </Link>
            <Link href="https://maps.app.goo.gl/imu64pusYuhsyhzE6?g_st=ic" className="text-gray-400 hover:text-yellow-400 transition-colors">
              <BsFillGeoAltFill className="text-2xl" />
            </Link>
            <Link href="https://www.tiktok.com/@dkikishop" className="text-gray-400 hover:text-yellow-400 transition-colors">
              <FaSquareTiktok className="text-2xl" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}