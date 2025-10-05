'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [sizes, setSizes] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true) // ✅ track cookie check

  // 🔒 Check admin cookie before rendering page
  useEffect(() => {
    const isLoggedIn = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_logged_in='))
      ?.split('=')[1] === 'true'

    if (!isLoggedIn) {
      router.replace('/admin/login')
    } else {
      setLoading(false)
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !price || !sizes || !category || !image) {
      setMessage('❌ All fields are required.')
      return
    }

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price,
          sizes: sizes.split(',').map(s => s.trim()),
          category,
          image,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Product uploaded successfully.')
        setTitle('')
        setDescription('')
        setPrice('')
        setSizes('')
        setCategory('')
        setImage('')
      } else {
        setMessage(`❌ ${data.error || 'Something went wrong.'}`)
      }
    } catch (err) {
      setMessage('❌ Failed to upload product.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <Navbar />

      {/* Sign Out Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            document.cookie = "admin_logged_in=false; path=/; max-age=0"
            router.replace("/admin/login")
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Upload Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4 placeholder:text-shadow-white">
          <input type="text" placeholder="Title" className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea placeholder="Description" className="w-full border p-2 rounded" value={description} onChange={e => setDescription(e.target.value)} />
          <input type="number" placeholder="Price (₦)" className="w-full border p-2 rounded" value={price} onChange={e => setPrice(e.target.value)} />
          <input type="text" placeholder="Sizes (comma separated)" className="w-full border p-2 rounded" value={sizes} onChange={e => setSizes(e.target.value)} />
          <input type="text" placeholder="Category (e.g. blazers)" className="w-full border p-2 rounded" value={category} onChange={e => setCategory(e.target.value)} />
          <input type="text" placeholder="Image URL" className="w-full border p-2 rounded" value={image} onChange={e => setImage(e.target.value)} />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-gray-800">Upload Product</button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  )
}
