import { NextResponse } from 'next/server';
import { getContent } from '@/lib/content';

/**
 * Route sementara untuk verifikasi koneksi getContent() ke Google Apps Script pada Tahap 1.
 * Akan dihapus setelah koneksi terverifikasi.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getContent();
  const data = result.data;

  return NextResponse.json({
    ok: result.ok,
    fromCache: Boolean(result.fromCache),
    error: result.error ?? null,
    counts: data
      ? {
          profileKeys: Object.keys(data.profile).filter(
            (k) => Boolean(data.profile[k as keyof typeof data.profile])
          ).length,
          facts: data.facts.length,
          projects: data.projects.length,
          certificates: data.certificates.length,
          experience: data.experience.length,
          publications: data.publications.length,
          skills: data.skills.length,
        }
      : null,
    data,
  });
}
