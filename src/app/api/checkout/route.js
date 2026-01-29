import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/productModel'
import Order from '@/models/orderModel'

export async function POST(req) {
  try {
    const {
      name,
      email,
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
      address,
      reference,
      items: cartItems,
      amount: paidAmount,
      status: 'paid',
      paidAt: new Date(),
    })

    /* ------------------ 3️⃣ DECREMENT STOCK ------------------ */
    for (const item of cartItems) {
      const product = await Product.findById(item.productId)

      if (!product || product.quantity < item.quantity) {
        throw new Error(`${item.title} is out of stock`)
      }

      product.quantity -= item.quantity
      product.isAvailable = product.quantity > 0
      await product.save()
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

    /* ------------------ 6️⃣ BUYER EMAIL ------------------ */
    await transporter.sendMail({
      from: `"Dkikishop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h2>Payment Successful</h2>
        <p>Thank you ${name}, your order has been received.</p>
        <p><b>Reference:</b> ${reference}</p>
        <p><b>Total:</b> ₦${paidAmount.toLocaleString()}</p>
        <ul>${itemsHTML}</ul>
      `,
    })

    /* ------------------ 7️⃣ ADMIN EMAIL ------------------ */
    await transporter.sendMail({
      from: `"Dkikishop Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Dkikishop Order',
      html: `
        <h2>New Order Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Address:</b> ${address}</p>
        <p><b>Total:</b> ₦${paidAmount.toLocaleString()}</p>
        <ul>${itemsHTML}</ul>
      `,
    })

    return NextResponse.json({ success: true, orderId: order._id })
  } catch (err) {
    console.error('CHECKOUT ERROR:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
