'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  const [productData, setProductData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
  const getProducts = async () => {
    try {
      const res = await fetch('/api/getproducts/all')
      const data = await res.json()

      // ✅ If the API directly returns an array
      if (!Array.isArray(data)) throw new Error('Invalid product format')

      setProductData(data)
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
      <div
        className="absolute inset-0 opacity-5 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/kikiLogo.jpg')` }}
      />

      <Navbar />

      {/* Title */}
      <div className="relative z-10 text-center mt-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide">
          Welcome to <span className="text-yellow-400">DKIKISHOP</span>
        </h1>
        <p className="mt-2 text-gray-400">Luxury on a Budget</p>
      </div>

      {/* Status Messages */}
      <div className="relative z-10 mt-10 px-6 text-center">
        {loading && <p className="text-gray-500">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && productData.length === 0 && !error && (
          <p className="text-gray-500">No products found.</p>
        )}
      </div>

      {/* Product Grid */}
      <div className="relative z-10 mt-10 px-2 sm:px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productData.map((product, index) => (
          <Link href={`/product/${product._id}`} key={product._id || index} passHref>
            <motion.div
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer shadow-md hover:shadow-md hover:shadow-yellow-500/20 transition-shadow duration-300"
            >
              <img
                src={product.image || '/images/fallback.jpg'}
                alt={product.title || 'Product'}
                className="w-full h-70 object-cover rounded-4xl mb-2"
              />
              <h2 className="text-sm sm:text-base font-semibold text-white">
                {product.title}
              </h2>
              <p className="text-xs text-gray-400">{product.description}</p>
              <p className="text-yellow-400 font-bold text-sm mt-1">
                ₦{Number(product.price).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Sizes:{' '}
                {Array.isArray(product.sizes) && product.sizes.length > 0
                  ? product.sizes.join(', ')
                  : 'N/A'}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}