// src/app/api/admin/upload/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { getSession } from "@/lib/session";
import { redis } from "@/lib/redis"; // ✅ ADD THIS

export async function POST(req) {
  const allowedCategories = [
    "jeans",
    "blazers",
    "tops",
    "shorts",
    "activewears",
    "accessories",
    "skirts",
    "dresses",
    "twopiece"
  ];

  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      console.log('Unauthorized upload - no valid admin session');
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    console.log('Admin upload authorized - session OK');

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const title = sanitizeInput(body.title);
    const description = sanitizeInput(body.description);
    const price = Number(body.price);
    const category = sanitizeInput(body.category)?.trim().toLowerCase();
    const sizes = Array.isArray(body.sizes)
      ? body.sizes.map(s => sanitizeInput(s.trim())).filter(Boolean)
      : [];
    const quantity = Number(body.quantity || 1);
    const images = Array.isArray(body.images) ? body.images : [];
    const shopId = body.shopId || '697780d848d182949a9fc132';

    if (!title || !description || isNaN(price) || price <= 0 || !category || sizes.length === 0 || images.length === 0 || !shopId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, description, price, category, sizes, images, shopId)" },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Allowed: ${allowedCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const newProduct = new Product({
      title,
      description,
      price,
      sizes,
      category,
      images,
      quantity,
      stock: quantity,
      isAvailable: quantity > 0,
      shopId,
    });

    await newProduct.save();

    console.log('Product created successfully:', newProduct._id);

    // ✅ 🔥 REDIS INVALIDATION (CRITICAL)
    try {
      await redis.flushall();
      console.log("🧹 Redis cache cleared after product upload");
    } catch (redisErr) {
      console.error("⚠️ Redis flush failed:", redisErr.message);
      // Do NOT fail request because of Redis
    }

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (err) {
    console.error("Upload route error:", {
      message: err.message,
      stack: err.stack?.substring(0, 800) || 'No stack',
    });

    return NextResponse.json(
      { 
        success: false, 
        error: err.message.includes('validation') 
          ? `Validation failed: ${err.message}` 
          : 'Server error during product save'
      },
      { status: 500 }
    );
  }
}