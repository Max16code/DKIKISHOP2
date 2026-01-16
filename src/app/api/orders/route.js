// /app/api/orders/route.js
import Connectdb from '@/lib/mongodb'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import Product from '@/models/productModel'

function generateShopId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `DKIKI-${timestamp}-${random}`
}

const orderSchema = new mongoose.Schema({
  email: String,
  items: Array,
  totalAmount: Number,
  reference: String,
  shopId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export async function POST(req) {
  try {
    await Connectdb()

    const { email, items, totalAmount, reference } = await req.json()

    if (!items?.length || !totalAmount || !reference) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      )
    }

    // 1️⃣ Save the order
    const newOrder = await Order.create({
      email: email || '',
      items,
      totalAmount,
      reference,
      shopId: generateShopId()
    })

    // 2️⃣ Update inventory atomically
   for (const item of items) {
  const updated = await Product.findOneAndUpdate(
    { _id: item._id, quantity: { $gte: item.quantity } }, // ensure enough stock
    { $inc: { quantity: -item.quantity }, $set: { isAvailable: true } },
    { new: true }
  )

  // If stock was insufficient, fail the order
  if (!updated) {
    return NextResponse.json(
      { success: false, error: `Insufficient stock for ${item.title}` },
      { status: 400 }
    )
  }

  // Update isAvailable for zero quantity
  if (updated.quantity === 0) {
    updated.isAvailable = false
    await updated.save()
  }
}


    return NextResponse.json({ success: true, order: newOrder }, { status: 201 })
  } catch (error) {
    console.error('❌ Order API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
