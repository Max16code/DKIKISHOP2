import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";

const allowedCategories = [
  "blazers", "tops", "skirts", "dresses",
  "activewears", "jeans", "shorts", "accessories", "twopiece"
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',   // Replace with your domain in production
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const cat = params?.cat;
    if (!cat) {
      return NextResponse.json(
        { success: false, error: "Category required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanedCategory = sanitizeInput(cat).toLowerCase();
    if (!allowedCategories.includes(cleanedCategory)) {
      return NextResponse.json(
        { success: false, error: `Invalid category '${cleanedCategory}'` },
        { status: 400, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const available = searchParams.get('available');
    const showAll = searchParams.get('showAll') === 'true';
    
    // Enforce a maximum of 150 products per category
    let limit = parseInt(searchParams.get('limit') || '150', 10);
    if (limit > 150) limit = 150;   // never exceed 150

    const query = { category: cleanedCategory };

    // Only filter by availability if showAll is not true
    if (!showAll && available !== 'false') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })   // newest first
      .limit(limit)
      .lean();

    return NextResponse.json(
      { success: true, products },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("🔴 GET Category Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}