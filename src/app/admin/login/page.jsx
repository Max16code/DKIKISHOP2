'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔐 Auto-redirect if already logged in
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("admin_logged_in="))

    const isLoggedIn = cookie?.split("=")[1] === "true"

    if (isLoggedIn) {
      router.replace("/admin/dashboard")
    }
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Wrong password")
        setLoading(false)
        return
      }

      // 🔐 Set cookie for 1 hour
      document.cookie = "admin_logged_in=true; path=/; max-age=3600"

      router.replace("/admin/dashboard")
    } catch (err) {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto mt-20 bg-gray-900 text-white rounded-lg shadow-lg">

      <h1 className="text-xl font-bold mb-4">Admin Login</h1>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="w-full p-2 rounded mb-4 text-black"
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full p-2 rounded ${
          loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Checking..." : "Login"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
