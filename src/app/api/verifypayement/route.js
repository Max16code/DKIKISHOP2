import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";

export async function POST(req) {
  try {
    const {
      reference,
      cartItems,
      email,
      name,
      phone,
      address,
      totalAmount,
    } = await req.json();

    if (!reference || !email || !totalAmount || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    /* ===============================
       PAYSTACK VERIFICATION
    =============================== */
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!paystackRes.ok) {
      throw new Error("Failed to reach Paystack for verification");
    }

    const paystackData = await paystackRes.json();
    const payment = paystackData?.data;

    if (!payment || payment.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    /* ===============================
       DATABASE CONNECTION
    =============================== */
    await dbConnect();

    /* ===============================
       IDEMPOTENCY CHECK
    =============================== */
    const existing = await Order.findOne({ reference });
    if (existing) {
      return NextResponse.json({ success: true, order: existing });
    }

    /* ===============================
       INVENTORY REDUCTION (FIXED)
       - validates productId
       - respects item.quantity
       - fails loudly on insufficient stock
    =============================== */
    for (const item of cartItems) {
      if (!item.productId || !item.quantity) {
        throw new Error("Invalid cart item structure");
      }

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          quantity: { $gte: item.quantity },
        },
        {
          $inc: { quantity: -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for product ${item.productId}`
        );
      }
    }

    /* ===============================
       SAVE ORDER (ONLY AFTER STOCK IS SAFE)
    =============================== */
    const newOrder = await Order.create({
      email,
      name,
      address,
      reference,
      amount: totalAmount,
      items: cartItems,
      status: "Paid",
      paymentGateway: "Paystack",
      verifiedAt: new Date(),
    });

    /* ===============================
       EMAIL (NON-BLOCKING)
    =============================== */
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sendMail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,        // customer email
          name,         // customer name
          phone,        // ✅ newly added
          address,      // shipping address
          cartItems,    // products purchased
          totalAmount,  // total price
        }),
      });

    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Payment verification error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
