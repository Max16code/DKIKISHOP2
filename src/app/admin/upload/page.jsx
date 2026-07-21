// src/app/admin/upload/page.jsx
// SERVER COMPONENT – auth check only
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import UploadForm from './UploadForm'; // create this next

export default async function UploadPage() {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect('/admin/login');
  }

  // Admin OK → render client form
  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <UploadForm />
    </div>
  );
}