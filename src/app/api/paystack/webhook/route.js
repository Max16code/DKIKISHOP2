// app/api/paystack/webhook/route.js
import crypto from 'crypto';
import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';
import Product from '@/models/productModel';
import { sendOrderEmails } from '@/lib/sendOrderEmails';

export async function POST(req) {
  let rawBody = '';

  try {
    rawBody = await req.text();

    const headers = Object.fromEntries(req.headers.entries());

    const signature =
      headers['x-paystack-signature'] ||
      headers['X-Paystack-Signature'] ||
      headers['x-paystack-signature'.toLowerCase()];

    if (!signature) {
      return new Response('Unauthorized', { status: 401 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return new Response('Server config error', { status: 500 });
    }

    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (computedHash !== signature) {
      return new Response('Invalid signature (ignored)', { status: 200 });
    }

    const event = JSON.parse(rawBody);

    if (event.event !== 'charge.success') {
      return new Response('Ignored event', { status: 200 });
    }

    const data = event.data;
    const metadata = data.metadata || {};

    if (
      !metadata.customer?.name ||
      !metadata.customer?.email ||
      !Array.isArray(metadata.cartItems) ||
      metadata.cartItems.length === 0
    ) {
      return new Response('Bad metadata (ignored)', { status: 200 });
    }

    await dbConnect();

    // Prevent duplicate processing
    const existingOrder = await Order.findOne({ reference: data.reference });
    if (existingOrder) {
      return new Response('Duplicate (ignored)', { status: 200 });
    }

    // Extract shopId from the first cart item (assuming single-shop order)
    const shopId = metadata.cartItems[0]?.shopId;

    const order = await Order.create({
      reference: data.reference,
      customerName: metadata.customer.name,
      email: metadata.customer.email,
      phone: metadata.customer.phone || '',
      shippingAddress: {
        street: metadata.customer.address || '',
        city: metadata.customer.town || '',
        state: '',
        country: 'Nigeria',
      },
      deliveryService: metadata.customer.service || 'Unknown',
      deliveryOption:
        metadata.customer.service === 'Portharcourt'
          ? metadata.customer.portDeliveryOption || ''
          : undefined,
      items: metadata.cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        size: item.size || null,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      subtotal: Number(metadata.subtotal) || 0,
      shippingFee: Number(metadata.deliveryFee) || 0,
      totalAmount: Number(metadata.totalAmount) || Number(data.amount) / 100,
      eta: metadata.eta || 'Not specified',
      paymentMethod: 'paystack',
      paymentStatus: 'successful',
      paidAt: new Date(data.paid_at || Date.now()),
      paystackData: {
        channel: data.channel,
        ipAddress: data.ip_address,
        fees: data.fees / 100,
      },
      shopId: shopId || 'fallback-shop-id',
    });

    // Inventory deduction
    try {
      for (const item of metadata.cartItems) {
        try {
          await Product.decrementStock(item.productId, item.quantity);
        } catch (itemErr) {
          // Silent fail per item — order is still valid
        }
      }
    } catch (deductErr) {
      // Silent fail — order is saved
    }

    // Send emails
    try {
      await sendOrderEmails(order);
    } catch (emailErr) {
      // Silent fail — order is saved
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Keep this one – useful for production monitoring
    console.error('Webhook processing error:', {
      message: err.message,
      stack: err.stack?.substring(0, 800) || 'No stack available',
      rawBodyLength: rawBody.length,
    });

    return new Response('Server error — check logs', { status: 200 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};