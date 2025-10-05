// /api/verifyPayment/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/orderModel";

export async function POST(req) {
  try {
    const { reference, cartItems, email, name, address, totalAmount } = await req.json();

    if (!reference || !email || !totalAmount || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    // ✅ Verify transaction with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store", // ensure fresh verification
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

    // ✅ Connect to DB
    await dbConnect();

    // ✅ Prevent duplicate order creation if user refreshes
    const existing = await Order.findOne({ reference });
    if (existing) {
      return NextResponse.json({ success: true, order: existing });
    }

    // ✅ Save order to DB
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

    // ✅ Send email to Kikishop admin
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sendMail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, address, cartItems, totalAmount }),
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
