'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    // ✅ Check against env var (create NEXT_PUBLIC_ADMIN_PASSWORD in .env.local)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      // ✅ Set cookie for 1 hour
      document.cookie = "admin_logged_in=true; path=/; max-age=3600"
      router.replace("/admin/dashboard")
    } else {
      setError("Wrong password")
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
      />
      <button
        onClick={handleLogin}
        className="w-full bg-green-600 hover:bg-green-700 p-2 rounded"
      >
        Login
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
