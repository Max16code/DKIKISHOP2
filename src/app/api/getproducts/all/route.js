// src/app/api/getproducts/all/route.js
import dbConnect from '@/lib/mongodb'
import Product from "@/models/productModel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Availability filter
    const available = searchParams.get('available') === 'true';

    // Limit handling – support unlimited with ?limit=0 or ?limit=all
    const limitParam = searchParams.get('limit');
    let limit = 50; // default for safety

    if (limitParam !== null) {
      if (limitParam === '0' || limitParam === 'all' || limitParam === 'none') {
        limit = 0; // 0 = no limit → returns everything
      } else {
        limit = parseInt(limitParam, 10) || 50;
      }
    }

    const query = {};

    // if (available) {
    //   query.isAvailable = true;
    //   query.stock = { $gt: 0 };
    // }

    // Fetch products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      products,
      total,
      returned: products.length,
      limitUsed: limit === 0 ? 'unlimited' : limit
    });

  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}