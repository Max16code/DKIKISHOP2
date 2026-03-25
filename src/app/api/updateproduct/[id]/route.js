// src/app/api/admin/updateproducts/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/validate";
import { getSession } from "@/lib/session";

export async function PUT(req) {
  try {
    // ✅ Admin auth
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      id,
      title,
      description,
      price,
      category,
      sizes,
      quantity,
      images,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    // ✅ Sanitize inputs
    const updateData = {};

    if (title) updateData.title = sanitizeInput(title);
    if (description) updateData.description = sanitizeInput(description);
    if (price) updateData.price = Number(price);
    if (category) updateData.category = sanitizeInput(category).toLowerCase();
    if (Array.isArray(sizes)) {
      updateData.sizes = sizes.map(s => sanitizeInput(s.trim()));
    }
    if (Array.isArray(images)) updateData.images = images;
    if (quantity !== undefined) {
      const qty = Number(quantity);
      updateData.quantity = qty;
      updateData.stock = qty;
      updateData.isAvailable = qty > 0;
    }

    updateData.updatedAt = new Date();

    // ✅ Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, product: updatedProduct },
      { status: 200 }
    );

  } catch (error) {
    console.error("🔴 Update Product Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}