'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <Link href="/admin/upload">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Upload New Product
          </button>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Uploaded Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product._id} className="border rounded p-3">
                <img src={product.image} alt={product.title} className="w-full h-40 object-cover mb-2 rounded" />
                <h3 className="font-bold text-lg">{product.title}</h3>
                <p className="text-sm text-gray-600">₦{product.price}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
