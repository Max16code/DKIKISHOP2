import dbConnect from "@/lib/mongodb";
import product from "@/models/productModel";
import { NextResponse } from "next/server";

import { sanitizeInput, validateProductData } from "@/lib/validate";
import { apiLimiter } from "@/lib/rateLimit";
import { verifyAdmin } from "@/lib/verifyAdmin";

export const runtime = "nodejs";

const allowedCategories = [
  "blazers",
  "shirts",
  "skirts",
  "dresses",
  "activewears",
  "jeans",
  "shorts",
  "accessories",
];

export async function POST(req) {
  try {
    // 🔒 Rate Limit to prevent brute-force attacks
    const limiter = apiLimiter();
    await limiter(req);

    // 🔒 Admin access check
    if (!verifyAdmin(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    await dbConnect();

    // RAW DATA
    const rawData = await req.json();
    console.log("🟡 RAW REQUEST BODY:", rawData);

    // 🔒 Sanitize and validate product data
    const clean = validateProductData(rawData);

    // ---- Extract clean values ----
    const title = sanitizeInput(clean.title);
    const description = sanitizeInput(clean.description);
    const price = Number(clean.price);
    const category = sanitizeInput(clean.category.toLowerCase());

    // 🔒 Sanitize images
    const images = Array.isArray(clean.images)
      ? clean.images.map(img => sanitizeInput(img)).filter(Boolean)
      : clean.image
        ? [sanitizeInput(clean.image)]
        : [];

    // 🔒 Sanitize sizes
    const sizes = Array.isArray(clean.sizes)
      ? clean.sizes.map(s => sanitizeInput(s)).filter(Boolean)
      : typeof clean.sizes === "string"
        ? clean.sizes.split(",").map(s => sanitizeInput(s.trim()))
        : [];

    // ---- VALIDATION ----
    if (
      !title ||
      !description ||
      !category ||
      isNaN(price) ||
      price <= 0 ||
      sizes.length === 0 ||
      images.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields must be valid (including at least one image).",
        },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${allowedCategories.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ---- SAVE TO DATABASE ----
    const newProduct = new product({
      title,
      price,
      description,
      images,
      sizes,
      category,
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
