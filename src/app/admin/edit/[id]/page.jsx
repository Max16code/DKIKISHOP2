'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    size: '',
    image: '',
  });

  const [loading, setLoading] = useState(true);

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
          image: typeof data.image === 'string' ? data.image : '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch product:', err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      price: parseFloat(formData.price),
      size: formData.size.split(',').map(s => s.trim()),
    };

    const res = await fetch(`/api/updateproduct/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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

        {/* Image */}
        <div>
          <label className="block font-medium mb-1">Image URL</label>
          <input
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            placeholder="/images/sample.jpg"
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
