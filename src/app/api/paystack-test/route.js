// /app/api/paystack-test/route.js
export async function POST(req) {
  const body = await req.text();
  console.log('🧪 TEST WEBHOOK RECEIVED:', body);
  return new Response('OK', { status: 200 });
}

export async function GET() {
  return new Response('Test endpoint working', { status: 200 });
}