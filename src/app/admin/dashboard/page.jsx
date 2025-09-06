import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboardclient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if  (!session || !session.user || session.user.role !== 'admin') {
    redirect("/admin/login?callbackUrl=/admin/dashboard");
  }

  return <DashboardClient session={session} />;
}