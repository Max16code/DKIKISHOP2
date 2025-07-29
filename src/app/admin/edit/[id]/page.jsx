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
          title: data.title,
          price: data.price,
          description: data.description,
          category: data.category,
          size: data.size,
          image: data.image,
        });
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/updateproduct/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
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
        {['title', 'price', 'description', 'category', 'size', 'image'].map((field) => (
          <div key={field}>
            <label className="block capitalize">{field}</label>
            <input
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Update Product
        </button>
      </form>
    </div>
  );
}
