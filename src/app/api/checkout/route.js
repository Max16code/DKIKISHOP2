// app/api/checkout/route.js
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/productModel'
import Order from '@/models/orderModel'

// ── Simple in-memory rate limiter (no Redis, no packages) ─────────────────────────────
const rateLimitMap = new Map(); // key: IP, value: { count, resetTime }

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 10;         // 10 checkouts per IP per 5 min

  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitMap.set(ip, entry);
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: maxRequests - entry.count };
}

// Cleanup old entries every 10 minutes (prevents memory growth)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export async function POST(req) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rate = checkRateLimit(ip);

  if (!rate.success) {
    console.log(`[RATELIMIT] Checkout blocked for IP ${ip}`);
    return NextResponse.json(
      { success: false, error: 'Too many checkout attempts — please wait 5 minutes' },
      { status: 429 }
    );
  }

  // ── Your original checkout logic (unchanged) ──────────────────────────────────────
  try {
    const {
      name,
      email,
      phone,
      address,
      cartItems,
      totalAmount,
      reference, // ✅ must be passed from Paystack success
    } = await req.json()

    await dbConnect()

    /* ------------------ 1️⃣ VERIFY PAYSTACK ------------------ */
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const verifyData = await verifyRes.json()

    if (
      !verifyData.status ||
      verifyData.data.status !== 'success'
    ) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    const paidAmount = verifyData.data.amount / 100
    if (paidAmount !== Number(totalAmount)) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }

    /* ------------------ 2️⃣ SAVE ORDER ------------------ */
    const order = await Order.create({
      name,
      email,
      phone,
      address,
      reference,
      items: cartItems,
      amount: paidAmount,
      status: 'paid',
      paidAt: new Date(),
    })

    for (const item of cartItems) {
      const product = await Product.findById(item.productId)

      if (!product || product.stock < item.quantity) {
        throw new Error(`${item.title} is out of stock`)
      }

      console.log(`Before decrement: ${product.title} stock=${product.stock}`)

      product.stock -= item.quantity
      product.isAvailable = product.stock > 0
      await product.save()

      console.log(`After decrement: ${product.title} stock=${product.stock}`)
    }

    /* ------------------ 4️⃣ EMAIL TRANSPORT (PRODUCTION SAFE) ------------------ */
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    /* ------------------ 5️⃣ FORMAT ITEMS ------------------ */
    const itemsHTML = cartItems
      .map(
        (item) =>
          `<li>${item.title} - ₦${item.price} x ${item.quantity} (Size: ${item.size})</li>`
      )
      .join('')

    // ---------------- 6️⃣ Buyer Email (Polished Receipt) ----------------
    const itemsTableHTML = cartItems
      .map(
        (item) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">
        <img src="${item.image}" width="100" style="display:block;" />
      </td>
      <td style="padding: 10px; border: 1px solid #ddd;">
        ${item.title}<br/>
        <small>Size: ${item.size}</small>
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">
        ₦${item.price.toLocaleString()}
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align:right;">
        ₦${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>`
      )
      .join('')

    await transporter.sendMail({
      from: `"Dkikishop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Dkikishop Order Receipt',
      html: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto;">
      <h2 style="color:#1a73e8;">Payment Successful ✅</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your purchase! Here’s your order summary:</p>

      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color:#f2f2f2;">
            <th style="padding: 10px; border:1px solid #ddd;">Image</th>
            <th style="padding: 10px; border:1px solid #ddd;">Product</th>
            <th style="padding: 10px; border:1px solid #ddd;">Price</th>
            <th style="padding: 10px; border:1px solid #ddd;">Qty</th>
            <th style="padding: 10px; border:1px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableHTML}
        </tbody>
      </table>

      <p style="text-align:right; margin-top:20px; font-size:16px;">
        <strong>Total Paid: ₦${paidAmount.toLocaleString()}</strong>
      </p>

      <p><b>Delivery Address:</b> ${address}</p>
      <p><b>Payment Reference:</b> ${reference}</p>

      <p style="margin-top:30px;">We appreciate your business! 💙<br/>- Dkikishop Team</p>
    </div>
  `,
    })

    // ---------------- 7️⃣ Admin Email (Polished) ----------------
    const adminItemsTableHTML = cartItems
      .map(
        (item) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">
        <img src="${item.image}" width="100" style="display:block;" />
      </td>
      <td style="padding: 10px; border: 1px solid #ddd;">
        ${item.title}<br/>
        <small>Size: ${item.size}</small>
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">
        ₦${item.price.toLocaleString()}
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align:right;">
        ₦${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>`
      )
      .join('')

    await transporter.sendMail({
      from: `"Dkikishop Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Dkikishop Order Received',
      html: `
    <div style="font-family: Arial, sans-serif; color:#333; max-width:700px; margin:auto;">
      <h2>New Order Received 🛒</h2>
      <p><b>Buyer Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Delivery Address:</b> ${address}</p>
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color:#f2f2f2;">
            <th style="padding: 10px; border:1px solid #ddd;">Image</th>
            <th style="padding: 10px; border:1px solid #ddd;">Product</th>
            <th style="padding: 10px; border:1px solid #ddd;">Price</th>
            <th style="padding: 10px; border:1px solid #ddd;">Qty</th>
            <th style="padding: 10px; border:1px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${adminItemsTableHTML}
        </tbody>
      </table>
      <p style="text-align:right; margin-top:20px; font-size:16px;">
        <strong>Total Amount: ₦${paidAmount.toLocaleString()}</strong>
      </p>
      <p><b>Payment Reference:</b> ${reference}</p>
      <p style="margin-top:30px;">- Dkikishop Team</p>
    </div>
  `,
    })
    console.log('Admin email sent successfully')

    return NextResponse.json({ success: true, orderId: order._id })
  } catch (err) {
    console.error('CHECKOUT ERROR:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
