import dbConnect from '@/utils/db';
import Order from '@/models/orderModel';

export async function POST(req) {
  try {
    const { reference, metadata, paid_at } = await req.json();

    await dbConnect();

    // Validate required metadata
    if (!metadata || !metadata.customerName || !metadata.email || !metadata.cartItems?.length) {
      throw new Error('Invalid metadata: missing customer or cart info');
    }

    const order = await Order.create({
      reference,
      customerName: metadata.customerName,
      email: metadata.email,
      phone: metadata.phone,
      shippingAddress: {
        street: metadata.shippingAddress.street,
        city: metadata.shippingAddress.city,
        state: metadata.shippingAddress.state || '',
        postalCode: metadata.shippingAddress.postalCode || '',
        country: metadata.shippingAddress.country || 'Nigeria'
      },
      items: metadata.cartItems.map(item => ({
        productId: item.productId,
        title: item.title,
        size: item.size || null,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        purchasedStock: item.quantity
      })),
      subtotal: metadata.subtotal,
      shippingFee: metadata.deliveryFee || 0,
      totalAmount: metadata.totalAmount,
      paymentMethod: 'paystack',
      paymentStatus: 'successful',
      paidAt: paid_at ? new Date(paid_at) : new Date()
    });

    console.log('✅ Order saved:', order.reference);

    // Optionally: trigger email function here
    // await sendOrderEmails(order);

    return new Response(JSON.stringify({ status: 'success', order: order._id }), { status: 200 });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
