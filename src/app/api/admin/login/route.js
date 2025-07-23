export async function POST(request) {
  const body = await request.json()
  const enteredPassword = body.password
  const correctPassword = process.env.ADMIN_PASSWORD

  console.log(' Entered password:', enteredPassword)
  console.log(' .env ADMIN_PASSWORD:', correctPassword)

  if (!correctPassword) {
    return new Response(JSON.stringify({ error: 'Server misconfigured: ADMIN_PASSWORD missing' }), {
      status: 500,
    });
  }

  if (enteredPassword ==correctPassword) {
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } else {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
}
