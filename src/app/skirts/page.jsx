'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'  // ✅ Import added



export default function SkirtsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // ✅ ADD STOCK FILTER: 'available=true'
        const res = await fetch('/api/getproducts/skirts?available=true')
        const products = await res.json()

        // ✅ HANDLE BOTH RESPONSE FORMATS:
        // Old format: { success: true, data: [...] }
        // New format: [...] (array directly)

        let productArray = [];

        if (Array.isArray(products)) {
          // New format: API returns array directly
          productArray = products;
        } else if (products?.success && Array.isArray(products.data)) {
          // Old format: API returns { success: true, data: [...] }
          productArray = products.data;
        } else {
          throw new Error('Invalid response format from API')
        }

        // ✅ CLIENT-SIDE BACKUP FILTER (for safety)
        const availableProducts = productArray.filter(product =>
          product.isAvailable !== false &&
          (product.stock > 0 || product.quantity > 0)
        )

        setProducts(availableProducts)
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white px-6 py-10">
      <Navbar />
      <h1 className="text-4xl font-semibold text-center mb-10 text-white/90">
        Browse <span className="text-pink-500">Skirts</span>
      </h1>

      {loading && (
        <p className="text-center text-gray-400 animate-pulse">⏳ Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all shadow-lg hover:shadow-pink-500/30"
          >
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-contain rounded-xl"
            />



            <div className="p-4">
              <h2 className="text-xl font-semibold text-white/90 group-hover:text-pink-400">
                {product.title}
              </h2>
              <p className="text-sm text-gray-400 line-clamp-2">
                {product.description}
              </p>
              <p className="text-lg font-bold text-green-400 mt-2">
                ₦{Number(product.price).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sizes: {product.sizes?.join(', ') || 'N/A'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
