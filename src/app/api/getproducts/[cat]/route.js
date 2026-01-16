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

    // ✅ Use context.params directly
    const cat = context.params?.cat;

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

    // ✅ GET QUERY PARAMETERS FOR STOCK FILTERING
    const { searchParams } = new URL(req.url);
    const available = searchParams.get('available'); // 'true' or 'false'
    const showAll = searchParams.get('showAll') === 'true'; // Show all including out of stock

    // ✅ BUILD QUERY WITH STOCK MANAGEMENT
    let query = {
      category: cleanedCategory
    };

    // ✅ ENHANCED STOCK FILTERING:
    // If 'available=true' OR no parameter (default behavior), filter out-of-stock
    // If 'showAll=true', show everything
    if (available !== 'false' && !showAll) {
      query.isAvailable = true;
      query.$or = [
        { stock: { $gt: 0 } },
        { quantity: { $gt: 0 } }
      ];
    }

    // ✅ Get products with proper filtering
    const products = await Product.find(query).lean();

    // ✅ RETURN CONSISTENT FORMAT WITH OTHER APIs
    return NextResponse.json(products, { status: 200 });

  } catch (error) {
    console.error("🔴 Secure GET Category Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}