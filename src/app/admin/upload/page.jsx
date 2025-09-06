// ✅ Server Component — no 'use client'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import UploadClient from "./UploadClient";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if  (!session || !session.user || session.user.role !== 'admin') {
    redirect("/admin/login");
  }

  return <UploadClient />;
}
