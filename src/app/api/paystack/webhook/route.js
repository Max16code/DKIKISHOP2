// /src/app/api/paystack/webhook/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import Order from "@/models/orderModel";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  await dbConnect();

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  // Paystack sends raw JSON
  const body = await req.json();
  const signature = req.headers.get("x-paystack-signature");

  // Verify webhook signature
  const crypto = await import("crypto");
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET)
                     .update(JSON.stringify(body))
                     .digest("hex");

  if (hash !== signature) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  // Only process successful payments
  if (body.event !== "charge.success") {
    return new Response(JSON.stringify({ message: "Event ignored" }), { status: 200 });
  }

  try {
    const { metadata, customer, reference, amount } = body.data;
    const items = metadata?.cartItems;

    if (!items || items.length === 0) throw new Error("No cart items");

    // Save order
    const order = await Order.create({
      items,
      email: customer.email,
      amount: amount / 100,
      paystackRef: reference,
      createdAt: new Date(),
    });

    // Decrement stock
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) continue;
      product.quantity = Math.max(0, product.quantity - item.quantity);
      await product.save();
    }

    // Buyer Email
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: customer.email,
      subject: "Your Dkikishop Order Was Successful 🎉",
      html: `<h2>Thanks for your purchase!</h2>
             <p>Order Reference: ${reference}</p>
             <ul>${items.map(i => `<li>${i.quantity} × ${i._id}</li>`).join("")}</ul>
             <p>Total: ₦${amount / 100}</p>`,
    });

    // Admin Email
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🛒 New Order Received",
      html: `<p>New order by ${customer.email}</p>
             <p>Reference: ${reference}</p>
             <ul>${items.map(i => `<li>${i.quantity} × ${i._id}</li>`).join("")}</ul>
             <p>Total: ₦${amount / 100}</p>`,
    });

    return new Response(JSON.stringify({ message: "Processed successfully" }), { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Processing failed" }), { status: 500 });
  }
}
