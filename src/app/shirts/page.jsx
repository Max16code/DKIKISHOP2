'use client'


export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'  // ✅ Import added


export default function ShirtsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch('/api/getproducts/shirts')
        const json = await res.json()

        if (!json.success) throw new Error(json.error || 'Failed to fetch shirts')
        setProducts(json.data || [])
      } catch (err) {
        console.error('❌ Error:', err)
        setError('Failed to load shirts.')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [])

  return (

    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('/category/images/kikiLogo.jpg')] bg-cover bg-center blur-sm z-0" />
      <div className="relative z-10 px-4 sm:px-6 py-10">
        <Navbar />

        <h1 className="text-center text-4xl font-extrabold mb-8 text-white drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.3)]">
          Explore <span className="text-[#00FFC2]">Shirts</span>
        </h1>

        {loading && (
          <p className="text-center text-gray-400 animate-pulse">⏳ Loading...</p>
        )}
        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.015]"
            >
             {/* ✅ Use ProductImage component */}
                           <ProductImage product={product} />


              <div className="p-4 text-white">
                <h2 className="text-xl font-semibold group-hover:text-[#00FFC2] transition">
                  {product.title}
                </h2>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-[#00FF88] font-bold mt-1">
                  ₦{Number(product.price).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sizes: {product.sizes?.join(', ') || 'N/A'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
