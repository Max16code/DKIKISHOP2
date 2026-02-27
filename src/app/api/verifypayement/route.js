import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/orderModel";
import Product from "@/models/productModel";
import mongoose from "mongoose";

export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    const {
      reference,
      cartItems,
      email,
      name,
      phone,
      address,
      totalAmount,      // NAIRA
      subtotal,         // NAIRA
      deliveryFee,      // NAIRA
      courier,
      location,
      eta,
    } = await req.json();

    // ===============================
    // BASIC VALIDATION
    // ===============================
    if (!reference || !email || !Array.isArray(cartItems) || !cartItems.length) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    // ===============================
    // PAYSTACK VERIFICATION
    // ===============================
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
      throw new Error("Failed to reach Paystack");
    }

    const paystackData = await paystackRes.json();
    const payment = paystackData?.data;

    if (!payment || payment.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // ===============================
    // AMOUNT VERIFICATION (CRITICAL)
    // Paystack = kobo → convert to naira
    // ===============================
    const paidAmount = payment.amount / 100; // kobo → naira
    const expectedAmount = Number(totalAmount);

    if (paidAmount !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount mismatch",
          paid: paidAmount,
          expected: expectedAmount,
        },
        { status: 400 }
      );
    }

    // ===============================
    // DB + TRANSACTION START
    // ===============================
    await dbConnect();
    session.startTransaction();

    // ===============================
    // IDEMPOTENCY CHECK
    // ===============================
    const existing = await Order.findOne({ reference }).session(session);
    if (existing) {
      await session.commitTransaction();
      return NextResponse.json({ success: true, order: existing });
    }

    // ===============================
    // STOCK VALIDATION + DECREMENT
    // ===============================
    for (const item of cartItems) {
      if (!item.productId || !item.quantity) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "Invalid cart item structure" },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: `Product not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for "${product.title}"`,
            available: product.stock,
            requested: item.quantity,
          },
          { status: 400 }
        );
      }

      product.stock -= item.quantity;
      product.quantity = product.stock;

      if (product.stock <= 0) {
        product.stock = 0;
        product.quantity = 0;
        product.isAvailable = false;
      }

      await product.save({ session });
    }

    // ===============================
    // ORDER CREATION
    // ===============================
    const newOrder = await Order.create(
      [
        {
          email,
          name,
          phone,
          address,
          reference,
          totalAmount,
          subtotal: subtotal ?? totalAmount - (deliveryFee || 0),
          shippingFee: deliveryFee || 0,
          items: cartItems,
          status: "confirmed",
          paymentStatus: "successful",
          paymentGateway: "Paystack",
          courier,
          location,
          eta,
          paidAt: new Date(),
          shopId: `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // ===============================
    // EMAIL (NON-BLOCKING)
    // ===============================
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sendMail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        phone,
        address,
        cartItems,
        totalAmount,
        subtotal: subtotal ?? totalAmount - (deliveryFee || 0),
        deliveryFee: deliveryFee || 0,
        courier,
        location,
        eta,
        orderId: newOrder[0].shopId,
        paymentReference: reference,
      }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      order: newOrder[0],
      message: "Payment verified, order saved, stock updated",
    });

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Payment verification error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
