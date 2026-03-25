// src/app/admin/dashboard/ClientDashboard.jsx
'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from 'next/image'
import { useShutdown } from '@/hooks/useShutDown'
import ShutdownButton from '@/components/Admin/ShutDownButton'
import TwopiecePage from "@/app/twopiece/page"

const CATEGORIES = [
  'blazers', 'tops', 'skirts', 'dresses', 'activewears',
  'jeans', 'shorts', 'accessories', 'twopiece'
]

export default function ClientDashboard() {
  const router = useRouter()
  const [allProducts, setAllProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Shutdown state
  const { shutdown, loading: shutdownLoading } = useShutdown()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/getproducts/all?limit=0&available=true", {
        credentials: "include"
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const json = await res.json()

      let productList = []
      if (json.success && Array.isArray(json.products)) {
        productList = json.products
      } else if (Array.isArray(json)) {
        productList = json
      } else {
        throw new Error('Unexpected API response format')
      }

      const availableProducts = productList.filter(product =>
        product.isAvailable !== false &&
        (Number(product.stock || product.quantity || 0) > 0)
      )

      setAllProducts(availableProducts)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setError("Failed to load products. Please try again.")
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
      fetchProducts()
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

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? allProducts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
    : allProducts

  // Group products by category for preview
  const productsByCategory = CATEGORIES.map(cat => {
    const catProducts = allProducts.filter(p => p.category?.toLowerCase() === cat.toLowerCase())
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      products: catProducts.slice(0, 3), // only 3 preview
      total: catProducts.length
    }
  })

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
      <div className="">
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 flex items-center gap-2 font-bold text-black  bg-amber-400 py-1.5 px-1.5 rounded-3xl hover:text-white transition-colors text-sm "
          aria-label="Go back to main website"
        >
          ← Back to Home
        </button>
      </div>

      {/* Shutdown control card */}
      {!shutdownLoading && (
        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Store Shutdown Control</h2>
              <p className="text-sm text-gray-400">
                {shutdown
                  ? 'Purchases are currently disabled. Customers cannot buy anything.'
                  : 'Purchases are enabled. Toggle to disable all purchases (e.g., for maintenance).'}
              </p>
            </div>
            <div>
              <ShutdownButton initialShutdown={shutdown} />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/upload">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Upload New Product
          </button>
        </Link>
      </div>

      {/* Category Buttons */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory
            ? 'bg-yellow-500 text-black'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
        >
          All Categories
        </button>

        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition capitalize ${selectedCategory === cat
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {showSuccess && (
        <p className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          Product deleted successfully!
        </p>
      )}

      {/* Content Area */}
      {selectedCategory ? (
        // Selected category view – show all products in this category
        <div>
          <h2 className="text-2xl font-semibold mb-6 capitalize">
            {selectedCategory} ({filteredProducts.length})
          </h2>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products in this category.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onDelete={() => handleDelete(product._id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // All categories preview mode – show 3 per category
        <div className="space-y-12">
          {productsByCategory.map(({ category, products, total }) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold capitalize">
                  {category} ({total})
                </h2>
                {total > 3 && (
                  <button
                    onClick={() => setSelectedCategory(category.toLowerCase())}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                  >
                    View All →
                  </button>
                )}
              </div>

              {products.length === 0 ? (
                <p className="text-gray-500">No products in this category.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onDelete={() => handleDelete(product._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Reusable Product Card Component
function ProductCard({ product, onDelete }) {
  const stock = Number(product.stock || product.quantity || 0)
  const inStock = stock > 0

  return (
    <div
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
          onClick={onDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>

      {!inStock && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
          Out of Stock
        </div>
      )}
    </div>
  )
}