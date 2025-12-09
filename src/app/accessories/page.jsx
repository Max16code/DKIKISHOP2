'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import ProductImage from '@/components/ProductImage'  // ✅ Import added


export default function AccessoriesPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch('/api/getproducts/accessories')
        const data = await res.json()

        if (!data.success) throw new Error(data.error || 'Failed to fetch accessories')
        setProducts(data.data || [])
      } catch (err) {
        console.error('❌ Error:', err)
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
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
          <span className="text-yellow-400">Accessories</span> Collection
        </h1>
        <p className="mt-2 text-gray-400">Step out with confidence</p>
      </div>

      {/* Status Messages */}
      <div className="relative z-10 mt-10 px-6 text-center">
        {loading && <p className="text-gray-500">Loading accessories...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && products.length === 0 && !error && (
          <p className="text-gray-500">No accessories found.</p>
        )}
      </div>

      {/* Product Grid */}
      <div className="relative z-10 px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id || index}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 bg-white/5 shadow-2xl hover:shadow-yellow-400/30 transition-shadow duration-300"
          >
           {/* ✅ Product Image with fallback */}
                       <ProductImage
                         product={product}
                         fallback="/images/placeholder.jpg" // ⚠️ fallback image for broken URLs
                       />



            <div className="p-5 text-white">
              <h2 className="text-lg font-semibold mb-1">{product.title}</h2>
              <p className="text-sm text-gray-300 mb-2">{product.description}</p>
              <p className="text-yellow-400 font-bold text-base">
                ₦{Number(product.price).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sizes:{' '}
                {Array.isArray(product.sizes) && product.sizes.length > 0
                  ? product.sizes.join(', ')
                  : 'N/A'}
              </p>

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
