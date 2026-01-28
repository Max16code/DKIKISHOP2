// /src/app/api/orders/complete/route.js
import dbConnect from "@/lib/mongodb";
import Product from "@/models/productModel";
import Order from "@/models/orderModel";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  await dbConnect();

  try {
    const { reference } = await req.json();

    /* ============================
       1️⃣ VERIFY PAYSTACK PAYMENT
    ============================ */
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400 }
      );
    }

    const { metadata, customer, amount } = verifyData.data;
    const items = metadata?.cartItems;

    if (!items || items.length === 0) {
      throw new Error("No cart items found in Paystack metadata");
    }

    /* ============================
       2️⃣ SAVE ORDER
    ============================ */
    const order = await Order.create({
      items,
      email: customer.email,
      amount: amount / 100,
      paystackRef: reference,
      createdAt: new Date(),
    });

    /* ============================
       3️⃣ DECREMENT STOCK
    ============================ */
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) continue;

      product.quantity = Math.max(
        0,
        product.quantity - item.quantity
      );

      await product.save();
    }

    /* ============================
       4️⃣ SEND BUYER EMAIL
    ============================ */
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: customer.email,
      subject: "Your Dkikishop Order Was Successful 🎉",
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your payment was successful.</p>

        <h3>Order Summary</h3>
        <ul>
          ${items
            .map(
              item =>
                `<li>${item.quantity} × ${item._id}</li>`
            )
            .join("")}
        </ul>

        <p><strong>Total:</strong> ₦${amount / 100}</p>
        <p>Reference: ${reference}</p>

        <p>We’ll notify you once your order ships.</p>
      `,
    });

    /* ============================
       5️⃣ SEND ADMIN EMAIL
    ============================ */
    await resend.emails.send({
      from: `Dkikishop <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🛒 New Order Received",
      html: `
        <h2>New Order Alert</h2>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Amount:</strong> ₦${amount / 100}</p>
        <p><strong>Reference:</strong> ${reference}</p>

        <h3>Items</h3>
        <ul>
          ${items
            .map(
              item =>
                `<li>${item.quantity} × ${item._id}</li>`
            )
            .join("")}
        </ul>
      `,
    });

    return new Response(
      JSON.stringify({
        message: "Order completed, stock updated & emails sent",
        orderId: order._id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Order completion error:", error);
    return new Response(
      JSON.stringify({ error: "Order processing failed" }),
      { status: 500 }
    );
  }
}
