// /src/lib/sendOrderEmails.js
import nodemailer from 'nodemailer'

export async function sendOrderEmails({ order }) {
  if (!order) throw new Error('Order object is required.')

  // 1️⃣ Setup transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  // 2️⃣ Build items HTML
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px;"><img src="${item.image}" width="80" /></td>
        <td style="padding:8px;">${item.title}</td>
        <td style="padding:8px;">${item.size || '-'}</td>
        <td style="padding:8px;">${item.quantity}</td>
        <td style="padding:8px;">₦${item.price.toLocaleString()}</td>
        <td style="padding:8px;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  // 3️⃣ Admin Email HTML
  const adminHtml = `
    <h2>New Order Received</h2>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <h3>Customer Info:</h3>
    <p>Name: ${order.customer.name}</p>
    <p>Email: ${order.customer.email}</p>
    <p>Phone: ${order.customer.phone}</p>
    <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
    <p><strong>Delivery Service:</strong> ${order.customer.service || '-'}</p>
    <p><strong>PortHarcourt Option:</strong> ${order.customer.portDeliveryOption || '-'}</p>
    <p><strong>Estimated Delivery:</strong> ${order.eta || '-'}</p>
    <p><strong>Delivery Fee:</strong> ₦${order.deliveryFee?.toLocaleString() || '0'}</p>
    <h3>Ordered Items:</h3>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:8px;">Image</th>
          <th style="padding:8px;">Title</th>
          <th style="padding:8px;">Size</th>
          <th style="padding:8px;">Qty</th>
          <th style="padding:8px;">Unit Price</th>
          <th style="padding:8px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p style="margin-top:20px; font-weight:bold;">Total Amount (incl. delivery): ₦${order.totalAmount?.toLocaleString()}</p>
  `

  // 4️⃣ Customer Email HTML (optional simpler version)
  const customerHtml = `
    <h2>Thank you for your order!</h2>
    <p>Your order (ID: ${order.orderId}) has been received and is being processed.</p>
    <p>Total Amount Paid: ₦${order.totalAmount?.toLocaleString()}</p>
    <p>Delivery Address: ${order.deliveryAddress}</p>
    <p>Estimated Delivery: ${order.eta || '-'}</p>
    <h3>Items Ordered:</h3>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li>${item.title} | Size: ${item.size || '-'} | Qty: ${item.quantity} | ₦${(
              item.price * item.quantity
            ).toLocaleString()}</li>`
        )
        .join('')}
    </ul>
  `

  // 5️⃣ Send emails
  await Promise.all([
    transporter.sendMail({
      from: `"Dkikishop" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received: ${order.orderId}`,
      html: adminHtml,
    }),
    transporter.sendMail({
      from: `"Dkikishop" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      subject: `Order Confirmation: ${order.orderId}`,
      html: customerHtml,
    }),
  ])
}
