// 

// deepseek//////

// app/api/getproducts/all/route.js

import dbConnect from '@/lib/mongodb'
import Product from "@/models/productModel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available'); // 'true' or 'false'
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = {};

    if (available === 'true') {
      query.isAvailable = true;
      query.$or = [
        { stock: { $gt: 0 } },
        { quantity: { $gt: 0 } }
      ];
    }

    // ✅ Ensure products have an image
    query.$or = [
      { image: { $exists: true, $ne: '' } },
      { images: { $exists: true, $not: { $size: 0 } } }
    ];

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
