'use client'

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from "next/navigation";

const allowedCategories = ["blazers", "tops", "shirts", "skirts", "dresses", "activewears", "jeans", "shorts", "accessories", "twopiece", "linen"];

export default function UploadForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState('');
  const [category, setCategory] = useState('');
  const [section, setSection] = useState('thrift');
  const [quantity, setQuantity] = useState(1);

  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imageFiles.forEach(file => URL.revokeObjectURL(file));
    };
  }, [imageFiles]);

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
        console.error('Cloudinary upload error:', err);
        throw new Error('Image upload failed');
      }
    }

    return urls;
  };

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

      // Upload images
      const imageUrls = await uploadImagesToCloudinary();
      setUploadedImageUrls(imageUrls);

      // Send to backend
      const payload = {
        title,
        description,
        price: Number(price),
        sizes: sizes.split(',').map(s => s.trim()),
        category: category.toLowerCase(),
        section: section,
        quantity: Number(quantity),
        images: imageUrls,
        shopId: '697780d848d182949a9fc132'
      };

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY
        },
        body: JSON.stringify(payload),
        credentials: 'include'
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
        setSection('thrift');
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

  return (
    <>
      <div className="">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="absolute top-6 left-6 mt-20 flex items-center gap-2 font-bold text-black bg-amber-400 py-1.5 px-3 rounded-3xl hover:bg-amber-500 hover:text-white transition-colors text-sm z-50"
          aria-label="Go back to main website"
        >
          ← dashboard
        </button>
      </div>
      <Navbar />

      <div className="flex justify-end mb-4">
        <button
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
            router.replace("/admin/login");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 font-bold"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto mt-8 pb-20">
        <h1 className="text-2xl font-bold mb-6 text-white">Upload Product</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ✅ All inputs are now dark with white text and gray placeholders */}
          <input 
            type="text" 
            className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" 
            placeholder="Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <textarea 
            className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" 
            placeholder="Description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows="3"
          />
          <input 
            type="number" 
            className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" 
            placeholder="Price (₦)" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
          />
          <input 
            type="text" 
            className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" 
            placeholder="Sizes (comma separated e.g. S, M, L)" 
            value={sizes} 
            onChange={e => setSizes(e.target.value)} 
          />
          
          <select 
            className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white focus:outline-none focus:border-amber-400"
            value={category} 
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {allowedCategories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>

          {/* ✅ Section Selection */}
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <label className="block text-sm font-bold mb-2 text-amber-400">Where should this product appear?</label>
            <select 
              className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white focus:outline-none focus:border-amber-400"
              value={section} 
              onChange={e => setSection(e.target.value)}
            >
              <option value="thrift">Thrift Collection</option>
              <option value="brandNew">Brand New Collection</option>
            </select>
          </div>

          <input 
            type="number" 
            min="0" 
            className="w-full border border-gray-600 p-3 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400" 
            placeholder="Quantity" 
            value={quantity} 
            onChange={e => setQuantity(Number(e.target.value))} 
          />

          <div className="border border-gray-600 p-4 rounded bg-gray-900">
            <p className="mb-2 text-white font-bold">Upload Product Images:</p>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => setImageFiles([...e.target.files])} 
              className="w-full border border-gray-600 p-2 rounded bg-gray-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-400 file:text-black hover:file:bg-amber-500 cursor-pointer" 
            />
            <div className="flex gap-3 mt-4 flex-wrap">
              {imageFiles.map((file, index) => (
                <img key={index} src={URL.createObjectURL(file)} className="w-24 h-24 object-cover rounded border-2 border-gray-600" alt="preview" />
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading} 
            className={`w-full py-3 rounded font-bold text-lg transition-colors ${uploading ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}
          >
            {uploading ? 'Uploading...' : 'Upload Product'}
          </button>
        </form>

        {message && <p className={`mt-4 text-center font-bold ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
      </div>
    </>
  );
}
