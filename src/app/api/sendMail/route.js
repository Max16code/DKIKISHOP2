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

    // 🛒 Build order items HTML (WITH images)
    const itemsHtml = cartItems
      .map(
        (item) => `
          <li style="margin-bottom: 16px; list-style: none;">
            <div style="display: flex; gap: 12px; align-items: center;">
              ${
                item.image
                  ? `<img 
                      src="${item.image}" 
                      alt="${item.title}"
                      width="80"
                      height="80"
                      style="object-fit: cover; border-radius: 8px; border: 1px solid #eee;"
                    />`
                  : ""
              }
              <div>
                <p style="margin: 0;"><strong>${item.title}</strong></p>
                <p style="margin: 2px 0;">Size: ${item.size}</p>
                <p style="margin: 2px 0;">Qty: ${item.quantity}</p>
                <p style="margin: 2px 0;">₦${Number(item.price).toLocaleString()}</p>
              </div>
            </div>
          </li>
        `
      )
      .join("");

    // ✅ Email to admin
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
        <ul style="padding: 0;">${itemsHtml}</ul>
      `,
    });

    // ✅ Email to customer
    await transporter.sendMail({
      from: `"KikiShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Your KikiShop Order Confirmation",
      html: `
        <h2>Thank you for your order, ${name}!</h2>
        <p>We’ve received your order and will process it shortly.</p>
        <h3>Order Details:</h3>
        <ul style="padding: 0;">${itemsHtml}</ul>
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
