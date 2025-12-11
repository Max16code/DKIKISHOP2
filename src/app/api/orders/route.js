// /app/api/orders/route.js

import Connectdb from '@/lib/mongodb'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import Product from '@/models/productModel' // ✅ Capitalized model name for clarity

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
    await Connectdb()

    const { email, items, totalAmount, reference } = await req.json()

    // ✅ Validate input
    if (!items?.length || !totalAmount || !reference) {
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

    // ✅ Loop through items and safely update product quantities
    for (const item of items) {
      const foundProduct = await Product.findById(item._id)

      if (foundProduct) {
        const newQty = foundProduct.quantity - (item.quantity || 1)

        // Prevent negative values
        foundProduct.quantity = Math.max(newQty, 0)

        // ✅ Optional: Auto-hide or mark as out of stock if quantity = 0
        if (foundProduct.quantity === 0) {
          foundProduct.isAvailable = false // Add this field in your model if not yet there
        }

        await foundProduct.save()
      }
    }

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Order saving error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
