'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function BlazersPage() {
  const [productData, setProductData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch('/api/getproducts/blazers?available=true')
        const data = await res.json()

        if (!Array.isArray(data)) throw new Error('Invalid product format')

        const availableProducts = data.filter((product) =>
          product.isAvailable !== false &&
          (product.stock > 0 || product.quantity > 0)
        )

        setProductData(availableProducts)
      } catch (err) {
        console.error('❌ Error:', err)
        setError('Failed to fetch blazers')
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0c0c0c] text-white">
      {/* Cyber grid background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(#00ff8840 1px, transparent 1px), linear-gradient(90deg, #00ff8840 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Neon orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-fuchsia-600 rounded-full blur-[128px] opacity-20" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full blur-[128px] opacity-20" />

      <Navbar />

      {/* Header section with diagonal split */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 via-transparent to-cyan-600/20" />
        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6"
          >
            <span className="text-xs font-mono text-fuchsia-400 border border-fuchsia-400/30 px-3 py-1 rounded-full">
              COLLECTION_01
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-8xl md:text-9xl font-black tracking-tighter"
          >
            <span className="bg-gradient-to-r from-fuchsia-400 via-white to-cyan-400 bg-clip-text text-transparent">
              BLAZERS
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center gap-8 text-sm font-mono"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-fuchsia-400 animate-pulse" />
              <span className="text-fuchsia-400">LIVE</span>
            </div>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">12 PRODUCTS</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">SS24</span>
          </motion.div>
        </div>
      </div>

      {/* Filter bar - new element */}
      <div className="relative z-10 border-y border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              {['All', 'New', 'Popular', 'Limited'].map((filter) => (
                <button key={filter} className="text-gray-400 hover:text-fuchsia-400 transition-colors">
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Sort by:</span>
              <select className="bg-transparent border border-white/10 rounded px-3 py-1 text-gray-300">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status messages */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {loading && (
          <div className="flex items-center justify-center gap-4 py-32">
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        )}
        
        {error && (
          <div className="text-center py-32">
            <p className="text-red-400/80 bg-red-400/10 inline-block px-8 py-4 rounded-2xl border border-red-400/20">
              ⚡ {error}
            </p>
          </div>
        )}
      </div>

      {/* Product Grid - BOLDLY DIFFERENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productData.map((product, index) => {
            const isAvailable = product.isAvailable !== false
            const stock = product.stock || product.quantity || 0
            const inStock = isAvailable && stock > 0
            const lowStock = inStock && stock <= 5

            return (
              <Link href={`/product/${product._id}`} key={product._id || index} passHref>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Card with diagonal split background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                  
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
                    {/* Image container with unique shape */}
                    <div className="relative h-80 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                      
                      <Image
                        src={product.images?.[0] || '/images/fallback.jpg'}
                        alt={product.title}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                          !inStock ? 'opacity-40' : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />

                      {/* Stock badge - new style */}
                      <div className="absolute top-4 right-4 z-20">
                        {!inStock ? (
                          <span className="px-4 py-2 bg-red-600/90 text-white text-xs font-mono rounded-full border border-red-400/50">
                            SOLD OUT
                          </span>
                        ) : lowStock ? (
                          <span className="px-4 py-2 bg-amber-600/90 text-white text-xs font-mono rounded-full border border-amber-400/50">
                            ONLY {stock} LEFT
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-emerald-600/90 text-white text-xs font-mono rounded-full border border-emerald-400/50">
                            IN STOCK
                          </span>
                        )}
                      </div>

                      {/* Size tags overlay */}
                      <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                        {Array.isArray(product.sizes) && product.sizes.slice(0, 3).map((size) => (
                          <span key={size} className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full border border-white/20">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Product info - new layout */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-xl font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                          {product.title}
                        </h2>
                        <div className="text-right">
                          <p className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                            ₦{Number(product.price).toLocaleString()}
                          </p>
                          {lowStock && (
                            <p className="text-xs text-amber-400 font-mono mt-1">
                              ⚡ HURRY
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {product.description}
                      </p>

                      {/* Action buttons - new */}
                      <div className="flex gap-3">
                        <button className="flex-1 bg-white/10 hover:bg-fuchsia-600 border border-white/20 rounded-xl py-3 text-sm font-medium transition-all hover:scale-105">
                          Quick View
                        </button>
                        <button className="w-12 h-12 bg-white/10 hover:bg-cyan-600 border border-white/20 rounded-xl flex items-center justify-center transition-all hover:scale-105">
                          <span className="text-xl">♡</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Floating newsletter - new element */}
      <div className="sticky bottom-8 z-50 max-w-md mx-auto">
        <div className="bg-black/80 backdrop-blur-xl border border-fuchsia-400/30 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-fuchsia-400 font-mono">NEW DROPS →</span>
            <input 
              type="email" 
              placeholder="Get early access" 
              className="bg-transparent border-b border-white/20 px-2 py-1 text-sm text-white placeholder-gray-600 focus:border-fuchsia-400 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}