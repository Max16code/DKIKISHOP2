// /app/api/orders/route.js

import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import Product from '@/models/Product' // ✅ Add this line to import your Product model

// Generate unique shopId
function generateShopId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `DKIKI-${timestamp}-${random}`
}

// Define Order schema and model
const orderSchema = new mongoose.Schema({
  email: String, // optional field
  items: Array,
  totalAmount: Number,
  reference: String,
  shopId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export async function POST(req) {
  try {
    await dbConnect()

    const { email, items, totalAmount, reference } = await req.json()

    // Validate input
    if (!items || !totalAmount || !reference) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      )
    }

    // ✅ Save the order first
    const newOrder = new Order({
      email: email || '',
      items,
      totalAmount,
      reference,
      shopId: generateShopId(),
    })

    await newOrder.save()

    // ✅ Now loop through items and update product quantity
    for (const item of items) {
      const product = await Product.findById(item._id)
      if (product) {
        const newQty = product.quantity - (item.quantity || 1)
        product.quantity = Math.max(newQty, 0)
        await product.save()
      }
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 })
  } catch (error) {
    console.error('❌ Order saving error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
