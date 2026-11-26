import { z } from 'zod';
import { isValidHttpUrl, isValidSafeUrl } from '@/lib/url';

const optionalHttpUrl = z
  .string()
  .trim()
  .max(1000, 'URL maksimal 1000 karakter.')
  .refine((val) => val === '' || isValidHttpUrl(val), {
    message: 'URL harus diawali http:// atau https://.',
  });

const optionalSafeUrl = z
  .string()
  .trim()
  .max(1000, 'URL maksimal 1000 karakter.')
  .refine((val) => val === '' || isValidSafeUrl(val), {
    message: 'URL hanya boleh menggunakan http(s), mailto, atau tel.',
  });

const optionalEmail = z
  .string()
  .trim()
  .max(200, 'Email maksimal 200 karakter.')
  .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Format alamat email tidak valid.',
  });

export const loginSchema = z.object({
  password: z.string().min(1, 'Password wajib diisi.').max(256, 'Password terlalu panjang.'),
});

export const profileHeroSchema = z.object({
  full_name_1: z.string().trim().min(1, 'Nama depan wajib diisi.').max(120),
  full_name_2: z.string().trim().max(120),
  logo_text: z.string().trim().min(1, 'Logo teks wajib diisi.').max(20),
  role: z.string().trim().min(1, 'Peran / subjudul wajib diisi.').max(240),
  hero_cta_primary: z.string().trim().max(80),
  hero_cta_secondary: z.string().trim().max(80),
  hero_photo_url: optionalHttpUrl,
});

export const profileAboutSchema = z.object({
  about_text: z.string().trim().max(4000, 'Paragraf bio maksimal 4000 karakter.'),
  about_photo_url: optionalHttpUrl,
});

export const profileContactSeoSchema = z.object({
  contact_intro: z.string().trim().max(1000),
  whatsapp_url: optionalSafeUrl,
  linkedin_url: optionalSafeUrl,
  email: optionalEmail,
  location: z.string().trim().max(200),
  meta_title: z.string().trim().max(160),
  meta_description: z.string().trim().max(320),
  og_image_url: optionalHttpUrl,
});

export const profileUpdateSchema = z
  .object({
    full_name_1: z.string().trim().max(120).optional(),
    full_name_2: z.string().trim().max(120).optional(),
    logo_text: z.string().trim().max(20).optional(),
    role: z.string().trim().max(240).optional(),
    hero_cta_primary: z.string().trim().max(80).optional(),
    hero_cta_secondary: z.string().trim().max(80).optional(),
    hero_photo_url: optionalHttpUrl.optional(),
    about_photo_url: optionalHttpUrl.optional(),
    about_text: z.string().trim().max(4000).optional(),
    contact_intro: z.string().trim().max(1000).optional(),
    whatsapp_url: optionalSafeUrl.optional(),
    linkedin_url: optionalSafeUrl.optional(),
    email: optionalEmail.optional(),
    location: z.string().trim().max(200).optional(),
    meta_title: z.string().trim().max(160).optional(),
    meta_description: z.string().trim().max(320).optional(),
    og_image_url: optionalHttpUrl.optional(),
  })
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Minimal satu field profil harus dikirim.',
  });

export const sheetNameSchema = z.enum([
  'Facts',
  'Projects',
  'Certificates',
  'Experience',
  'Publications',
  'Skills',
]);

export const factInputSchema = z.object({
  value: z.string().trim().min(1, 'Nilai fakta wajib diisi.').max(60),
  label: z.string().trim().min(1, 'Label fakta wajib diisi.').max(160),
  visible: z.boolean().default(true),
});

export const projectPointSchema = z.object({
  label: z.string().trim().max(120).default(''),
  text: z.string().trim().min(1, 'Teks poin tidak boleh kosong.').max(1000),
});

export const projectImageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'URL gambar wajib diisi.')
    .max(1000)
    .refine((val) => isValidHttpUrl(val), {
      message: 'URL gambar harus diawali http:// atau https://.',
    }),
  caption: z.string().trim().max(400).default(''),
  wide: z.boolean().default(false),
});

export const projectInputSchema = z.object({
  title: z.string().trim().min(1, 'Judul project wajib diisi.').max(200),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9-]*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .default(''),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  description: z.string().trim().min(1, 'Deskripsi singkat wajib diisi.').max(2000),
  points: z.array(projectPointSchema).max(30).default([]),
  images: z.array(projectImageSchema).max(20).default([]),
  visible: z.boolean().default(true),
});

