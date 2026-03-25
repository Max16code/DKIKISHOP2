'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

const allowedCategories = ["blazers", "tops", "skirts", "dresses", "activewears", "jeans", "shorts", "accessories"];

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    sizes: '',
    quantity: 1,
    images: [], // current images from DB
  });

  const [newImageFiles, setNewImageFiles] = useState([]); // new files to upload
  const [previewUrls, setPreviewUrls] = useState([]); // previews of new files
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch product
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();

        setFormData({
          title: data.title || '',
          price: data.price?.toString() || '',
          description: data.description || '',
          category: data.category || '',
          sizes: Array.isArray(data.sizes) ? data.sizes.join(', ') : data.sizes || '',
          quantity: data.quantity || data.stock || 1,
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
        });
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setMessage('❌ Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Preview new images
  useEffect(() => {
    const urls = newImageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [newImageFiles]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setNewImageFiles(Array.from(e.target.files));
  };

  const uploadImagesToCloudinary = async () => {
    const urls = [];

    for (const file of newImageFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error(data.error?.message || 'Cloudinary upload failed');

      urls.push(data.secure_url);
    }

    return urls;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setUploading(true);

    try {
      let updatedImages = [...formData.images];

      // If new images → upload to Cloudinary and replace old ones
      if (newImageFiles.length > 0) {
        const newUrls = await uploadImagesToCloudinary();
        updatedImages = newUrls; // replace all old images
      }

      const payload = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category.toLowerCase(),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        quantity: Number(formData.quantity),
        stock: Number(formData.quantity), // sync stock
        images: updatedImages,
      };

      const res = await fetch(`/api/updateproduct/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Product updated successfully!");
        setTimeout(() => router.push('/admin/dashboard'), 1500);
      } else {
        setMessage(`❌ ${data.error || 'Update failed'}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      setMessage("❌ Failed to update product.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading product...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      {message && (
        <p className={`mb-4 text-center ${message.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded bg-gray-900 text-white"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price (₦)</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className="w-full border p-3 rounded bg-gray-900 text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-3 rounded bg-gray-900 text-white"
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border p-3 rounded bg-gray-900 text-white"
            required
          >
            <option value="">Select category</option>
            {allowedCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sizes */}
        <div>
          <label className="block font-medium mb-1">Sizes (comma separated)</label>
          <input
            name="sizes"
            value={formData.sizes}
            onChange={handleChange}
            className="w-full border p-3 rounded bg-gray-900 text-white"
            placeholder="e.g. S, M, L, XL"
          />
        </div>

        {/* Quantity / Stock */}
        <div>
          <label className="block font-medium mb-1">Quantity / Stock</label>
          <input
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border p-3 rounded bg-gray-900 text-white"
            required
          />
        </div>

        {/* Current Images Preview */}
        {formData.images?.length > 0 && (
          <div>
            <label className="block font-medium mb-2">Current Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                  <img src={img} alt={`Current ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        <div>
          <label className="block font-medium mb-2">Upload New Images (replaces all current ones)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewImageFiles(Array.from(e.target.files))}
            className="w-full p-3 border border-gray-700 rounded bg-gray-900 text-white file:bg-gray-800 file:text-white file:border-0 file:px-4 file:py-2 file:rounded"
          />

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                  <img src={url} alt={`New preview ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-3 rounded font-semibold text-white ${
            uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}