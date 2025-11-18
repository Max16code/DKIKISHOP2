import dbConnect from "@/lib/mongodb";
import product from "@/models/productModel";
import { NextResponse } from "next/server";

const allowedCategories = [
  "blazers",
  "shirts",
  "skirts",
  "dresses",
  "activewears",
  "jeans",
  "shorts",
  "accessories", // ✅ new categories included
];

export async function POST(req) {
  try {
    await dbConnect();
    const rawData = await req.json();

    console.log("🟡 RAW REQUEST BODY:", rawData);

    // ✅ Normalize values
    const title = String(rawData.title || "").trim();
    const description = String(rawData.description || "").trim();
    const price = Number(rawData.price);
    const category = String(rawData.category || "").trim().toLowerCase();

    // ✅ Handle images (array)
    const images = Array.isArray(rawData.images)
      ? rawData.images.map(img => String(img).trim()).filter(Boolean)
      : rawData.image
        ? [String(rawData.image).trim()]
        : [];

    // ✅ Handle sizes gracefully
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
      !category ||
      isNaN(price) || price <= 0 ||
      sizes.length === 0 ||
      images.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "All fields (including at least one image) are required." },
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

    // ✅ Save to DB
    const newProduct = new product({
      title,
      price,
      description,
      images, // ✅ now saving array instead of single image
      sizes,
      category,
    });

    await newProduct.save();

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
