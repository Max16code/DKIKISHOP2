import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { redis } from "@/lib/redis"; // ✅ ADD THIS

const allowedCategories = [
  "blazers", "tops", "skirts", "dresses",
  "activewears", "jeans", "shorts", "accessories", "twopiece"
];

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const cat = params?.cat;
    if (!cat) {
      return NextResponse.json({ success: false, error: "Category required" }, { status: 400 });
    }

    const cleanedCategory = sanitizeInput(cat).toLowerCase();
    if (!allowedCategories.includes(cleanedCategory)) {
      return NextResponse.json({
        success: false,
        error: `Invalid category '${cleanedCategory}'`
      }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const available = searchParams.get('available');
    const showAll = searchParams.get('showAll') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query = { category: cleanedCategory };

    if (!showAll && available !== 'false') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    }

    // ✅ SMART CACHE KEY (CRITICAL)
    const cacheKey = `products:${cleanedCategory}:available=${available}:showAll=${showAll}:limit=${limit}`;

    // ✅ 1. CHECK REDIS FIRST
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ Redis HIT:", cacheKey);
      return NextResponse.json({ success: true, products: cached }, { status: 200 });
    }

    console.log("🐢 MongoDB HIT:", cacheKey);

    // ✅ 2. FETCH FROM DB
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // ✅ 3. STORE IN REDIS (TTL = 1 hour)
    await redis.set(cacheKey, products, { ex: 3600 });

    return NextResponse.json({ success: true, products }, { status: 200 });

  } catch (error) {
    console.error("🔴 GET Category Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}