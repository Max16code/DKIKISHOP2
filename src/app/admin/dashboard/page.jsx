// src/app/admin/dashboard/page.jsx
// SERVER-ONLY PART – auth check + redirect
import { getSession } from '@/lib/session'; // make sure this file exists
import { redirect } from 'next/navigation';
import ClientDashboard from './ClientDashboard'; // we'll create this next

export default async function AdminDashboardPage() {
  const session = await getSession();

  // Simple check (no TS syntax)
  if (!session || !session.isAdmin) {
    redirect('/admin/login');
  }

  return <ClientDashboard />;
}