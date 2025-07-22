import dbConnect from "@/lib/mongodb";
import product from "@/models/productModel";
import { NextResponse } from "next/server";

const allowedCategories = [
  "blazers",
  "shirts",
  "skirts",
  "dresses",
  "activewears",
  "jeans"
];

export async function POST(req) {
  try {
    await dbConnect();
    const rawData = await req.json();

    console.log("🟡 RAW REQUEST BODY:", rawData);

    // ✅ Normalize values
    const title = String(rawData.title || "").trim();
    const description = String(rawData.description || "").trim();
    const image = String(rawData.image || "").trim();
    const price = Number(rawData.price);

    // ✅ SAFELY normalize and lowercase category
    const category = String(rawData.category || "").trim().toLowerCase();

    // 🔄 Handle both `size` and `sizes` fields gracefully
    const sizes = Array.isArray(rawData.sizes)
      ? rawData.sizes
      : Array.isArray(rawData.size)
        ? rawData.size
        : typeof rawData.size === "string"
          ? rawData.size.split(",").map(s => s.trim()).filter(Boolean)
          : [];

    // ✅ Validation
    if (
      !title ||
      !description ||
      !image ||
      !category ||
      isNaN(price) || price <= 0 ||
      sizes.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required and must be valid." },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${allowedCategories.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    // ✅ Save to DB with clean, validated data
    const newProduct = new product({
      title,
      price,
      description,
      image,
      sizes,
      category, // ← already normalized
    });

    await newProduct.save();

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
