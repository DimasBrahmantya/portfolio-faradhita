import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin-auth';
import { gasPost } from '@/lib/gas';
import { formatZodError, uploadImageSchema } from '@/lib/validation';

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

  const parsed = uploadImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const res = await gasPost<{ ok: boolean; url?: string; fileId?: string }>(
      'uploadImage',
      {
        filename: parsed.data.filename,
        mimeType: parsed.data.mimeType,
        base64: parsed.data.base64,
      }
    );

    if (!res.url) {
      throw new Error('Apps Script tidak mengembalikan URL gambar.');
    }

    return NextResponse.json({
      ok: true,
      url: res.url,
      fileId: res.fileId ?? '',
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal mengunggah gambar ke Drive.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
