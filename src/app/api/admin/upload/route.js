import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { verifyAdmin } from "@/lib/verifyAdmin";

// ✅ Allowed categories, including dresses
const allowedCategories = [
  "jeans",
  "blazers",
  "shirts",
  "shorts",
  "activewears",
  "accessories",
  "skirts",
  "dresses"
];

export async function POST(req) {
  try {
    // 🔒 Verify admin
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    // 🔹 Connect to DB
    await dbConnect();

    // 🔹 Parse JSON body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("❌ Failed to parse JSON body:", err);
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    // 🔹 Sanitize & normalize inputs
    const title = sanitizeInput(body.title);
    const description = sanitizeInput(body.description);
    const price = Number(body.price);
    const category = sanitizeInput(body.category)?.trim().toLowerCase(); // ✅ fixed
    const sizes = Array.isArray(body.sizes)
      ? body.sizes.map((s) => sanitizeInput(s.trim())).filter(Boolean)
      : [];
    const quantity = Number(body.quantity || 1);
    const images = Array.isArray(body.images) ? body.images : [];

    // ✅ Validate required fields
    if (!title || !description || isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Required fields missing or invalid." },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be: ${allowedCategories.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (sizes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sizes are required." },
        { status: 400 }
      );
    }

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one image URL is required." },
        { status: 400 }
      );
    }

    // 🔹 Save product to MongoDB
    const newProduct = new Product({
      title,
      description,
      price,
      sizes,
      category, // ✅ always trimmed & lowercase
      images,   // Cloudinary URLs from frontend
      quantity,
      stock: quantity,
      isAvailable: quantity > 0,
    });

    await newProduct.save();

    // ✅ Return created product
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (err) {
    console.error("❌ Upload route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
