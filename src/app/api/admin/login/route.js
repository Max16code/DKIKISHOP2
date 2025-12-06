import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ADMIN_PASSWORD_HASH } from "../../../../../config"; // adjust path

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const trimmedPassword = password?.trim();

    if (!trimmedPassword || typeof trimmedPassword !== "string") {
      return NextResponse.json({ error: "Invalid password format" }, { status: 400 });
    }

    // 🔐 Compare input password with stored hash
    const isMatch = await bcrypt.compare(trimmedPassword, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      console.log("Password mismatch!");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Admin login successful!");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
