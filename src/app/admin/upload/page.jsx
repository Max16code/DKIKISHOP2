'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from "next/navigation";

const allowedCategories = ["blazers", "shirts", "skirts", "dresses", "activewears", "jeans", "shorts", "accessories"];

export default function UploadPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 🔒 Admin check
  useEffect(() => {
    const isLoggedIn =
      document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_logged_in='))?.split('=')[1] === 'true';

    if (!isLoggedIn) router.replace('/admin/login');
    else setLoading(false);
  }, [router]);

  // 🔹 Cleanup object URLs
  useEffect(() => {
    return () => {
      imageFiles.forEach(file => URL.revokeObjectURL(file));
    };
  }, [imageFiles]);

  // -------------------- Upload images to Cloudinary --------------------
  const uploadImagesToCloudinary = async () => {
    const urls = [];

    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || 'Cloudinary upload failed');

        urls.push(data.secure_url);
      } catch (err) {
        console.error('❌ Cloudinary upload error:', err);
        throw new Error('Image upload failed');
      }
    }

    return urls;
  };

  // -------------------- Handle form submission --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!title || !description || !price || !sizes || !category || imageFiles.length === 0) {
      setMessage('❌ All fields including at least one image are required.');
      return;
    }

    if (!allowedCategories.includes(category.toLowerCase())) {
      setMessage(`❌ Invalid category. Must be: ${allowedCategories.join(', ')}`);
      return;
    }

    try {
      setUploading(true);

      // 1️⃣ Upload images to Cloudinary
      const imageUrls = await uploadImagesToCloudinary();
      setUploadedImageUrls(imageUrls);

      // 2️⃣ Send JSON payload to backend
      const payload = {
        title,
        description,
        price: Number(price),
        sizes: sizes.split(',').map(s => s.trim()),
        category: category.toLowerCase(),
        quantity: Number(quantity),
        images: imageUrls
      };

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Product uploaded successfully.");

        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setSizes('');
        setCategory('');
        setQuantity(1);
        setImageFiles([]);
        setUploadedImageUrls([]);
      } else {
        setMessage(`❌ ${data.error || 'Something went wrong.'}`);
      }

    } catch (err) {
      console.error("❌ Upload error:", err);
      setMessage("❌ Failed to upload product.");
    } finally {
      setUploading(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" className="w-full border p-2 rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full border p-2 rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input type="number" className="w-full border p-2 rounded" placeholder="Price (₦)" value={price} onChange={e => setPrice(e.target.value)} />
          <input type="text" className="w-full border p-2 rounded" placeholder="Sizes (comma separated)" value={sizes} onChange={e => setSizes(e.target.value)} />
          <input type="text" className="w-full border p-2 rounded" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <input type="number" min="0" className="w-full border p-2 rounded" placeholder="Quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />

          <div>
            <p className="mb-1">Upload Product Images:</p>
            <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles([...e.target.files])} className="w-full border p-2 rounded bg-gray-900" />
            <div className="flex gap-3 mt-3 flex-wrap">
              {imageFiles.map((file, index) => (
                <img key={index} src={URL.createObjectURL(file)} className="w-24 h-24 object-cover rounded border border-gray-500" />
              ))}
            </div>
          </div>

          <button type="submit" disabled={uploading} className={`w-full py-2 rounded text-white ${uploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-gray-800'}`}>
            {uploading ? 'Uploading...' : 'Upload Product'}
          </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
