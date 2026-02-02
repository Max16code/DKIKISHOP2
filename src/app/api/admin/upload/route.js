import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { verifyAdmin } from "@/lib/verifyAdmin";

// ... existing imports ...

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const title = sanitizeInput(body.title);
    const description = sanitizeInput(body.description);
    const price = Number(body.price);
    const category = sanitizeInput(body.category)?.trim().toLowerCase();
    const sizes = Array.isArray(body.sizes) ? body.sizes.map(s => sanitizeInput(s.trim())).filter(Boolean) : [];
    const quantity = Number(body.quantity || 1);
    const images = Array.isArray(body.images) ? body.images : [];
    const shopId = body.shopId || '697780d848d182949a9fc132'; // ← fallback

    if (!title || !description || isNaN(price) || price <= 0 || !category || sizes.length === 0 || images.length === 0 || !shopId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, desc, price, category, sizes, images, shopId)" },
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
      shopId,  // ← now included
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (err) {
    console.error("Upload error:", err.message, err.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: err.message.includes('validation') 
          ? 'Validation failed: ' + err.message 
          : 'Server error during product save' 
      },
      { status: 500 }
    );
  }
}