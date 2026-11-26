import React from 'react';
import { notFound } from 'next/navigation';
import { AdminSectionClient } from '@/components/admin/AdminSectionClient';
import type { AdminSectionSlug } from '@/types/content';

const VALID_SECTIONS = new Set<AdminSectionSlug>([
  'profil',
  'tentang',
  'project',
  'sertifikat',
  'pengalaman',
  'publikasi',
  'keahlian',
  'kontak',
]);

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!VALID_SECTIONS.has(section as AdminSectionSlug)) {
    notFound();
  }

  return <AdminSectionClient section={section as AdminSectionSlug} />;
}
