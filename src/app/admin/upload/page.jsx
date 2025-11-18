'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [imageInput, setImageInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔒 Check admin cookie before rendering page
  useEffect(() => {
    const isLoggedIn = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_logged_in='))
      ?.split('=')[1] === 'true';

    if (!isLoggedIn) {
      router.replace('/admin/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !sizes || !category || images.length === 0) {
      setMessage('❌ All fields are required.');
      return;
    }

    // ✅ Normalize image paths before sending
    const normalizedImages = images.map(img => {
      if (img.startsWith('http')) return img; // external URL
      if (!img.startsWith('/')) return `/${img.trim()}`; // ensure leading slash
      return img.trim();
    });

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
          images: normalizedImages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Product uploaded successfully.');
        setTitle('');
        setDescription('');
        setPrice('');
        setSizes('');
        setCategory('');
        setImages([]);
      } else {
        setMessage(`❌ ${data.error || 'Something went wrong.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to upload product.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <Navbar />

      {/* Sign Out Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            document.cookie = "admin_logged_in=false; path=/; max-age=0";
            router.replace("/admin/login");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Upload Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4 placeholder:text-shadow-white">
          <input type="text" placeholder="Title" className="w-full border p-2 rounded"
            value={title} onChange={e => setTitle(e.target.value)} />

          <textarea placeholder="Description" className="w-full border p-2 rounded"
            value={description} onChange={e => setDescription(e.target.value)} />

          <input type="number" placeholder="Price (₦)" className="w-full border p-2 rounded"
            value={price} onChange={e => setPrice(e.target.value)} />

          <input type="text" placeholder="Sizes (comma separated)" className="w-full border p-2 rounded"
            value={sizes} onChange={e => setSizes(e.target.value)} />

          <input type="text" placeholder="Category (e.g. blazers)" className="w-full border p-2 rounded"
            value={category} onChange={e => setCategory(e.target.value)} />

          <div>
            <input
              type="text"
              placeholder="Enter image URL or filename (must exist in /public)"
              className="w-full border p-2 rounded mb-2"
              value={imageInput}
              onChange={e => setImageInput(e.target.value)}
            />
            <button
              type="button"
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => {
                if (imageInput.trim()) {
                  setImages(prev => [...prev, imageInput.trim()]);
                  setImageInput('');
                }
              }}
            >
              Add Image
            </button>

            {/* ✅ Live Preview */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, index) => {
                const src = img.startsWith('http') ? img : img.startsWith('/') ? img : `/${img}`;
                return (
                  <img
                    key={index}
                    src={src}
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover rounded border border-gray-400"
                  />
                );
              })}
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-gray-800">
            Upload Product
          </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
