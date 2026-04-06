// app/api/paystack/webhook/route.js
import crypto from 'crypto';
import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';
import Product from '@/models/productModel';
import nodemailer from 'nodemailer';

export async function POST(req) {
  console.log('[WEBHOOK] === NEW WEBHOOK RECEIVED ===');

  let rawBody = '';

  try {
    rawBody = await req.text().then(text => text.trim());
    console.log('[WEBHOOK] Raw body length:', rawBody.length);

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error('[WEBHOOK] JSON parse failed');
      return new Response('Invalid JSON', { status: 200 });
    }

    const reference = event.reference || (event.data && event.data.reference);
    if (!reference) {
      console.log('[WEBHOOK] No reference found');
      return new Response('No reference', { status: 200 });
    }

    console.log('[WEBHOOK] Reference found:', reference);

    const data = event.data || event;
    const metadata = data.metadata || {};

    await dbConnect();
    console.log('[WEBHOOK] DB connected');

    const existingOrder = await Order.findOne({ reference });
    if (existingOrder) {
      console.log('[WEBHOOK] Duplicate — ignored');
      return new Response('Duplicate', { status: 200 });
    }

    const shopId = metadata.cartItems?.[0]?.shopId || "697780d848d182949a9fc132";

    const order = await Order.create({
      reference,
      customerName: metadata.customer?.name || "Customer",
      email: metadata.customer?.email || "customer@example.com",
      phone: metadata.customer?.phone || "",
      shippingAddress: {
        street: metadata.customer?.address || "",
        city: metadata.customer?.town || "",
        state: "",
        country: 'Nigeria',
      },
      deliveryService: metadata.customer?.service || 'Unknown',
      deliveryOption: metadata.customer?.service === 'Portharcourt' 
        ? metadata.customer.portDeliveryOption || '' 
        : undefined,
      items: (metadata.cartItems || []).map((item) => ({
        productId: item.productId,
        title: item.title || "Unknown Product",
        size: item.size || null,
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || '',
      })),
      subtotal: Number(metadata.subtotal) || 0,
      shippingFee: Number(metadata.deliveryFee) || 0,
      totalAmount: Number(metadata.totalAmount) || 0,
      eta: metadata.eta || 'Not specified',
      paymentMethod: 'paystack',
      paymentStatus: 'successful',
      paidAt: new Date(),
      paystackData: data,
      shopId,
    });

    console.log('[WEBHOOK] Order created successfully:', order.reference);

    // Stock deduction
    console.log('[STOCK] Starting deduction for', (metadata.cartItems || []).length, 'items');
    for (const item of (metadata.cartItems || [])) {
      try {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.error('[STOCK] Product not found:', item.productId);
          continue;
        }
        console.log(`[STOCK] Before: ${product.title} stock = ${product.stock}`);
        product.stock = Math.max(0, product.stock - (item.quantity || 1));
        await product.save();
        console.log(`[STOCK] After: ${product.title} stock = ${product.stock}`);
      } catch (err) {
        console.error(`[STOCK] Failed for ${item.title}:`, err.message);
      }
    }

    // ==================== EMAIL SENDING ====================
    console.log('[EMAIL] Sending emails...');
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,   // Must be Gmail App Password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // ---------------- Buyer Email ----------------
      const itemsTableHTML = (metadata.cartItems || []).map(item => `
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
        </tr>
      `).join('');

      await transporter.sendMail({
        from: `"Dkikishop" <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: 'Your Dkikishop Order Receipt',
        html: `
          <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto;">
            <h2 style="color:#1a73e8;">Payment Successful ✅</h2>
            <p>Hi ${order.customerName},</p>
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
              <strong>Total Paid: ₦${order.totalAmount.toLocaleString()}</strong>
            </p>

            <p><b>Delivery Address:</b> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
            <p><b>Payment Reference:</b> ${order.reference}</p>

            <p style="margin-top:30px;">We appreciate your business! 💙<br/>- Dkikishop Team</p>
          </div>
        `,
      });

      // ---------------- Admin Email ----------------
      const adminItemsTableHTML = (metadata.cartItems || []).map(item => `
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
        </tr>
      `).join('');

      await transporter.sendMail({
        from: `"Dkikishop Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Dkikishop Order Received',
        html: `
          <div style="font-family: Arial, sans-serif; color:#333; max-width:700px; margin:auto;">
            <h2>New Order Received 🛒</h2>
            <p><b>Buyer Name:</b> ${order.customerName}</p>
            <p><b>Email:</b> ${order.email}</p>
            <p><b>Delivery Address:</b> ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
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
              <strong>Total Amount: ₦${order.totalAmount.toLocaleString()}</strong>
            </p>
            <p><b>Payment Reference:</b> ${order.reference}</p>
            <p style="margin-top:30px;">- Dkikishop Team</p>
          </div>
        `,
      });

      console.log('[EMAIL] Emails sent successfully to buyer and admin');
    } catch (emailErr) {
      console.error('[EMAIL] Failed:', emailErr.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[WEBHOOK CRASH]', err.message);
    return new Response('Server error', { status: 200 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};