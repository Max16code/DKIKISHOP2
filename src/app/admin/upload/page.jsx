'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    category: '',
    image: '',
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      setIsAuthorized(true);
    } else {
      router.push('/admin/login');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      size: form.size.split(',').map(s => s.trim().toUpperCase()),
      category: form.category.toLowerCase(),
    };

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    alert(data.success ? '✅ Uploaded' : '❌ Failed: ' + data.error);
  };

  if (!isAuthorized) return null; // Don't show form while checking

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <input name="title" placeholder="Title" onChange={handleChange} className="w-full border p-2" required />
      <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border p-2" required />
      <input name="price" type="number" placeholder="Price" onChange={handleChange} className="w-full border p-2" required />
      <input name="size" placeholder="Sizes (comma separated)" onChange={handleChange} className="w-full border p-2" required />
      <select name="category" onChange={handleChange} className="w-full border p-2" required>
        <option value="">Select Category</option>
        <option value="blazers">BLAZERS</option>
        <option value="shirts">SHIRTS</option>
        <option value="skirts">SKIRTS</option>
        <option value="jeans">JEANS</option>
        <option value="activewears">ACTIVE WEARS</option>
        <option value="dresses">DRESSES</option>
      </select>
      <input name="image" placeholder="Image URL" onChange={handleChange} className="w-full border p-2" required />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">Upload</button>
    </form>
  );
}
