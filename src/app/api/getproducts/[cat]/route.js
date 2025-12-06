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

    // Extract category from URL
    const { cat } = context.params;

    if (!cat) {
      return NextResponse.json(
        { success: false, error: "Category parameter is required." },
        { status: 400 }
      );
    }

    // 🔒 Clean + sanitize input
    const cleanedCategory = sanitizeInput(cat).toLowerCase();

    // 🔒 Validate category
    if (!allowedCategories.includes(cleanedCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category '${cleanedCategory}'. Allowed: ${allowedCategories.join(", ")}`
        },
        { status: 400 }
      );
    }

    // 🔒 Safe MongoDB query
    const products = await Product.find({ category: cleanedCategory }).lean();

    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );

  } catch (error) {
    console.error("🔴 Secure GET Category Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
