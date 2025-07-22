'use client'
 
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function BlazersPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch('/api/getproducts/blazers')
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to fetch blazers')
        setProducts(json.data || [])
      } catch (err) {
        console.error('❌ Error:', err)
        setError('Failed to load blazers.')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#121212] text-white overflow-hidden px-6 py-20">
      {/* Faint floating logo background */}
      <div
        className="absolute inset-0 opacity-5 z-0 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url('/category/images/kikiLogo.jpg')` }}
      />

      <Navbar />

      {/* Page Heading */}
      <div className="relative z-10 text-center mt-8">
        <h1 className="text-4xl font-semibold text-white tracking-wide">
          Browse <span className="text-yellow-400">Blazers</span>
        </h1>
      </div>

      {/* Loading / Error / Empty */}
      <div className="relative z-10 mt-8 text-center">
        {loading && <p className="text-gray-400">⏳ Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-gray-400">No blazers found.</p>
        )}
      </div>

      {/* Product Cards */}
      <div className="relative z-10 mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              href={`/product/${product._id}`}
              className="block rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 bg-white/5 shadow-2xl hover:shadow-yellow-400/30 transition-shadow duration-300"
            >
              <img
                src={product.image || '/images/fallback.jpg'}
                alt={product.title}
                className="w-full h-60 object-cover rounded-t-3xl"
              />
              <div className="p-5 text-white">
                <h2 className="text-lg font-semibold mb-1">{product.title}</h2>
                <p className="text-sm text-gray-300 mb-2">{product.description}</p>
                <p className="text-yellow-400 font-bold text-base">
                  ₦{Number(product.price).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sizes: {product.sizes?.join(', ') || 'N/A'}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
