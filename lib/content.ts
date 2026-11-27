import 'server-only';
import { cache } from 'react';

import { gasGet, isGasConfigured } from '@/lib/gas';
import { cleanIsoDates } from '@/lib/date';
import { safeHref, safeImageUrl } from '@/lib/url';
import { normalizeSiteText } from '@/lib/site-text';
import { resolveUniqueSlug } from '@/lib/validation';
import type {
  Certificate,
  ContentBundle,
  ContentResult,
  CustomSection,
  CustomSectionCard,
  CustomSectionPlacement,
  Experience,
  ExperienceType,
  Fact,
  Profile,
  Project,
  ProjectImage,
  ProjectPoint,
  Publication,
  Skill,
} from '@/types/content';

type UnknownRecord = Record<string, unknown>;

let lastKnownGoodContent: ContentBundle | null = null;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return cleanIsoDates(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function asOrder(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function asVisible(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  return String(value ?? 'TRUE').trim().toUpperCase() !== 'FALSE';
}

function safeJsonParse(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    return JSON.parse(trimmed);
  } catch {
    return [];
  }
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => asString(item).trim()).filter(Boolean);
  }
  const str = asString(raw);
  if (!str.trim()) return [];
  if (str.trim().startsWith('[')) {
    const parsed = safeJsonParse(str);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => asString(item).trim()).filter(Boolean);
    }
  }
  return str
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseProjectPoints(raw: unknown): ProjectPoint[] {
  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return [];
  const points: ProjectPoint[] = [];
  for (const entry of parsed) {
    if (typeof entry === 'string') {
      const text = entry.trim();
      if (text) points.push({ label: '', text });
      continue;
    }
    if (isRecord(entry)) {
      const text = asString(entry.text).trim();
      const label = asString(entry.label).trim();
      if (text) points.push({ label, text });
    }
  }
  return points;
}

function parseProjectImages(raw: unknown): ProjectImage[] {
  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return [];
  const images: ProjectImage[] = [];
  for (const entry of parsed) {
    if (!isRecord(entry)) continue;
    const url = safeImageUrl(asString(entry.url));
    if (!url) continue;
    images.push({
      url,
      caption: asString(entry.caption).trim(),
      wide: Boolean(entry.wide === true || String(entry.wide).toUpperCase() === 'TRUE'),
    });
  }
  return images;
}

function parseStringPoints(raw: unknown): string[] {
  const parsed = safeJsonParse(raw);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => asString(item).trim()).filter(Boolean);
  }
  const str = asString(raw).trim();
  if (!str) return [];
  return str
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeProfile(raw: unknown): Profile {
  const p = isRecord(raw) ? raw : {};
  const emailRaw = asString(p.email).trim();
  const whatsappRaw = asString(p.whatsapp_url).trim();
  const linkedinRaw = asString(p.linkedin_url).trim();

  return {
    ...normalizeSiteText(p),
    full_name_1: asString(p.full_name_1),
    full_name_2: asString(p.full_name_2),
    logo_text: asString(p.logo_text),
    role: asString(p.role),
    hero_cta_primary: asString(p.hero_cta_primary),
    hero_cta_secondary: asString(p.hero_cta_secondary),
    hero_photo_url: safeImageUrl(asString(p.hero_photo_url)),
    about_photo_url: safeImageUrl(asString(p.about_photo_url)),
    about_text: asString(p.about_text),
    contact_intro: asString(p.contact_intro),
    whatsapp_url: safeHref(whatsappRaw) ?? '',
    linkedin_url: safeHref(linkedinRaw) ?? '',
    email: emailRaw,
    location: asString(p.location),
    meta_title: asString(p.meta_title),
    meta_description: asString(p.meta_description),
    og_image_url: safeImageUrl(asString(p.og_image_url)),
  };
}

function normalizeFacts(raw: unknown): Fact[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item, idx) => ({
      id: asString(item.id),
      order: asOrder(item.order, idx + 1),
      visible: asVisible(item.visible),
      value: asString(item.value),
      label: asString(item.label),
    }))
    .filter((item) => Boolean(item.id))
    .sort((a, b) => a.order - b.order);
}

function normalizeProjects(raw: unknown): Project[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item, idx) => ({
      id: asString(item.id),
      order: asOrder(item.order, idx + 1),
      visible: asVisible(item.visible),
      title: asString(item.title),
      tags: parseTags(item.tags),
      description: asString(item.description),
      points: parseProjectPoints(item.points),
      images: parseProjectImages(item.images),
      slug: asString(item.slug),
    }))
    .filter((item) => Boolean(item.id))
    .sort((a, b) => a.order - b.order);
}

function normalizeCertificates(raw: unknown): Certificate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item, idx) => ({
      id: asString(item.id),
      order: asOrder(item.order, idx + 1),
      visible: asVisible(item.visible),
      title: asString(item.title),
      image_url: safeImageUrl(asString(item.image_url)),
      issuer: asString(item.issuer),
      issued_at: asString(item.issued_at),
      credential_url: safeHref(asString(item.credential_url)) ?? '',
    }))
    .filter((item) => Boolean(item.id))
    .sort((a, b) => a.order - b.order);
}

function normalizeExperienceType(raw: unknown): ExperienceType {
  const val = asString(raw).trim().toLowerCase();
  if (val === 'education' || val === 'training') return val;
  return 'work';
}

function normalizeExperience(raw: unknown): Experience[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item, idx) => ({
      id: asString(item.id),
      order: asOrder(item.order, idx + 1),
      visible: asVisible(item.visible),
      type: normalizeExperienceType(item.type),
      period: asString(item.period),
      title: asString(item.title),
      subtitle: asString(item.subtitle),
      points: parseStringPoints(item.points),
      images: parseProjectImages(item.images),
    }))
    .filter((item) => Boolean(item.id))
    .sort((a, b) => a.order - b.order);
}

