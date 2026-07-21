'use client'

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import Navbar from '@/components/Navbar'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔒 STEP 1 — Admin authentication check
  useEffect(() => {
    const isLoggedIn =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_logged_in="))
        ?.split("=")[1] === "true"

    if (!isLoggedIn) {
      router.replace("/admin/login")
    } else {
      fetchOrders()
    }
  }, [])

  // 🔒 STEP 2 — Fetch orders securely
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: "GET",
        credentials: "include", // ensures cookies sent for auth
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to load orders")
      }

      setOrders(data.orders || [])
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p className="p-6 text-center">Loading orders...</p>

  return (
    <div className="min-h-screen px-4 py-6">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Admin Orders</h1>

      {orders.length === 0 ? (
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
