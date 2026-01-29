// /src/app/api/paystack/webhook/route.js
import dbConnect from "@/lib/mongodb"
import Product from "@/models/productModel"
import Order from "@/models/orderModel"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  await dbConnect()

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

  try {
    const body = await req.json()
    const signature = req.headers.get("x-paystack-signature")

    // Verify webhook signature
    const crypto = await import("crypto")
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET)
                       .update(JSON.stringify(body))
                       .digest("hex")

    if (hash !== signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 })
    }

    // Only process successful payments
    if (body.event !== "charge.success") {
      return new Response(JSON.stringify({ message: "Event ignored" }), { status: 200 })
    }

    const { data } = body
    const { metadata, customer, reference, amount } = data
    const items = metadata?.cartItems
    const buyerInfo = metadata?.buyer

    if (!items || items.length === 0) throw new Error("No cart items in metadata")

    // Build order data with all required fields
    const orderData = {
      shopId: "dkikishop",                     // <-- example shop ID
      items: items.map(i => ({
        productId: i.productId,
        title: i.title,
        image: i.image || "",
        size: i.size || null,
        quantity: i.quantity,
        price: i.price,
      })),
      email: customer.email,
      customerName: buyerInfo?.name || "",
      phone: buyerInfo?.phone || "",
      shippingAddress: {
        street: buyerInfo?.address || "",
        city: buyerInfo?.town || "",
      },
      subtotal: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      totalAmount: metadata.totalAmount || amount / 100,
      paystackRef: reference,
      status: "paid",
      createdAt: new Date(),
    }

    // Save order to DB
    const order = await Order.create(orderData)

    // Decrement stock
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) continue
      product.quantity = Math.max(0, product.quantity - item.quantity)
      await product.save()
    }

    // Buyer Email
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: customer.email,
      subject: "Your Dkikishop Order Was Successful 🎉",
      html: `<h2>Thanks for your purchase!</h2>
             <p>Order Reference: ${reference}</p>
             <ul>${items.map(i => `<li>${i.quantity} × ${i.title}</li>`).join("")}</ul>
             <p>Total: ₦${orderData.totalAmount.toLocaleString()}</p>`,
    })

    // Admin Email
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🛒 New Order Received",
      html: `<p>New order by ${customer.email}</p>
             <p>Reference: ${reference}</p>
             <ul>${items.map(i => `<li>${i.quantity} × ${i.title}</li>`).join("")}</ul>
             <p>Total: ₦${orderData.totalAmount.toLocaleString()}</p>`,
    })

    return new Response(JSON.stringify({ message: "Webhook processed successfully" }), { status: 200 })

  } catch (err) {
    console.error("Webhook error:", err)
    return new Response(JSON.stringify({ error: "Order processing failed", details: err.message }), { status: 500 })
  }
}
