import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedCategories = ["blazers","shirts","skirts","dresses","activewears","jeans","shorts","accessories"];

export async function POST(req) {
  try {
    // 🔒 Verify admin
    if (!verifyAdmin(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    await dbConnect();

    const formData = await req.formData();

    const title = sanitizeInput(formData.get("title"));
    const description = sanitizeInput(formData.get("description"));
    const price = Number(formData.get("price"));
    const category = sanitizeInput(formData.get("category")?.toLowerCase());
    const sizesRaw = sanitizeInput(formData.get("sizes") || "");
    const quantity = Number(formData.get("quantity") || 1);

    const sizes = sizesRaw.split(",").map(s => sanitizeInput(s.trim())).filter(Boolean);

    const imagesFiles = formData.getAll("images");
    if (!imagesFiles || imagesFiles.length === 0) {
      return NextResponse.json({ success: false, error: "At least one product image is required." }, { status: 400 });
    }

    // 🔹 Upload images to Cloudinary (organized by category + unique filenames)
    const imageUrls = [];
    for (const file of imagesFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `dkikishop/products/${category}`,
            use_filename: true,
            unique_filename: true,
            resource_type: "image",
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrls.push(uploadRes.secure_url);
    }

    // ✅ Validate fields
    if (!title || !description || isNaN(price) || price <= 0) {
      return NextResponse.json({ success: false, error: "Required fields missing or invalid." }, { status: 400 });
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ success: false, error: `Invalid category. Must be: ${allowedCategories.join(", ")}` }, { status: 400 });
    }

    if (sizes.length === 0) {
      return NextResponse.json({ success: false, error: "Sizes are required." }, { status: 400 });
    }

    // 🔹 Save product with stock and availability
    const newProduct = new Product({
      title,
      description,
      price,
      sizes,
      category,
      images: imageUrls,
      quantity,
      stock: quantity,          // important for homepage/category filter
      isAvailable: quantity > 0 // important for homepage/category filter
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });

  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
