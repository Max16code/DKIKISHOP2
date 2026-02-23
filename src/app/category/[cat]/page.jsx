'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function CategoryPage() {
  const { cat } = useParams()

  const [productData, setProductData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/getproducts/${cat}`)
        const json = await res.json()

        console.log('✅ API result:', json)

        if (!json.success) {
          setError(json.error || 'Something went wrong')
          return
        }

        setProductData(json.products || [])

      } catch (err) {
        console.error('❌ API fetch failed:', err)
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    if (cat) fetchData()
  }, [cat])

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

      {/* Title */}
      <div className="relative z-10 text-center mt-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide">
          Browse{' '}
          <span className="text-yellow-400">
            {categoryName}
          </span>
        </h1>
        <p className="mt-2 text-gray-400">Luxury on a Budget</p>
      </div>

      {/* Status Messages */}
      <div className="relative z-10 mt-10 px-6 text-center">
        {loading && <p className="text-gray-500">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && productData.length === 0 && !error && (
          <p className="text-gray-500">No products found in this category.</p>
        )}
      </div>

      {/* Product Grid - EXACT HOMEPAGE STYLE */}
      <div className="relative z-10 mt-10 px-2 sm:px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap- sm:gap-6 pb-20">
        {productData.map((product, index) => {
          // Calculate stock status
          const isAvailable = product.isAvailable !== false;
          const stock = product.stock || product.quantity || 0;
          const inStock = isAvailable && stock > 0;
          const lowStock = inStock && stock <= 5;

          return (
            <Link href={`/product/${product._id}`} key={product._id || index} passHref>
              <motion.div
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`flex flex-col cursor-pointer shadow-md hover:shadow-yellow-500/20 transition-shadow duration-300 relative rounded-lg overflow-hidden ${!inStock ? 'opacity-70' : ''}`}
              >
                {/* Product Image */}
                <div className="relative w-full h-54 sm:h-64 md:h-72 flex items-center justify-center bg-black/10">
                  <Image
                    src={product.images?.[0] || '/images/fallback.jpg'}
                    alt={product.title}
                    fill
                    className={`object-contain transition-opacity duration-300 ${!inStock ? 'opacity-50 grayscale' : ''}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={index < 6}
                  />

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

                  {/* Out of stock overlay */}
                  {!inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold z-5">
                      Unavailable
                    </div>
                  )}
                </div>

                {/* Product Info */}
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

                  {/* Stock Indicator */}
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