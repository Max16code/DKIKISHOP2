// app/api/getproducts/[cat]/route.js

import dbConnect from "@/lib/mongodb"
import Product from "@/models/productModel"
import { NextResponse } from "next/server"
import Link from "next/link"

const allowedCategories = ["blazers", "shirts", "skirts", "dresses", "activewears", "jeans", "shorts", "accessories"]

export async function GET(request, context) {
  try {
    await dbConnect()

    const { cat } = await context.params // ✅ Properly awaited destructure

    console.log("🟡 Requested category:", cat) // ✅ Use 'cat' not 'catParam'

    if (!cat) {
      return NextResponse.json({ success: false, error: "Category param missing." }, { status: 400 })
    }

    const category = cat.toLowerCase()

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category: ${category}` },
        { status: 400 }
      )
    }

    const products = await Product.find({ category }).lean()

    return NextResponse.json({ success: true, data: products }, { status: 200 })
  } catch (error) {
    console.error("🔴 API Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
