// src/app/admin/dashboard/ClientDashboard.jsx
'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from 'next/image'

export default function ClientDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/getproducts/all?available=true', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()

      console.log('Dashboard fetch result:', data)

      // Handle different possible response shapes from your API
      let productList = []
      if (Array.isArray(data)) {
        productList = data
      } else if (data && Array.isArray(data.products)) {
        productList = data.products
      } else if (data && Array.isArray(data.data)) {
        productList = data.data
      } else {
        throw new Error('Invalid product data format')
      }

      // Filter only available/in-stock products (same as homepage)
      const available = productList.filter(p => 
        p.isAvailable !== false && (p.stock > 0 || p.quantity > 0)
      )

      setProducts(available)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/deleteproduct/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.message || 'Delete failed')

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      fetchProducts() // refresh list
    } catch (err) {
      alert('Failed to delete product: ' + err.message)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include'
    })
    router.replace('/admin/login')
  }

  if (loading) {
    return <p className="text-center py-10 text-gray-400">Loading all products...</p>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <Link href="/admin/upload">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            + Upload New Product
          </button>
        </Link>
      </div>

      {error && (
        <p className="text-red-500 text-center mb-6">{error}</p>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-white">
          All Available Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No available products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const stock = product.stock || product.quantity || 0
              const inStock = stock > 0

              return (
                <div 
                  key={product._id} 
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-yellow-500/30 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="relative aspect-square bg-black/20">
                    <Image
                      src={product.images?.[0] || '/images/fallback.jpg'}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-white line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-yellow-400 font-bold mt-1">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 capitalize">
                      {product.category}
                    </p>

                    <div className="mt-3 flex gap-3">
                      <Link href={`/admin/edit/${product._id}`}>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded transition">
                          Edit
                        </button>
                      </Link>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded transition"
                      >
                        Delete
                      </button>
                    </div>

                    {!inStock && (
                      <div className="mt-3 text-xs text-red-400 font-medium">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-fade-in-out">
          Product deleted successfully!
        </div>
      )}
    </div>
  )
}