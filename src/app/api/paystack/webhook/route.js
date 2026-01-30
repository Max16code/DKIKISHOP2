import crypto from 'crypto'
import { headers } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/orderModel'
import { sendOrderEmails } from '@/lib/sendOrderEmails'


export async function POST(req) {
    // 1️⃣ Get raw body (Paystack requires raw body for signature verification)
    const body = await req.text()

    // 2️⃣ Verify Paystack signature
    const signature = headers().get('x-paystack-signature')

    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(body)
        .digest('hex')

    if (hash !== signature) {
        console.error('❌ Invalid Paystack signature')
        return new Response('Invalid signature', { status: 401 })
    }

    // 3️⃣ Parse event
    const event = JSON.parse(body)

    // 4️⃣ Only handle successful charges
    if (event.event !== 'charge.success') {
        return new Response('Ignored event', { status: 200 })
    }

    const data = event.data

    /**
     * EXPECTED METADATA (must exist from payment initialization):
     * metadata: {
     *   orderId,
     *   cartItems,
     *   deliveryAddress,
     *   customer
     * }
     */
    const {
        reference,
        amount,
        paid_at,
        customer,
        metadata
    } = data

    if (!metadata || !metadata.cartItems) {
        console.error('❌ Missing order metadata')
        return new Response('Missing metadata', { status: 400 })
    }

    try {
        // 5️⃣ Connect to DB
        await dbConnect()

        // 6️⃣ Prevent duplicate order creation
        const existingOrder = await Order.findOne({ reference })
        if (existingOrder) {
            return new Response('Order already exists', { status: 200 })
        }

        // 7️⃣ Create order
        const order = await Order.create({
            reference,
            orderId: metadata.orderId,
            customer: {
                email: customer.email,
                phone: metadata.customer?.phone || '',
                name: metadata.customer?.name || '',
                service: metadata.customer?.service || '',
                portDeliveryOption: metadata.customer?.portDeliveryOption || '',
            },
            items: metadata.cartItems,
            deliveryAddress: metadata.deliveryAddress,
            totalAmount: metadata.totalAmount / 1, // already in Naira
            paymentStatus: 'paid',
            paymentProvider: 'paystack',
            paidAt: paid_at,

            // ✅ New fields
            eta: metadata.eta || '',
            deliveryFee: metadata.deliveryFee || 0,
        })

        // 🔔 THIS LINE is what removes the dull import
        try {
            await sendOrderEmails({ order })
        } catch (err) {
            console.error('Email failed:', err)
        }

        return new Response('Order processed', { status: 200 })


    } catch (error) {
        console.error('❌ Webhook error:', error)
        return new Response('Server error', { status: 500 })
    }
}
