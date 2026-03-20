'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SearchSection from '@/components/SearchSection'
import ProductImageCarousel from '@/components/ProductImageCarousel'

const ITEMS_PER_PAGE = 16

export const dynamic = 'force-dynamic'

export default function CategoryPage() { // 👈 remove the params prop
  const params = useParams() // 👈 get params with hook
  const { cat } = params // 👈 destructure cat

  const [allProducts, setAllProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showLess, setShowLess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/getproducts/${cat}`)
        const json = await res.json()

        console.log('✅ API result:', json)

        if (!json.success) {
          setError(json.error || 'Something went wrong')
          return
        }

        const products = json.products || []
        const availableProducts = products.filter(product =>
          product.isAvailable !== false &&
          (product.stock > 0 || product.quantity > 0)
        )

        setAllProducts(availableProducts)
        setDisplayedProducts(availableProducts.slice(0, ITEMS_PER_PAGE))
        setHasMore(availableProducts.length > ITEMS_PER_PAGE)
      } catch (err) {
        console.error('❌ API fetch failed:', err)
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    if (cat) fetchData()
  }, [cat])

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

  // Format category name for display
  const categoryName = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : ''

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

      {/* Title */}
      <div className="relative z-10 text-center mt-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide">
          Browse{' '}
          <span className="text-yellow-400">{categoryName}</span>
        </h1>
        <p className="mt-2 text-gray-400">Luxury on a Budget</p>
      </div>

      {/* Status Messages */}
      <div className="relative z-10 mt-10 px-6 text-center">
        {loading && <p className="text-gray-500">Loading {categoryName}...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && allProducts.length === 0 && !error && (
          <p className="text-gray-500">No products found in this category.</p>
        )}
      </div>

      {/* Paginated Product Grid */}
      {!loading && allProducts.length > 0 && (
        <>
          <div className="relative z-10 mt-10 px-2 sm:px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 pb-20">
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
                        priority={index < 6}                      // eager + preloading for first 6
                        loading={index >= 6 ? "lazy" : undefined} // lazy only after the first 6
                        quality={75}
                        placeholder="blur"
                        blurDataURL={
                          product.images?.[0]
                            ? `${product.images[0]}?w=20&q=10`
                            : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                        }
                      />

                      {/* Logo overlay */}
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

                      {/* Stock badges */}
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

          {/* Pagination Controls */}
          <div className="relative z-10 mt-12 flex justify-center gap-6 pb-20">
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
            <p className="relative z-10 mt-6 text-center text-gray-400 pb-20">
              All {categoryName} products loaded
            </p>
          )}
        </>
      )}
    </div>
  )
}