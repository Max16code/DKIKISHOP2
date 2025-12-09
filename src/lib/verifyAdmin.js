export function verifyAdmin(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const adminCookie = cookieHeader
    .split("; ")
    .find(c => c.startsWith("admin_logged_in="));

  return adminCookie?.split("=")[1] === "true";
}
