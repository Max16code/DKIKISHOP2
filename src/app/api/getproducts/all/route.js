import dbConnect from '@/lib/mongodb'
import Product from "@/models/productModel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available'); // 'true' or 'false'
    const limit = parseInt(searchParams.get('limit') || '50');

    const query = {};

    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
      query.stock = { $gt: 0 };
    }

    // ⚡ No restrictive $or on images
    // We'll return whatever is stored in the DB, including empty arrays
    // Frontend can handle fallback if needed

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}
