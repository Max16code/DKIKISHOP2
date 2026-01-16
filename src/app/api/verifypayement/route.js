// 

// deepseek////////

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
      totalAmount,
      subtotal,
      deliveryFee,
      courier,
      location,
      eta,
    } = await req.json();

    // Validate required fields
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
       DATABASE CONNECTION & TRANSACTION START
    =============================== */
    await dbConnect();
    session.startTransaction();

    /* ===============================
       IDEMPOTENCY CHECK (INSIDE TRANSACTION)
    =============================== */
    const existing = await Order.findOne({ reference }).session(session);
    if (existing) {
      await session.commitTransaction();
      return NextResponse.json({ success: true, order: existing });
    }

    /* ===============================
       ENHANCED INVENTORY REDUCTION
       - Updates both quantity AND stock fields
       - Updates isAvailable when stock hits 0
       - Better error handling
    =============================== */
    for (const item of cartItems) {
      if (!item.productId || !item.quantity) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, message: "Invalid cart item structure" },
          { status: 400 }
        );
      }

      // Find the product with session for transaction safety
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        await session.abortTransaction();
        return NextResponse.json(
          { 
            success: false, 
            message: `Product ${item.productId} not found`,
            type: 'PRODUCT_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return NextResponse.json(
          { 
            success: false, 
            message: `Insufficient stock for "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`,
            productTitle: product.title,
            availableStock: product.stock,
            requestedQuantity: item.quantity,
            type: 'STOCK_ERROR'
          },
          { status: 400 }
        );
      }

      // ✅ UPDATE BOTH STOCK AND QUANTITY FIELDS
      product.stock -= item.quantity;
      product.quantity = product.stock; // Keep them in sync
      
      // Update availability if stock reaches 0
      if (product.stock <= 0) {
        product.isAvailable = false;
        product.stock = 0;
        product.quantity = 0;
      }

      await product.save({ session });
    }

    /* ===============================
       ENHANCED ORDER SAVING
       - Include all order details
       - Track stock before reduction
    =============================== */
    const newOrder = await Order.create([{
      email,
      name,
      phone,
      address,
      reference,
      totalAmount,
      subtotal: subtotal || totalAmount - (deliveryFee || 0),
      shippingFee: deliveryFee || 0,
      items: cartItems.map(item => ({
        ...item,
        // Store purchased stock for records
        purchasedStock: 0, // Will be updated after save if needed
      })),
      status: "confirmed",
      paymentStatus: "successful",
      paymentGateway: "Paystack",
      courier,
      location,
      eta,
      paidAt: new Date(),
      // Add shopId for reference
      shopId: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    }], { session });

    await session.commitTransaction();

    /* ===============================
       POST-TRANSACTION: Update product purchasedStock
       This is optional but good for records
    =============================== */
    try {
      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          // Update the order item with stock before purchase
          await Order.updateOne(
            { _id: newOrder[0]._id, "items.productId": item.productId },
            { 
              $set: { 
                "items.$.purchasedStock": product.stock + item.quantity 
              } 
            }
          );
        }
      }
    } catch (updateError) {
      console.error("Failed to update purchasedStock:", updateError);
      // Non-critical error, continue
    }

    /* ===============================
       EMAIL (NON-BLOCKING)
    =============================== */
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sendMail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          phone,
          address,
          cartItems,
          totalAmount,
          subtotal: subtotal || totalAmount - (deliveryFee || 0),
          deliveryFee: deliveryFee || 0,
          courier,
          location,
          eta,
          orderId: newOrder[0].shopId,
          paymentReference: reference,
        }),
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr);
    }

    return NextResponse.json({ 
      success: true, 
      order: newOrder[0],
      message: "Payment verified and stock updated successfully"
    });

  } catch (err) {
    // Rollback transaction if it's still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error("Payment verification error:", err);

    // Handle specific stock errors
    if (err.message.includes("Insufficient stock") || err.message.includes("stock")) {
      return NextResponse.json(
        {
          success: false,
          message: err.message,
          type: 'STOCK_ERROR'
        },
        { status: 400 }
      );
    }

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