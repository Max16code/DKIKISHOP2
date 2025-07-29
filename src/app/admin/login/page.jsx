'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    console.log(res)

    if (res.ok) {
      console.log('✅ Login success')
      localStorage.setItem('isAdmin', 'true')
      router.replace('/admin/dashboard') // 👈 this MUST match your folder structure
      
    } else {
      const err = await res.json()
      console.log('❌ Login failed:', err)
      setError(err.error || 'Unauthorized')
    }
  }

  return (
    <div className="p-4">
      <h1>Admin Login</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="border px-2 py-1"
      />
      <button onClick={handleLogin} className="bg-black text-white px-4 py-1 ml-2">Login</button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
