// 

// deepseek//////

// app/api/getproducts/all/route.js

import dbConnect from '@/lib/mongodb'
import product from "@/models/productModel";
import { NextResponse } from "next/server";

export async function GET(request) {  // ✅ Add request parameter
  try {
    await dbConnect();

    // ✅ Get query parameters
    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available'); // 'true' or 'false'
    const limit = parseInt(searchParams.get('limit') || '50');

    // ✅ Build query
    let query = {};
    
    // ✅ Filter by availability if requested
    if (available === 'true') {
      query.isAvailable = true;
      query.$or = [
        { stock: { $gt: 0 } },
        { quantity: { $gt: 0 } }
      ];
    }

    // ✅ Get products with optional filtering
    const products = await product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}