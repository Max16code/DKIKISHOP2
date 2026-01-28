// src/app/api/getproducts/[cat]/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";

const allowedCategories = [
  "blazers", "shirts", "skirts", "dresses",
  "activewears", "jeans", "shorts", "accessories"
];

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // ✅ params is directly available in Next.js 13+ dynamic routes
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

    // Only filter by availability if showAll is not true
    if (!showAll && available !== 'false') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, products }, { status: 200 });

  } catch (error) {
    console.error("🔴 GET Category Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
