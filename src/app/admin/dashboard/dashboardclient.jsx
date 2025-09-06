'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardClient({ session }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Renamed from 'loading' to 'isLoading'
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/getproducts/all");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/deleteproduct/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/edit/${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          Logout
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-500 text-lg py-10">Loading...</p>}
      {error && <p className="text-center text-red-500 text-lg py-10">Error: {error}</p>}
      {!isLoading && !error && products.length === 0 && (
        <p className="text-center text-gray-600 py-10">No products found.</p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <li
              key={product._id}
              className="border p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-cover mb-3 rounded"
              />
              <h2 className="font-semibold text-lg">{product.title}</h2>
              <p className="text-green-600 font-semibold mb-2">₦{product.price}</p>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(product._id)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}