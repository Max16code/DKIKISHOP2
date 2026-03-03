"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in via session cookie
  useEffect(() => {
    async function checkSession() {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      if (res.ok) {
        router.replace("/admin/dashboard");
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include", // Important: sends/receives cookies
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Wrong password");
        return;
      }

      // Success → redirect (cookie is set server-side)
      router.replace("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto mt-20 bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="w-full p-2 rounded mb-4 text-black"
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        disabled={loading}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full p-2 rounded ${
          loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Checking..." : "Login"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}