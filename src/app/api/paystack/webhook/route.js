import crypto from 'crypto'
import dbConnect from '@/utils/db'
import Order from '@/models/orderModel'
import { sendOrderEmails } from '@/lib/sendOrderEmails'

export async function POST(req) {
  try {
    // 1️⃣ Get raw body
    const rawBody = await req.text()

    // 2️⃣ Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature')
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')

    if (hash !== signature) {
      return new Response('Invalid signature', { status: 401 })
    }

    // 3️⃣ Parse verified body
    const body = JSON.parse(rawBody)

    if (body.event !== 'charge.success') {
      return new Response('Event ignored', { status: 200 })
    }

    const data = body.data
    const metadata = data.metadata

    if (
      !metadata ||
      !metadata.customerName ||
      !metadata.email ||
      !Array.isArray(metadata.cartItems)
    ) {
      throw new Error('Invalid metadata: missing customer or cart info')
    }

    await dbConnect()

    const order = await Order.create({
      reference: data.reference,

      customerName: metadata.customerName,
      email: metadata.email,
      phone: metadata.phone,

      shippingAddress: {
        street: metadata.shippingAddress.street,
        city: metadata.shippingAddress.city,
        state: metadata.shippingAddress.state || '',
        postalCode: metadata.shippingAddress.postalCode || '',
        country: metadata.shippingAddress.country || 'Nigeria',
      },

      items: metadata.cartItems.map(item => ({
        productId: item.productId,
        title: item.title,
        size: item.size || null,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),

      subtotal: Number(metadata.subtotal),
      shippingFee: Number(metadata.deliveryFee || 0),
      totalAmount: Number(metadata.totalAmount),

      eta: metadata.eta,

      paymentMethod: 'paystack',
      paymentStatus: 'successful',
      paidAt: new Date(data.paid_at),
    })

    await sendOrderEmails(order)

    console.log('✅ Order saved:', order.reference)

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('❌ Webhook error:', err)
    return new Response(err.message, { status: 500 })
  }
}
