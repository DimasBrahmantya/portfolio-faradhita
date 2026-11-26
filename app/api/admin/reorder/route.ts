import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin-auth';
import { gasPost } from '@/lib/gas';
import { formatZodError, reorderSchema } from '@/lib/validation';

export async function POST(request: Request) {
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

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await gasPost<{ ok: boolean }>('reorder', {
      sheet: parsed.data.sheet,
      ids: parsed.data.ids,
    });
    revalidateTag('content');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal menyimpan urutan baru.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
