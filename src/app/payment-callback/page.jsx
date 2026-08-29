'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    const isSuccess = reference !== null;
    const scheme = isSuccess ? 'flutter://payment-success' : 'flutter://payment-cancelled';
    window.location.href = scheme;
  }, [reference]);

  return <div style={{ textAlign: 'center', marginTop: '50px', color: 'white', background: 'black', height: '100vh' }}>Redirecting...</div>;
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectContent />
    </Suspense>
  );
}