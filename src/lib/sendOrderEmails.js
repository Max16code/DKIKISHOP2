// /src/lib/sendOrderEmails.js
import nodemailer from 'nodemailer';

export async function sendOrderEmails(order) {
  if (!order || typeof order !== 'object') {
    throw new Error('Valid order object is required.');
  }

  // 1. Setup transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false otherwise
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 2. Build items HTML table rows
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px;"><img src="${item.image || ''}" width="80" alt="${item.title || 'Product'}" /></td>
        <td style="padding:8px;">${item.title || 'Unnamed Item'}</td>
        <td style="padding:8px;">${item.size || '-'}</td>
        <td style="padding:8px;">${item.quantity || 1}</td>
        <td style="padding:8px;">₦${Number(item.price || 0).toLocaleString()}</td>
        <td style="padding:8px;">₦${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  // 3. Admin email HTML
  const adminHtml = `
    <h2>New Order Received</h2>
    <p><strong>Reference:</strong> ${order.reference || 'N/A'}</p>
    <h3>Customer Info:</h3>
    <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
    <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
    <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
    <p><strong>Delivery Address:</strong> ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || 'Nigeria'}</p>
    <p><strong>Delivery Service:</strong> ${order.deliveryService || '-'}</p>
    <p><strong>PortHarcourt Option:</strong> ${order.deliveryOption || '-'}</p>
    <p><strong>Estimated Delivery:</strong> ${order.eta || '-'}</p>
    <p><strong>Delivery Fee:</strong> ₦${Number(order.shippingFee || 0).toLocaleString()}</p>
    <h3>Ordered Items:</h3>
    <table style="width:100%; border-collapse:collapse; text-align:left;">
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
        ${itemsHtml || '<tr><td colspan="6">No items</td></tr>'}
      </tbody>
    </table>
    <p style="margin-top:20px; font-weight:bold;">
      Total Amount (incl. delivery): ₦${Number(order.totalAmount || 0).toLocaleString()}
    </p>
  `;

  // 4. Customer email HTML (simpler version)
  const customerHtml = `
    <h2>Thank You for Your Order!</h2>
    <p>Your order (Reference: ${order.reference || 'N/A'}) has been received and is being processed.</p>
    <p><strong>Total Amount Paid:</strong> ₦${Number(order.totalAmount || 0).toLocaleString()}</p>
    <p><strong>Delivery Address:</strong> ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}</p>
    <p><strong>Estimated Delivery:</strong> ${order.eta || 'TBD'}</p>
    <h3>Your Items:</h3>
    <ul>
      ${(order.items || [])
        .map(
          (item) =>
            `<li>${item.title || 'Item'} ${item.size ? `(Size: ${item.size})` : ''} — Qty: ${item.quantity || 1} — ₦${(
              Number(item.price || 0) * Number(item.quantity || 1)
            ).toLocaleString()}</li>`
        )
        .join('') || '<li>No items found</li>'}
    </ul>
    <p>We’ll notify you once your order ships. Thank you for shopping with Dkikishop!</p>
  `;

  // 5. Send both emails concurrently
  await Promise.all([
    transporter.sendMail({
      from: `"Dkikishop" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received: ${order.reference || 'Unknown'}`,
      html: adminHtml,
    }),

    transporter.sendMail({
      from: `"Dkikishop" <${process.env.SMTP_USER}>`,
      to: order.email,
      subject: `Order Confirmation: ${order.reference || 'Unknown'}`,
      html: customerHtml,
    }),
  ]);

  console.log(`Emails sent successfully for order ${order.reference}`);
}