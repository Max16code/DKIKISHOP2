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
      setError(null)

      // Use ?limit=0 to get ALL products (bypasses the 50 default in your API)
      const res = await fetch("/api/getproducts/all?limit=0&available=true", {
        credentials: "include"
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const json = await res.json()
      // console.log('Full Dashboard API response:', json)

      // Handle different possible response shapes
      let productList = []
      if (json.success && Array.isArray(json.products)) {
        productList = json.products
      } else if (Array.isArray(json)) {
        productList = json
      } else if (json && Array.isArray(json.data)) {
        productList = json.data
      } else {
        throw new Error('Unexpected API response format - check console')
      }

      // Apply the exact same availability filter as the homepage
      const availableProducts = productList.filter(product => 
        product.isAvailable !== false &&
        (Number(product.stock || product.quantity || 0) > 0)
      )

      // console.log('Total available products loaded:', availableProducts.length)
      // console.log('Categories present:', [...new Set(availableProducts.map(p => p.category))])

      setProducts(availableProducts)
    } catch (err) {
      console.error("Failed to fetch all products:", err)
      setError("Failed to load products: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await fetch(`/api/deleteproduct/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.message || "Delete failed")

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      fetchProducts() // refresh list
    } catch (err) {
      alert("Failed to delete product: " + err.message)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include"
    })
    router.replace("/admin/login")
  }

  if (loading) {
    return <p className="text-center py-10 text-gray-400">Loading all products...</p>
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <div className="mb-6">
        <Link href="/admin/upload">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Upload New Product
          </button>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          All Available Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No available products yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="border rounded p-3 relative bg-white/5 hover:bg-white/10 transition"
              >
                <div className="relative w-full h-40 flex items-center justify-center bg-black/10 overflow-hidden rounded mb-2">
                  <Image
                    src={product.images?.[0] || product.image || '/images/fallback.jpg'}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <h3 className="font-bold text-lg line-clamp-1">{product.title}</h3>
                <p className="text-sm text-gray-600">₦{Number(product.price).toLocaleString()}</p>
                <p className="text-xs text-gray-500 capitalize">{product.category}</p>

                <div className="flex gap-2 mt-3">
                  <Link href={`/admin/edit/${product._id}`}>
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>

                {product.stock <= 0 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    Out of Stock
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSuccess && (
        <p className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow">
          Product deleted successfully!
        </p>
      )}
    </div>
  )
}