// /app/api/orders/route.js

import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

// Define Order schema and model
const orderSchema = new mongoose.Schema({
  email: String,
  items: Array,
  total: Number,
  reference: String,
  createdAt: { type: Date, default: Date.now },
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export async function POST(req) {
  try {
    await dbConnect()
    const { email, items, total, reference } = await req.json()

    if (!email || !items || !total || !reference) {
      return NextResponse.json({ success: false, error: 'Missing order fields' }, { status: 400 })
    }

    const newOrder = new Order({ email, items, total, reference })
    await newOrder.save()

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
