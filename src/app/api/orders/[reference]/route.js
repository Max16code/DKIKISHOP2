// /app/api/orders/[reference]/route.js

import dbConnect from '@/lib/mongodb'
import Order from '@/models/orderModel'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await dbConnect()

    const reference = params.reference
    const order = await Order.findOne({ reference })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}
