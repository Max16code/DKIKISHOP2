export async function GET() {
  return Response.json({
    hash: process.env.ADMIN_PASSWORD_HASH || "NOT FOUND"
  });
}
