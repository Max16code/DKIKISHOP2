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

// Order schema (unchanged)
const orderSchema = new mongoose.Schema({
  email: String,
  phone: String,
  service: String,          // e.g., "Delivery", "Pickup"
  portDeliveryOption: String, // e.g., "Port A", "Port B" (if service is Delivery)
  items: Array,        // [{ _id, title, quantity, size, price }]
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

    // Start MongoDB session for atomic transaction
    const session = await Product.startSession()
    session.startTransaction()

    try {
      // 1️⃣ Update inventory size-by-size
      for (const item of items) {
        const { _id, quantity, size, title } = item

        // Decrement the selected size stock atomically
        const updated = await Product.findOneAndUpdate(
          {
            _id,
            "sizes.size": size,
            "sizes.stock": { $gte: quantity } // ensure enough stock
          },
          {
            $inc: {
              "sizes.$.stock": -quantity, // decrement selected size
              stock: -quantity,           // decrement total stock
              quantity: -quantity         // sync quantity field
            }
          },
          { new: true, session }
        )

        // Fail order if stock insufficient
        if (!updated) {
          await session.abortTransaction()
          session.endSession()
          return NextResponse.json(
            { success: false, error: `Insufficient stock for ${title}, size ${size}` },
            { status: 400 }
          )
        }

        // Recalculate availability
        const totalStock = updated.sizes.reduce((sum, s) => sum + s.stock, 0)
        updated.isAvailable = totalStock > 0
        await updated.save({ session })
      }

      // 2️⃣ Save the order
      const newOrder = await Order.create([{
        email: email || '',
        phone: phone || '',
        service: service || '',
        portDeliveryOption: portDeliveryOption || '',
        items,
        totalAmount,
        reference,
        shopId: generateShopId()
      }], { session })

      await session.commitTransaction()
      session.endSession()

      return NextResponse.json({ success: true, order: newOrder[0] }, { status: 201 })

    } catch (err) {
      await session.abortTransaction()
      session.endSession()
      throw err
    }

  } catch (error) {
    console.error('❌ Order API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
