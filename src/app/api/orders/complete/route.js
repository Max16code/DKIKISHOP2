// /src/app/api/orders/complete/route.js
// THIS ROUTE IS NOW DEPRECATED – order completion is handled by the Paystack webhook
export async function POST(req) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Orders are now processed automatically via Paystack webhook only",
    }),
    { status: 400 }
  )
}
