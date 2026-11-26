import React, { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-sm text-[var(--mute)]">
          Memuat halaman login…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
