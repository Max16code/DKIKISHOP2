// /api/verifyPayment/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/orderModel';

export async function POST(req) {
  const { reference, cartItems, email, totalAmount } = await req.json();

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Secure!
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (data.data.status === 'success') {
      await dbConnect();
      const newOrder = new Order({
        email,
        reference,
        amount: totalAmount,
        items: cartItems,
        status: 'Paid',
      });

      await newOrder.save();

      return NextResponse.json({ success: true, order: newOrder });
    } else {
      return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
