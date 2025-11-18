'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

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

        setProductData(json.data || [])
      } catch (err) {
        console.error('❌ API fetch failed:', err)
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    if (cat) fetchData()
  }, [cat])

  return (
    <div className="px-6 py-10 w-full">
      <Navbar />

      <h1 className="text-3xl font-bold text-center capitalize mb-6">
        Browse {cat}
      </h1>

      {loading && (
        <p className="text-center text-gray-500">⏳ Loading...</p>
      )}

      {error && (
        <p className="text-center text-red-500">🚫 {error}</p>
      )}

      {!loading && productData.length === 0 && !error && (
        <p className="text-center text-gray-500">No products found in this category.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productData.map((product, index) => (
          <Link
            key={product._id || index}
            href={`/product/${product._id}`}
            className="block rounded-2xl overflow-hidden shadow-lg border border-gray-200 transition-transform hover:scale-[1.02] bg-white"
          >
            <img
  src={
    product.images?.[0]
      ? product.images[0].startsWith('/')
        ? product.images[0]
        : `/${product.images[0]}`
      : product.image
        ? (product.image.startsWith('/') ? product.image : `/${product.image}`)
        : '/images/fallback.jpg'
  }
  alt={product.title || 'Product'}
  className="w-full h-70 object-cover rounded-4xl mb-2"
/>

            <div className="p-4 text-black">
              <h2 className="text-lg font-bold">{product.title}</h2>
              <p className="text-sm text-gray-700 mb-1 line-clamp-2">{product.description}</p>
              <p className="font-semibold text-green-700">
                ₦{Number(product.price).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Sizes: {Array.isArray(product.sizes) ? product.sizes.join(', ') : 'N/A'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
