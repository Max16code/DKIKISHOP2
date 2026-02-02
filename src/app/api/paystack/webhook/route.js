// app/api/paystack/webhook/route.js
import crypto from 'crypto';
import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';
import { sendOrderEmails } from '@/lib/sendOrderEmails';

export async function POST(req) {
  let rawBody = '';

  try {
    rawBody = await req.text();

    const headers = Object.fromEntries(req.headers.entries());
    console.log('=== WEBHOOK HIT ===');
    console.log('Time:', new Date().toISOString());
    console.log('Headers (raw):', JSON.stringify(headers, null, 2));
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body preview:', rawBody.substring(0, 400)); // first part for debug

    // Case-insensitive header lookup (Vercel/proxies sometimes lowercase)
    const signature = headers['x-paystack-signature'] || headers['X-Paystack-Signature'];

    if (!signature) {
      console.error('No x-paystack-signature header found');
      return new Response('No signature', { status: 200 });
    }

    console.log('Received signature:', signature);

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is missing in env');
      return new Response('Server config error', { status: 200 });
    }
    if (!secret.startsWith('sk_test_')) {
      console.warn('Warning: PAYSTACK_SECRET_KEY does NOT start with sk_test_ — are you using TEST mode secret?');
    }

    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody) // MUST be raw string, NOT JSON.stringify(rawBody)
      .digest('hex');

    console.log('Computed HMAC:', computedHash);

    if (computedHash !== signature) {
      console.error('Signature verification FAILED', {
        computed: computedHash,
        received: signature,
        secretStartsWith: secret.substring(0, 10) + '...', // for debug
      });
      // Still return 200 — Paystack stops retrying only on 2xx
      return new Response('Invalid signature', { status: 200 });
    }

    console.log('Signature VERIFIED successfully');

    const event = JSON.parse(rawBody);

    if (event.event !== 'charge.success') {
      console.log('Ignored event:', event.event);
      return new Response('Ignored', { status: 200 });
    }

    const data = event.data;
    const metadata = data.metadata || {};

    if (!metadata.customer?.name || !metadata.customer?.email || !Array.isArray(metadata.cartItems)) {
      console.error('Invalid metadata', { reference: data.reference });
      return new Response('Bad metadata', { status: 200 });
    }

    await dbConnect();

    // Idempotency: prevent duplicate orders
    const existingOrder = await Order.findOne({ reference: data.reference });
    if (existingOrder) {
      console.log('Duplicate webhook - already processed', data.reference);
      return new Response('Duplicate', { status: 200 });
    }

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
        metadata.customer.service === 'Portharcourt' ? metadata.customer.portDeliveryOption || '' : undefined,
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
      // If shopId is required in schema → add it here (temporary fix)
      // shopId: 'your-default-shop-id' || metadata.shopId,
    });

    try {
      await sendOrderEmails(order);
      console.log('Emails queued for', order.reference);
    } catch (emailErr) {
      console.error('Email failed (order saved):', emailErr);
    }

    console.log('Order created:', order.reference);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error('Webhook crash:', err.message, err.stack?.substring(0, 500));
    return new Response('Error - check logs', { status: 200 });
  }
}

export const config = {
  api: {
    bodyParser: false,  // Critical — keeps raw body intact
  },
};