import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin-auth';
import { gasPost } from '@/lib/gas';
import { formatZodError, profileUpdateSchema } from '@/lib/validation';

export async function PUT(request: Request) {
  const authError = await requireAdminApiAuth();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Body JSON tidak valid.' },
      { status: 400 }
    );
  }

  const rawValues =
    typeof body === 'object' && body !== null && 'values' in body
      ? (body as { values: unknown }).values
      : body;

  const parsed = profileUpdateSchema.safeParse(rawValues);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await gasPost<{ ok: boolean }>('updateProfile', { values: parsed.data });
    revalidateTag('content');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal menyimpan profil.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
