import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApiAuth } from '@/lib/admin-auth';
import { gasPost } from '@/lib/gas';
import {
  formatZodError,
  itemDeleteSchema,
  serializeItemForSheet,
  sheetNameSchema,
} from '@/lib/validation';

const createBodySchema = z.object({
  sheet: sheetNameSchema,
  item: z.unknown(),
});

const updateBodySchema = z.object({
  sheet: sheetNameSchema,
  id: z.string().trim().min(1, 'ID item wajib diisi.').max(64),
  item: z.unknown(),
});

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

  const parsedEnvelope = createBodySchema.safeParse(body);
  if (!parsedEnvelope.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsedEnvelope.error) },
      { status: 400 }
    );
  }

  let serialized: Record<string, unknown>;
  try {
    serialized = serializeItemForSheet(
      parsedEnvelope.data.sheet,
      parsedEnvelope.data.item,
      false
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: formatZodError(err) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Data item tidak valid.' },
      { status: 400 }
    );
  }

  try {
    const res = await gasPost<{ ok: boolean; id?: string }>('createItem', {
      sheet: parsedEnvelope.data.sheet,
      item: serialized,
    });
    revalidateTag('content');
    return NextResponse.json({ ok: true, id: res.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal membuat item baru.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

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

  const parsedEnvelope = updateBodySchema.safeParse(body);
  if (!parsedEnvelope.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsedEnvelope.error) },
      { status: 400 }
    );
  }

  let serialized: Record<string, unknown>;
  try {
    serialized = serializeItemForSheet(
      parsedEnvelope.data.sheet,
      parsedEnvelope.data.item,
      true
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: formatZodError(err) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Data item tidak valid.' },
      { status: 400 }
    );
  }

  try {
    await gasPost<{ ok: boolean }>('updateItem', {
      sheet: parsedEnvelope.data.sheet,
      id: parsedEnvelope.data.id,
      item: serialized,
    });
    revalidateTag('content');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal memperbarui item.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
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

  const parsed = itemDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await gasPost<{ ok: boolean }>('deleteItem', {
      sheet: parsed.data.sheet,
      id: parsed.data.id,
    });
    revalidateTag('content');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Gagal menghapus item.';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
