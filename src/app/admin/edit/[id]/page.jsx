'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductImage from '@/components/ProductImage';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    size: '',
    images: [], // ✅ support array
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch product info
  useEffect(() => {
    fetch(`/api/product/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.title || '',
          price: data.price?.toString() || '',
          description: data.description || '',
          category: data.category || '',
          size: Array.isArray(data.size) ? data.size.join(', ') : data.size || '',
          images: Array.isArray(data.images)
            ? data.images
            : data.image
              ? [data.image]
              : [], // ✅ always an array
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch product:', err);
        setLoading(false);
      });
  }, [id]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Update images (comma separated)
  const handleImagesChange = (e) => {
    const imgs = e.target.value
      .split(',')
      .map(img => img.trim())
      .filter(Boolean);
    setFormData({ ...formData, images: imgs });
  };

  // ✅ Update product
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      price: parseFloat(formData.price),
      size: formData.size.split(',').map(s => s.trim()),
      images: formData.images.map(img => img.startsWith('/') ? img : `/${img}`),
    };

    const res = await fetch(`/api/updateproduct/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (res.ok) {
      alert('✅ Product updated successfully!');
      router.push('/admin/dashboard');
    } else {
      alert('❌ Failed to update product.');
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleUpdate} className="space-y-4">

        {/* ✅ Image Preview Section */}
        {(formData.images?.length > 0 || formData.image) && (
          <div className="mb-4">
            <ProductImage
              product={{
                ...formData,
                images: formData.images?.length > 0
                  ? formData.images
                  : formData.image
                    ? [formData.image]
                    : [],
              }}
              height="h-[350px]"
              fit="object-cover"
            />
          </div>
        )}


        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
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
            className="w-full border px-3 py-2 rounded"
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
            className="w-full border px-3 py-2 rounded"
            rows={3}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. blazers, jeans, dresses"
            required
          />
        </div>

        {/* Size */}
        <div>
          <label className="block font-medium mb-1">Size(s)</label>
          <input
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. 12, 14"
            required
          />
        </div>

        {/* ✅ Multiple Image URLs */}
        <div>
          <label className="block font-medium mb-1">Image URLs (comma separated)</label>
          <input
            name="images"
            value={formData.images.join(', ')}
            onChange={handleImagesChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="/img1.jpg, /img2.jpg"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}
