import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req) {
  try {
    const { name, email, address, cartItems, totalAmount } = await req.json()

    // ✅ Setup email transporter (use Gmail/SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // ✅ Format the cart items
    const itemsHTML = cartItems
      .map(
        (item) =>
          `<li>${item.title} - ₦${item.price} x ${item.quantity} (Size: ${item.size})</li>`
      )
      .join('')

    await transporter.sendMail({
      from: `"Dkikishop Orders" <${process.env.EMAIL_USER}>`,
      to: 'orders@dkikishop.com', // 🔑 Change to your receiving email
      subject: 'New Dkikishop Order',
      html: `
        <h2>New Order Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Address:</b> ${address}</p>
        <p><b>Total:</b> ₦${Number(totalAmount).toLocaleString()}</p>
        <ul>${itemsHTML}</ul>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