function normalizePublications(raw: unknown): Publication[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item, idx) => ({
      id: asString(item.id),
      order: asOrder(item.order, idx + 1),
      visible: asVisible(item.visible),
      title: asString(item.title),
      venue: asString(item.venue),
      date: asString(item.date),
      url: safeHref(asString(item.url)) ?? '',
    }))
    .filter((item) => Boolean(item.id))
    .sort((a, b) => a.order - b.order);
}

function normalizeSkills(raw: unknown): Skill[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item, idx) => ({
      id: asString(item.id),
      order: asOrder(item.order, idx + 1),
      visible: asVisible(item.visible),
      name: asString(item.name),
      icon_url: safeImageUrl(asString(item.icon_url)),
      category: asString(item.category).trim(),
    }))
    .filter((item) => Boolean(item.id))
    .sort((a, b) => a.order - b.order);
}

const VALID_PLACEMENTS = new Set<CustomSectionPlacement>([
  'after-hero',
  'after-about',
  'after-projects',
  'after-experience',
  'after-certificates',
  'after-skills',
]);

function normalizePlacement(raw: unknown): CustomSectionPlacement {
  const val = asString(raw).trim() as CustomSectionPlacement;
  return VALID_PLACEMENTS.has(val) ? val : 'after-skills';
}

function parseCustomSectionCards(raw: unknown): CustomSectionCard[] {
  if (!Array.isArray(raw)) return [];
  const cards: CustomSectionCard[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    const title = asString(entry.title).trim();
    if (!title) continue;
    cards.push({
      title,
      subtitle: asString(entry.subtitle).trim(),
      description: asString(entry.description).trim(),
      url: safeHref(asString(entry.url)) ?? '',
      url_label: asString(entry.url_label).trim(),
    });
  }
  return cards;
}

function normalizeCustomSections(raw: unknown): CustomSection[] {
  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return [];
  const usedSlugs = new Set<string>();
  return parsed
    .filter(isRecord)
    .map((item, idx) => {
      const id = asString(item.id).trim();
      const heading = asString(item.heading).trim();
      const rawSlug = asString(item.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      const slug = resolveUniqueSlug(rawSlug || `section-${id || idx + 1}`, usedSlugs);
      usedSlugs.add(slug);
      return {
        id,
        order: asOrder(item.order, idx + 1),
        visible: asVisible(item.visible),
        slug,
        nav_label: asString(item.nav_label).trim(),
        show_in_nav: item.show_in_nav !== false,
        placement: normalizePlacement(item.placement),
        eyebrow: asString(item.eyebrow).trim(),
        heading,
        description: asString(item.description).trim(),
        items: parseCustomSectionCards(item.items),
        images: parseProjectImages(item.images),
      };
    })
    .filter((item) => Boolean(item.id && item.heading))
    .sort((a, b) => a.order - b.order);
}

export function normalizeContentBundle(raw: unknown): ContentBundle {
  const data = isRecord(raw) ? raw : {};
  const rawProfile = isRecord(data.profile) ? data.profile : {};
  return {
    profile: normalizeProfile(data.profile),
    facts: normalizeFacts(data.facts),
    projects: normalizeProjects(data.projects),
    certificates: normalizeCertificates(data.certificates),
    experience: normalizeExperience(data.experience),
    publications: normalizePublications(data.publications),
    skills: normalizeSkills(data.skills),
    custom_sections: normalizeCustomSections(rawProfile.custom_sections),
  };
}

function filterVisibleContent(bundle: ContentBundle): ContentBundle {
  return {
    profile: bundle.profile,
    facts: bundle.facts.filter((item) => item.visible),
    projects: bundle.projects.filter((item) => item.visible),
    certificates: bundle.certificates.filter((item) => item.visible),
    experience: bundle.experience.filter((item) => item.visible),
    publications: bundle.publications.filter((item) => item.visible),
    skills: bundle.skills.filter((item) => item.visible),
    custom_sections: bundle.custom_sections.filter((item) => item.visible),
  };
}

interface GasGetAllResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export const getPublicContent = cache(async (): Promise<ContentResult> => {
  if (!isGasConfigured()) {
    return {
      ok: false,
      data: lastKnownGoodContent ? filterVisibleContent(lastKnownGoodContent) : null,
      fromCache: Boolean(lastKnownGoodContent),
      error: 'Koneksi Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const res = await gasGet<GasGetAllResponse>('getAll', {
      tags: ['content'],
      revalidate: 300,
    });
    const normalized = normalizeContentBundle(res.data);
    lastKnownGoodContent = normalized;
    return {
      ok: true,
      data: filterVisibleContent(normalized),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data dari Apps Script.';
    if (lastKnownGoodContent) {
      return {
        ok: true,
        data: filterVisibleContent(lastKnownGoodContent),
        fromCache: true,
        error: message,
      };
    }
    return {
      ok: false,
      data: null,
      error: message,
    };
  }
});

export async function getAdminContent(): Promise<ContentResult> {
  if (!isGasConfigured()) {
    return {
      ok: false,
      data: null,
      error: 'GAS_URL atau GAS_SECRET belum dikonfigurasi di .env.local.',
    };
  }

  try {
    const res = await gasGet<GasGetAllResponse>('getAll', {
      cache: 'no-store',
    });
    const normalized = normalizeContentBundle(res.data);
    lastKnownGoodContent = normalized;
    return {
      ok: true,
      data: normalized,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memuat konten admin.';
    return {
      ok: false,
      data: null,
      error: message,
    };
  }
}

export const getContent = getPublicContent;
