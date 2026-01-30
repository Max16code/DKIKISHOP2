import dbConnect from '@/utils/db'
import Order from '@/models/orderModel'

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      reference,
      paid_at,
      metadata
    } = body

    await dbConnect()

    /* ============================
       VALIDATE METADATA (STRICT)
    ============================ */
    if (
      !metadata ||
      !metadata.customer ||
      !metadata.customer.name ||
      !metadata.customer.email ||
      !metadata.cartItems ||
      metadata.cartItems.length === 0
    ) {
      throw new Error('Invalid metadata structure')
    }

    const {
      customer,
      cartItems,
      subtotal,
      deliveryFee,
      totalAmount,
      eta
    } = metadata

    /* ============================
       CREATE ORDER
    ============================ */
    const order = await Order.create({
      reference,

      customerName: customer.name,
      email: customer.email,
      phone: customer.phone || '',

      shippingAddress: {
        street: customer.address,
        city: customer.town,
        state: '',
        postalCode: '',
        country: 'Nigeria'
      },

      items: cartItems.map(item => ({
        productId: item.productId,
        title: item.title,
        size: item.size || null,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        purchasedStock: item.quantity
      })),

      subtotal,
      shippingFee: deliveryFee || 0,
      totalAmount,

      eta,
      deliveryService: customer.service || '',
      portDeliveryOption: customer.portDeliveryOption || '',

      paymentMethod: 'paystack',
      paymentStatus: 'successful',
      paidAt: paid_at ? new Date(paid_at) : new Date()
    })

    console.log('✅ Order saved:', order.reference)

    return new Response(
      JSON.stringify({ status: 'success', orderId: order._id }),
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    )
  }
}
