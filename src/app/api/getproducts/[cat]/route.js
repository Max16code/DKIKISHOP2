// 

// deepseek/////

import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";

const allowedCategories = [
  "blazers",
  "shirts",
  "skirts",
  "dresses",
  "activewears",
  "jeans",
  "shorts",
  "accessories"
];

export async function GET(req, context) {
  try {
    await dbConnect();

   
    // Await the params first
    const { params } = await context;
    const cat = params?.cat;


    if (!cat) {
      return NextResponse.json(
        { success: false, error: "Category parameter is required." },
        { status: 400 }
      );
    }

    const cleanedCategory = sanitizeInput(cat).toLowerCase();

    if (!allowedCategories.includes(cleanedCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category '${cleanedCategory}'. Allowed: ${allowedCategories.join(
            ", "
          )}`
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const available = searchParams.get('available'); // 'true' or 'false'
    const showAll = searchParams.get('showAll') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = { category: cleanedCategory };

    if (available !== 'false' && !showAll) {
      query.isAvailable = true;
      query.$or = [
        { stock: { $gt: 0 } },
        { quantity: { $gt: 0 } }
      ];
    }

    // ✅ Ensure products have at least one image
    query.$or = [
      { image: { $exists: true, $ne: '' } },
      { images: { $exists: true, $not: { $size: 0 } } }
    ];

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(products, { status: 200 });

  } catch (error) {
    console.error("🔴 Secure GET Category Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