export const certificateInputSchema = z.object({
  title: z.string().trim().min(1, 'Judul sertifikat wajib diisi.').max(200),
  image_url: z
    .string()
    .trim()
    .min(1, 'Gambar sertifikat wajib diunggah.')
    .max(1000)
    .refine((val) => isValidHttpUrl(val), {
      message: 'URL gambar sertifikat tidak valid.',
    }),
  issuer: z.string().trim().max(160).default(''),
  issued_at: z.string().trim().max(80).default(''),
  credential_url: optionalSafeUrl.default(''),
  visible: z.boolean().default(true),
});

export const experienceInputSchema = z.object({
  type: z.enum(['work', 'education', 'training']),
  period: z.string().trim().min(1, 'Periode wajib diisi.').max(120),
  title: z.string().trim().min(1, 'Judul pengalaman wajib diisi.').max(200),
  subtitle: z.string().trim().max(600).default(''),
  points: z.array(z.string().trim().min(1).max(1000)).max(20).default([]),
  images: z.array(projectImageSchema).max(12).default([]),
  visible: z.boolean().default(true),
});

export const publicationInputSchema = z.object({
  title: z.string().trim().min(1, 'Judul publikasi wajib diisi.').max(300),
  venue: z.string().trim().min(1, 'Nama jurnal / penerbit wajib diisi.').max(200),
  date: z.string().trim().max(80).default(''),
  url: optionalSafeUrl.default(''),
  visible: z.boolean().default(true),
});

export const skillInputSchema = z.object({
  name: z.string().trim().min(1, 'Nama keahlian wajib diisi.').max(120),
  icon_url: optionalHttpUrl.default(''),
  visible: z.boolean().default(true),
});

export const reorderSchema = z.object({
  sheet: sheetNameSchema,
  ids: z.array(z.string().trim().min(1)).min(1, 'Daftar ID tidak boleh kosong.').max(200),
});

export const uploadImageSchema = z.object({
  filename: z.string().trim().min(1, 'Nama file wajib diisi.').max(160),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'Format gambar harus JPEG, PNG, atau WebP.' }),
  }),
  base64: z
    .string()
    .min(16, 'Data gambar tidak valid.')
    .max(7_000_000, 'Ukuran gambar melebihi batas 5 MB.')
    .regex(/^[A-Za-z0-9+/=]+$/, 'Format base64 tidak valid.'),
});

export const itemDeleteSchema = z.object({
  sheet: sheetNameSchema,
  id: z.string().trim().min(1, 'ID item wajib diisi.').max(64),
});

export const itemVisiblePatchSchema = z.object({
  visible: z.boolean(),
});

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function serializeItemForSheet(
  sheet: z.infer<typeof sheetNameSchema>,
  rawItem: unknown,
  isPartial = false
): Record<string, unknown> {
  // Fast path for visibility-only toggle
  if (isPartial && typeof rawItem === 'object' && rawItem !== null) {
    const keys = Object.keys(rawItem);
    if (keys.length === 1 && keys[0] === 'visible') {
      const parsed = itemVisiblePatchSchema.parse(rawItem);
      return { visible: parsed.visible };
    }
  }

  switch (sheet) {
    case 'Facts': {
      const data = factInputSchema.parse(rawItem);
      return {
        value: data.value,
        label: data.label,
        visible: data.visible,
      };
    }
    case 'Projects': {
      const data = projectInputSchema.parse(rawItem);
      return {
        title: data.title,
        slug: data.slug || slugify(data.title),
        tags: data.tags.join(', '),
        description: data.description,
        points: JSON.stringify(data.points),
        images: JSON.stringify(data.images),
        visible: data.visible,
      };
    }
    case 'Certificates': {
      const data = certificateInputSchema.parse(rawItem);
      return {
        title: data.title,
        image_url: data.image_url,
        issuer: data.issuer,
        issued_at: data.issued_at,
        credential_url: data.credential_url,
        visible: data.visible,
      };
    }
    case 'Experience': {
      const data = experienceInputSchema.parse(rawItem);
      return {
        type: data.type,
        period: data.period,
        title: data.title,
        subtitle: data.subtitle,
        points: JSON.stringify(data.points),
        images: JSON.stringify(data.images),
        visible: data.visible,
      };
    }
    case 'Publications': {
      const data = publicationInputSchema.parse(rawItem);
      return {
        title: data.title,
        venue: data.venue,
        date: data.date,
        url: data.url,
        visible: data.visible,
      };
    }
    case 'Skills': {
      const data = skillInputSchema.parse(rawItem);
      return {
        name: data.name,
        icon_url: data.icon_url,
        visible: data.visible,
      };
    }
  }
}

export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return 'Data tidak valid.';
  const path = first.path.length > 0 ? `${first.path.join('.')}: ` : '';
  return `${path}${first.message}`;
}
