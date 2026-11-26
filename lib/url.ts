const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const ALLOWED_HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function isValidSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_HTTP_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function safeHref(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes('@') && !trimmed.includes(':') && !trimmed.includes('/')) {
    const mailto = `mailto:${trimmed}`;
    return isValidSafeUrl(mailto) ? mailto : null;
  }

  return isValidSafeUrl(trimmed) ? trimmed : null;
}

export function safeImageUrl(value: string | undefined | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return isValidHttpUrl(trimmed) ? trimmed : '';
}

export function extractDriveFileId(url: string): string | null {
  const lh3Match = url.match(/^https:\/\/lh3\.googleusercontent\.com\/d\/([^/?#=]+)/i);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  const driveFileMatch = url.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (driveFileMatch && driveFileMatch[1]) return driveFileMatch[1];

  const ucMatch = url.match(/^https:\/\/drive\.google\.com\/(?:uc|thumbnail)\?[^#]*\bid=([^&#]+)/i);
  if (ucMatch && ucMatch[1]) return decodeURIComponent(ucMatch[1]);

  return null;
}

export function getDriveImageCandidates(url: string): string[] {
  const trimmed = url.trim();
  if (!trimmed) return [];

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return [trimmed];

  const encoded = encodeURIComponent(fileId);
  const candidates = [
    `https://drive.google.com/thumbnail?id=${encoded}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${encoded}`,
    `https://drive.google.com/uc?export=view&id=${encoded}`,
  ];

  // Keep unique order, preferring thumbnail (most reliable in browsers) then lh3 then uc
  return Array.from(new Set(candidates));
}

export function getDriveFallbackUrl(url: string): string | null {
  const candidates = getDriveImageCandidates(url);
  const next = candidates.find((candidate) => candidate !== url);
  return next ?? null;
}
