'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  // ✅ Check if admin is logged in
  useEffect(() => {
    const isLoggedIn = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_logged_in="))
      ?.split("=")[1] === "true"

    if (!isLoggedIn) {
      router.replace("/admin/login")
    } else {
      fetchProducts()
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/getproducts/all")
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error("❌ Failed to fetch products:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/deleteproduct/${id}`, { method: "DELETE" })
      const result = await res.json()

      if (!res.ok) throw new Error(result.message)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      fetchProducts()
    } catch (err) {
      alert("Failed to delete product")
    }
  }
  const handleLogout = () => {
    document.cookie = "admin_logged_in=false; path=/; max-age=0" // clear cookie
    router.replace("/admin/login") // redirect
  }


  if (loading) return <p className="text-center py-10">Loading...</p>

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
        <h2 className="text-xl font-semibold mb-4">All Uploaded Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border rounded p-3 relative">
                <img
                  src={product.images?.[0] || product.image || '/images/fallback.jpg'}
                  alt={product.title}
                  className="w-full h-40 object-cover mb-2 rounded"
                />

                <h3 className="font-bold text-lg">{product.title}</h3>
                <p className="text-sm text-gray-600">₦{product.price}</p>
                <p className="text-xs text-gray-500">{product.category}</p>

                <button
                  onClick={() => handleDelete(product._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>

                <Link href={`/admin/edit/${product._id}`}>
                  <button className="bg-blue-500 text-white text-xs px-3 py-1 rounded mt-2 hover:bg-blue-600">
                    Edit
                  </button>
                </Link>
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
