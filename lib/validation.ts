import { z } from 'zod';
import { isValidHttpUrl, isValidSafeUrl } from '@/lib/url';
import { SITE_TEXT_KEYS, SITE_TEXT_MAX, type SiteTextKey } from '@/lib/site-text';

const siteTextUpdateShape = Object.fromEntries(
  SITE_TEXT_KEYS.map((key) => [
    key,
    z.string().trim().max(SITE_TEXT_MAX, `Teks maksimal ${SITE_TEXT_MAX} karakter.`).optional(),
  ])
) as Record<SiteTextKey, z.ZodOptional<z.ZodString>>;

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

export const profileUpdateSchema = profileHeroSchema
  .merge(profileAboutSchema)
  .merge(profileContactSeoSchema)
  .partial()
  .extend({
    custom_sections: z
      .string()
      .max(48000, 'Data section kustom melebihi batas ukuran Google Sheets.')
      .refine(
        (val) => {
          if (!val.trim()) return true;
          try {
            const parsed = JSON.parse(val);
            return customSectionsArraySchema.safeParse(parsed).success;
          } catch {
            return false;
          }
        },
        { message: 'Format data section kustom tidak valid.' }
      )
      .optional(),
    ...siteTextUpdateShape,
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
  category: z.string().trim().max(80, 'Kategori maksimal 80 karakter.').default(''),
  visible: z.boolean().default(true),
});

export const customSectionPlacementSchema = z.enum([
  'after-hero',
  'after-about',
  'after-projects',
  'after-experience',
  'after-certificates',
  'after-skills',
]);

export const customSectionCardSchema = z.object({
  title: z.string().trim().min(1, 'Judul item wajib diisi.').max(200),
  subtitle: z.string().trim().max(160).default(''),
  description: z.string().trim().max(1000).default(''),
  url: optionalSafeUrl.default(''),
  url_label: z.string().trim().max(80).default(''),
});

export const customSectionInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .default(''),
  nav_label: z.string().trim().max(40).default(''),
  show_in_nav: z.boolean().default(true),
  placement: customSectionPlacementSchema.default('after-skills'),
  eyebrow: z.string().trim().max(120).default(''),
  heading: z.string().trim().min(1, 'Judul section wajib diisi.').max(200),
  description: z.string().trim().max(3000).default(''),
  items: z.array(customSectionCardSchema).max(20).default([]),
  images: z.array(projectImageSchema).max(12).default([]),
  visible: z.boolean().default(true),
});

export const customSectionStoredSchema = customSectionInputSchema.extend({
  id: z.string().trim().min(1).max(64),
  order: z.number().int().min(0).default(0),
});

export const customSectionsArraySchema = z.array(customSectionStoredSchema).max(15);

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

export const RESERVED_SECTION_SLUGS = new Set([
  'beranda',
  'konten-utama',
  'tentang',
  'project',
  'pengalaman',
  'sertifikat',
  'keahlian',
  'kontak',
]);

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function resolveUniqueSlug(rawSlug: string, usedSlugs: Iterable<string>): string {
  const taken = new Set(usedSlugs);
  const base = slugify(rawSlug) || 'section';
  if (!taken.has(base) && !RESERVED_SECTION_SLUGS.has(base)) {
    return base;
  }
  let n = 2;
  let candidate = `${base.slice(0, 76)}-${n}`;
  while (taken.has(candidate) || RESERVED_SECTION_SLUGS.has(candidate)) {
    n += 1;
    candidate = `${base.slice(0, 76)}-${n}`;
  }
  return candidate;
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
        category: data.category,
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
