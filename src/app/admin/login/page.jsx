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
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Wrong password");
        return;
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      // console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1f1f] to-[#121212] p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl relative">
        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
          aria-label="Go back to main website"
        >
          ← Back to Home
        </button>

        <h1 className="text-2xl font-bold text-white mb-8 text-center mt-10">
          Admin Login
        </h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full p-3 rounded-lg mb-4 text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          disabled={loading}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-3 rounded-lg font-semibold transition ${
            loading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-yellow-500 hover:bg-yellow-600 text-black"
          }`}
        >
          {loading ? "Checking..." : "Login"}
        </button>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}