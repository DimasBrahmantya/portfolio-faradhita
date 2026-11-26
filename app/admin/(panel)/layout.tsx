import React from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAdminContent } from '@/lib/content';
import { AdminProvider } from '@/components/admin/AdminContext';
import { Sidebar } from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }

  const result = await getAdminContent();

  return (
    <AdminProvider
      initialContent={result.data}
      initialError={result.ok ? null : result.error ?? 'Gagal memuat data.'}
    >
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
        <Sidebar />
        <main className="lg:pl-[264px]">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </AdminProvider>
  );
}
