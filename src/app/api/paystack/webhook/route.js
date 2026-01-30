// app/api/paystack/webhook/route.js
import crypto from 'crypto';
import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';
import { sendOrderEmails } from '@/lib/sendOrderEmails';

export async function POST(req) {
  let rawBody = '';

  try {
    // ─── 1. Get raw body FIRST (critical for signature) ───────────────────────
    rawBody = await req.text();

    // ─── 2. Verify Paystack signature ────────────────────────────────────────
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('Missing x-paystack-signature header');
      return new Response('Signature missing', { status: 401 });
    }

    const expectedHash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    if (expectedHash !== signature) {
      console.error('Invalid Paystack signature');
      return new Response('Invalid signature', { status: 401 });
    }

    // ─── 3. Parse the verified payload ───────────────────────────────────────
    const event = JSON.parse(rawBody);

    // Only process successful charges
    if (event.event !== 'charge.success') {
      return new Response(`Ignored event: ${event.event}`, { status: 200 });
    }

    const data = event.data;
    const metadata = data.metadata || {};

    // ─── 4. Validate required metadata (what you actually send) ──────────────
    if (!metadata.customer?.name || !metadata.customer?.email) {
      console.error('Missing customer name/email in metadata', { reference: data.reference });
      return new Response('Missing customer info', { status: 400 });
    }

    if (!Array.isArray(metadata.cartItems) || metadata.cartItems.length === 0) {
      console.error('Missing or empty cartItems in metadata', { reference: data.reference });
      return new Response('Missing cart items', { status: 400 });
    }

    // ─── 5. Connect to database ──────────────────────────────────────────────
    await dbConnect();

    // ─── 6. Create order document ────────────────────────────────────────────
    const order = await Order.create({
      reference: data.reference,

      customerName: metadata.customer.name,
      email: metadata.customer.email,
      phone: metadata.customer.phone || '',

      shippingAddress: {
        street: metadata.customer.address || '',
        city: metadata.customer.town || '',
        state: '', // ← you don't send state currently — add later if needed
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

      // Optional: store more Paystack info if useful for debugging/support
      paystackData: {
        channel: data.channel,
        ipAddress: data.ip_address,
        fees: data.fees / 100,
      },
    });

    // ─── 7. Send emails (admin + customer) ───────────────────────────────────
    try {
      await sendOrderEmails(order);
      console.log(`Emails sent for order ${order.reference}`);
    } catch (emailErr) {
      console.error('Email sending failed (order still saved):', emailErr);
      // → don't fail the webhook just because email failed
    }

    console.log(`Order created successfully: ${order.reference}`);

    // Always return 200 to Paystack — very important!
    return new Response(JSON.stringify({ success: true, reference: data.reference }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', {
      message: err.message,
      stack: err.stack,
      reference: err.reference || 'unknown',
      rawBodyLength: rawBody.length,
    });

    // Still return 200 in most cases so Paystack doesn't retry forever
    // Only return 4xx/5xx for permanent failures you want retried differently
    return new Response('Server error — order may need manual check', { status: 200 });
  }
}

// Optional: disable body parsing if you ever have strange issues (usually not needed in app router)
export const config = {
  api: {
    bodyParser: false, // ← usually not necessary anymore with req.text()
  },
};