import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { getSession } from "@/lib/session";

export async function POST(req) {
  const allowedCategories = [
    "jeans", "blazers", "tops", "shirts", "shorts", "activewears",
    "accessories", "skirts", "dresses", "twopiece", "linen"
  ];

  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const title = sanitizeInput(body.title);
    const description = sanitizeInput(body.description);
    const price = Number(body.price);
    const category = sanitizeInput(body.category)?.trim().toLowerCase();
    const sizes = Array.isArray(body.sizes) ? body.sizes.map(s => sanitizeInput(s.trim())).filter(Boolean) : [];
    const quantity = Number(body.quantity || 1);
    const images = Array.isArray(body.images) ? body.images : [];
    const shopId = body.shopId || '697780d848d182949a9fc132';
    
    // ✅ NEW: Validate Section
    const section = body.section === 'brandNew' ? 'brandNew' : 'thrift';

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
      section, // ✅ NEW: Save to DB
      images,
      quantity,
      stock: quantity,
      isAvailable: quantity > 0,
      shopId,
    });

    await newProduct.save();

    console.log(`Product created successfully in ${section} section:`, newProduct._id);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (err) {
    console.error("Upload route error:", err.message);
    return NextResponse.json({ success: false, error: 'Server error during product save' }, { status: 500 });
  }
}
