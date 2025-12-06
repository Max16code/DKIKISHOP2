'use client'

import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import Navbar from '@/components/Navbar'

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 STEP 1 — Check Admin Cookie
  useEffect(() => {
    const isLoggedIn =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_logged_in="))
        ?.split("=")[1] === "true";

    if (!isLoggedIn) {
      router.replace("/admin/login");
    } else {
      fetchProducts();
    }
  }, []);

  // 🔐 STEP 2 — Secure Fetch
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/getproducts/all', {
        method: "GET",
        credentials: "include" // ensures cookies are sent
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Failed to load products");
      }

      setProducts(data.data || []);
    } catch (err) {
      console.error("❌ Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 STEP 3 — Secure Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/deleteproduct/${id}`, {
        method: "DELETE",
        credentials: "include", // ensures admin auth is sent
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to delete product");
        return;
      }

      // Remove deleted item instantly
      setProducts(products.filter((product) => product._id !== id));

      alert("Product deleted successfully.");
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Something went wrong.");
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading products...</p>;
  }

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg p-4 flex flex-col items-center shadow-sm"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-32 h-32 object-cover rounded mb-2"
                />

                <h2 className="font-semibold text-lg">{product.title}</h2>
                <p className="text-sm text-gray-500">{product.category}</p>

                <button
                  onClick={() => handleDelete(product._id)}
                  className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
