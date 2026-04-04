import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, amount, metadata } = await request.json();

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        metadata,
        callback_url: 'https://www.dkikishop.com/payment-callback', // redirector page
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Initiate payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}