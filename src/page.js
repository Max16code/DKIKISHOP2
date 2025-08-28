import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import EditProductPage from "../editproductpage";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role === "admin") redirect("/admin/login");

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/getproduct/${params.id}`, { 
    cache: 'no-store' 
  });
  if (!res.ok) redirect("/admin/dashboard");
  
  return <EditProductPage product={await res.json()} />;
}