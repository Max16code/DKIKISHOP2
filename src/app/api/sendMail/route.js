// /api/sendMail/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, name, address, cartItems, totalAmount } = await req.json();

    if (!email || !name || !address || !cartItems?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🛒 Build order items HTML
    const itemsHtml = cartItems
      .map(
        (item) =>
          `<li>${item.title} - Size: ${item.size} - Qty: ${item.quantity} - ₦${Number(
            item.price
          ).toLocaleString()}</li>`
      )
      .join("");

    // ✅ Email to admin (you)
    await transporter.sendMail({
      from: `"KikiShop Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🛍️ New KikiShop Order",
      html: `
        <h2>New Order Received</h2>
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Total:</strong> ₦${Number(totalAmount).toLocaleString()}</p>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
      `,
    });

    // ✅ Email to customer (receipt)
    await transporter.sendMail({
      from: `"KikiShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Your KikiShop Order Confirmation",
      html: `
        <h2>Thank you for your order, ${name}!</h2>
        <p>We’ve received your order and will process it shortly.</p>
        <h3>Order Details:</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> ₦${Number(totalAmount).toLocaleString()}</p>
        <p><strong>Delivery Address:</strong> ${address}</p>
        <br/>
        <p>– The KikiShop Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
