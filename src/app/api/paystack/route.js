import crypto from "crypto"
import dbConnect from "@/lib/mongodb"
import Product from "@/models/productModel"
import Order from "@/models/orderModel"
import { NextResponse } from "next/server"

export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get("x-paystack-signature")

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex")

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event === "charge.success") {
    await dbConnect()

    const { metadata, reference, amount, customer } = event.data

    // Save order
    const order = await Order.create({
      reference,
      email: customer.email,
      items: metadata.cartItems,
      total: amount / 100,
      status: "paid",
    })

    // 🔻 Decrement stock
    for (const item of metadata.cartItems) {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { quantity: -item.qty, stock: -item.qty },
      })
    }

    // 🔥 Mark unavailable if stock <= 0
    await Product.updateMany(
      { stock: { $lte: 0 } },
      { isAvailable: false }
    )
  }

  return NextResponse.json({ received: true })
}
