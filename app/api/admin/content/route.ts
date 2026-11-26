import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin-auth';
import { getAdminContent } from '@/lib/content';

export async function GET() {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  const result = await getAdminContent();
  if (!result.ok || !result.data) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Gagal memuat data konten.' },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { ok: true, data: result.data },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
