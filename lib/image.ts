export interface CompressedImageResult {
  base64: string;
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png';
  filename: string;
  previewDataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_INPUT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca file gambar.'));
    };
    img.src = objectUrl;
  });
}

function replaceExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
  return `${safe}.${ext}`;
}

export async function compressImageFile(
  file: File
): Promise<CompressedImageResult> {
  if (!ALLOWED_INPUT_TYPES.has(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.');
  }

  const img = await loadImage(file);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  if (!srcWidth || !srcHeight) {
    throw new Error('Dimensi gambar tidak valid.');
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(srcWidth, srcHeight));
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser tidak mendukung pemrosesan canvas.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Prefer WebP; fall back to JPEG if browser cannot encode WebP
  let mimeType: 'image/webp' | 'image/jpeg' = 'image/webp';
  let dataUrl = canvas.toDataURL('image/webp', QUALITY);

  if (!dataUrl.startsWith('data:image/webp')) {
    mimeType = 'image/jpeg';
    dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
  }

  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) {
    throw new Error('Gagal mengonversi gambar.');
  }

  const base64 = dataUrl.slice(commaIdx + 1);
  const sizeBytes = Math.floor((base64.length * 3) / 4);

  if (sizeBytes > MAX_BYTES) {
    throw new Error(
      `Ukuran gambar setelah kompres (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) melebihi batas 5 MB.`
    );
  }

  const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';

  return {
    base64,
    mimeType,
    filename: replaceExtension(file.name, ext),
    previewDataUrl: dataUrl,
    sizeBytes,
    width,
    height,
  };
}
