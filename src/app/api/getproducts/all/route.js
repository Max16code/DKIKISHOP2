// app/api/getproducts/all/route.js

import dbConnect from '@/lib/mongodb'
import product from "@/models/productModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const products = await product.find({}).lean();

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products: " + error.message },
      { status: 500 }
    );
  }
}
