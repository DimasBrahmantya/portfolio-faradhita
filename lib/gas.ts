import 'server-only';

interface GasBaseResponse {
  ok: boolean;
  error?: string;
}

export interface GasGetOptions {
  tags?: string[];
  revalidate?: number | false;
  cache?: RequestCache;
}

export function isGasConfigured(): boolean {
  const url = process.env.GAS_URL?.trim();
  const secret = process.env.GAS_SECRET?.trim();
  return Boolean(url && secret && !url.includes('XXXX'));
}

function getGasConfig(): { url: string; secret: string } {
  const url = process.env.GAS_URL?.trim();
  const secret = process.env.GAS_SECRET?.trim();
  if (!url || !secret) {
    throw new Error('GAS_URL atau GAS_SECRET belum dikonfigurasi di environment.');
  }
  return { url, secret };
}

async function parseGasResponse<T extends GasBaseResponse>(res: Response): Promise<T> {
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`GAS_NON_JSON (${res.status}): ${text.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('GAS_INVALID_RESPONSE');
  }

  const record = parsed as GasBaseResponse;
  if (!record.ok) {
    throw new Error(record.error || 'GAS_ERROR');
  }

  return parsed as T;
}

export async function gasGet<T extends GasBaseResponse>(
  action: string,
  options: GasGetOptions = {}
): Promise<T> {
  const { url, secret } = getGasConfig();
  const readSecret = process.env.GAS_READ_SECRET?.trim() || secret;
  const target = `${url}?action=${encodeURIComponent(action)}&secret=${encodeURIComponent(readSecret)}`;

  const fetchInit: RequestInit = {
    method: 'GET',
    redirect: 'follow',
  };

  if (options.cache) {
    fetchInit.cache = options.cache;
  } else if (options.tags || options.revalidate !== undefined) {
    fetchInit.next = {
      tags: options.tags,
      revalidate: options.revalidate,
    };
  }

  const res = await fetch(target, fetchInit);
  return parseGasResponse<T>(res);
}

export async function gasPost<T extends GasBaseResponse>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const { url, secret } = getGasConfig();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({ secret, action, ...payload }),
    redirect: 'follow',
    cache: 'no-store',
  });

  return parseGasResponse<T>(res);
}
