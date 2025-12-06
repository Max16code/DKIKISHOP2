export function verifyAdmin(req) {
  const secret = req.headers["x-admin-secret"];

  if (secret !== process.env.ADMIN_SECRET_KEY) {
    return false;
  }
  return true;
}
