// app/api/paystack/webhook/route.js
import crypto from 'crypto';
import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';
import Product from '@/models/productModel'; // ← Added import for Product model
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
    console.log('Raw body preview:', rawBody.substring(0, 400));

    // Case-insensitive header lookup
    const signature =
      headers['x-paystack-signature'] ||
      headers['X-Paystack-Signature'] ||
      headers['x-paystack-signature'.toLowerCase()];

    if (!signature) {
      console.warn('No x-paystack-signature header found — possibly test or non-Paystack request');
      return new Response('No signature (ignored)', { status: 200 });
    }

    console.log('Received signature:', signature);

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is missing in environment variables');
      return new Response('Server config error', { status: 200 });
    }

    if (!secret.startsWith('sk_test_')) {
      console.warn(
        'Warning: PAYSTACK_SECRET_KEY does not start with sk_test_ — confirm you are using TEST mode secret key'
      );
    }

    const computedHash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    console.log('Computed HMAC:', computedHash);

    if (computedHash !== signature) {
      console.error('Signature verification FAILED', {
        computed: computedHash,
        received: signature,
        secretPreview: secret.substring(0, 12) + '...',
      });
      return new Response('Invalid signature (ignored)', { status: 200 });
    }

    console.log('Signature VERIFIED successfully');

    const event = JSON.parse(rawBody);

    if (event.event !== 'charge.success') {
      console.log('Ignored event:', event.event);
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
      console.error('Invalid or incomplete metadata', { reference: data.reference });
      return new Response('Bad metadata (ignored)', { status: 200 });
    }

    await dbConnect();

    // Prevent duplicate processing
    const existingOrder = await Order.findOne({ reference: data.reference });
    if (existingOrder) {
      console.log('Duplicate webhook — already processed:', data.reference);
      return new Response('Duplicate (ignored)', { status: 200 });
    }

    // Extract shopId from the first cart item (assuming single-shop order)
    const shopId = metadata.cartItems[0]?.shopId;
    if (!shopId) {
      console.warn('No shopId found in cart items — using fallback or skipping deduction');
      // You can set a default or throw if required
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

      shopId: shopId || 'fallback-shop-id', // ← Dynamic shopId from metadata (fallback if missing)
    });

    // ── INVENTORY DEDUCTION ────────────────────────────────────────────────────────
    try {
      console.log(`Starting stock deduction for order ${order.reference}`);

      for (const item of metadata.cartItems) {
        try {
          const updatedProduct = await Product.decrementStock(
            item.productId,
            item.quantity
          );

          console.log(
            `Stock deducted successfully: ${item.title} ` +
            `(ID: ${item.productId}) -${item.quantity} ` +
            `(new stock: ${updatedProduct.stock})`
          );
        } catch (itemErr) {
          console.error(
            `Stock deduction FAILED for item ${item.title} (ID: ${item.productId}):`,
            itemErr.message
          );
          // Optional: flag the order for manual review
          // order.stockIssue = order.stockIssue || '';
          // order.stockIssue += `Failed for ${item.title}: ${itemErr.message}; `;
          // await order.save();
        }
      }

      console.log(`Stock deduction completed for order ${order.reference}`);
    } catch (deductErr) {
      console.error('Unexpected error during stock deduction:', deductErr.message);
      // Order is still saved — Paystack got 200
    }

    // ── Send emails ────────────────────────────────────────────────────────────────
    try {
      await sendOrderEmails(order);
      console.log('Emails queued for order:', order.reference);
    } catch (emailErr) {
      console.error('Email sending failed (order still saved):', emailErr.message);
    }

    console.log('Order created successfully:', order.reference);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
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