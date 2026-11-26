import type { SheetName } from '@/types/content';

export interface ApiOkResponse {
  ok: true;
  id?: string;
  url?: string;
  fileId?: string;
}

interface ApiErrorResponse {
  ok: false;
  error?: string;
}

type ApiResponse = ApiOkResponse | ApiErrorResponse;

async function handleJson(res: Response): Promise<ApiOkResponse> {
  let json: ApiResponse;
  try {
    json = (await res.json()) as ApiResponse;
  } catch {
    throw new Error(`Respons server tidak valid (${res.status}).`);
  }

  if (!res.ok || !json.ok) {
    const errMsg = !json.ok && json.error ? json.error : `Permintaan gagal (${res.status}).`;
    throw new Error(errMsg);
  }

  return json;
}

export async function apiUpdateProfile(
  values: Record<string, string>
): Promise<void> {
  const res = await fetch('/api/admin/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
  await handleJson(res);
}

export async function apiCreateItem(
  sheet: SheetName,
  item: Record<string, unknown>
): Promise<string> {
  const res = await fetch('/api/admin/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, item }),
  });
  const data = await handleJson(res);
  return data.id ?? '';
}

export async function apiUpdateItem(
  sheet: SheetName,
  id: string,
  item: Record<string, unknown>
): Promise<void> {
  const res = await fetch('/api/admin/items', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, id, item }),
  });
  await handleJson(res);
}

export async function apiDeleteItem(
  sheet: SheetName,
  id: string
): Promise<void> {
  const res = await fetch('/api/admin/items', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, id }),
  });
  await handleJson(res);
}

export async function apiReorderItems(
  sheet: SheetName,
  ids: string[]
): Promise<void> {
  const res = await fetch('/api/admin/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet, ids }),
  });
  await handleJson(res);
}

export async function apiUploadImage(payload: {
  filename: string;
  mimeType: string;
  base64: string;
}): Promise<{ url: string; fileId: string }> {
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleJson(res);
  if (!data.url) {
    throw new Error('URL gambar tidak diterima dari server.');
  }
  return { url: data.url, fileId: data.fileId ?? '' };
}
