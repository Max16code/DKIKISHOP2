'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import useAdminAuthRedirect from '@/hooks/useAdminAuthRedirect'
import AdminRouteWrapper from '@/components/AdminRouteWrapper'


export default function ManageProductsPage() {
 
 const loading = useAdminAuthRedirect()
  if (loading) return null
  const [products, setProducts] = useState([]);
const [showSuccess, setShowSuccess] = useState(false);


useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin !== 'true') {
      router.replace('/admin/login')
      return
    }
    setLoading(false)
  }, [])

  if (loading) return null 



  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/getproducts/all') // adjust if your route differs
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error('Failed to load products', err)
      }
    }

    fetchProducts()
  }, [])

  // Delete handler
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this product?')
    if (!confirm) return

    try {
      const res = await fetch(`/api/deleteproduct/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        alert('Product deleted successfully')
        // Refresh the list
        setProducts(products.filter((product) => product._id !== id))
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg p-4 flex flex-col items-center"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-32 h-32 object-cover mb-2"
                />
                <h2 className="font-semibold">{product.title}</h2>
                <p className="text-sm text-gray-500">{product.category}</p>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
