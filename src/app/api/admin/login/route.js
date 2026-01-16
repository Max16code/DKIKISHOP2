import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { password } = await req.json();
    const trimmedPassword = password?.trim();

    // 🔹 Validate input
    if (!trimmedPassword || typeof trimmedPassword !== "string") {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    if (!ADMIN_PASSWORD_HASH) {
      console.error("Admin password hash is missing!");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // 🔹 Debug: log exactly what is being compared
    console.log("Password input:", `"${trimmedPassword}"`);
    console.log("Stored hash:", `"${ADMIN_PASSWORD_HASH}"`);

    // 🔐 Compare password with hash
    const isMatch = await bcrypt.compare(trimmedPassword, ADMIN_PASSWORD_HASH);
    console.log("isMatch:", isMatch);

    if (!isMatch) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    console.log("Admin login successful!");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
