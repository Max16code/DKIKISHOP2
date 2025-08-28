'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import useAdminAuthRedirect from '@/hooks/useAdminAuthRedirect'
import AdminRouteWrapper from '@/components/AdminRouteWrapper'


// 🔒 Safer auth hook (no crash from localStorage in server context)
function useAdminAuthRedirectSafe() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin !== 'true') {
      window.location.href = '/' // redirect to home or login
    } else {
      setLoading(false)
    }
  }, [])

  return loading
}

export default function AdminOrdersPage() {
  const loading = useAdminAuthRedirectSafe()
  const [orders, setOrders] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const text = await res.text()

        // ✅ Handle empty or invalid JSON response
        if (!text) {
          setOrders([])
          return
        }

        const data = JSON.parse(text)
        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (err) {
        console.error('❌ Failed to fetch orders:', err)
        setError('Something went wrong while loading orders.')
      } finally {
        setFetching(false)
      }
    }

    if (!loading) {
      fetchOrders()
    }
  }, [loading])

  if (loading || fetching) {
    return (
      <div className="min-h-screen px-4 py-6">
        <Navbar />
        <p>Loading orders...</p>
      </div>
    )
  }

  return (

    
    <div className="min-h-screen px-4 py-6">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order, idx) => (
            <li key={idx} className="p-4 border rounded shadow">
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Total:</strong> ₦{order.total}</p>
              <p><strong>Items:</strong></p>
              <ul className="list-disc pl-5">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.title} - Size: {item.size} - ₦{item.price}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
