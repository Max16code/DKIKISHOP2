import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { redis } from "@/lib/redis"; // ✅ added

export async function GET(request, context) {
  try {
    const { id } = context.params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Product ID required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const cacheKey = `product:${id}`;

    // ✅ 1. CHECK REDIS FIRST (NO DB CONNECTION YET)
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("⚡ Redis HIT (product):", id);

      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("🐢 MongoDB HIT (product):", id);

    // ✅ 2. ONLY CONNECT IF CACHE MISS
    await dbConnect();

    const product = await Product.findById(id).lean();

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Normalize image fields (keep your logic)
    const normalizedProduct = {
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : product.image
        ? [product.image]
        : [],
    };

    // ✅ 3. STORE IN REDIS
    await redis.set(cacheKey, normalizedProduct, { ex: 3600 });

    return new Response(JSON.stringify(normalizedProduct), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Product fetch error:", err);

    return new Response(
      JSON.stringify({ error: "Invalid product ID or DB error" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}