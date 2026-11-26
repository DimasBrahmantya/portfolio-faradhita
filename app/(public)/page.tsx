import React from 'react';
import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { safeHref } from '@/lib/url';
import { Navbar, type NavLinkItem } from '@/components/public/Navbar';
import { LightboxProvider } from '@/components/public/Lightbox';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { Projects } from '@/components/public/Projects';
import { ExperienceSection } from '@/components/public/ExperienceSection';
import { Certificates } from '@/components/public/Certificates';
import { Skills } from '@/components/public/Skills';
import { ContactFooter } from '@/components/public/ContactFooter';
import { ErrorFallback } from '@/components/public/ErrorFallback';
import type { ContentBundle } from '@/types/content';

export const revalidate = 300;

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://faradhita.vercel.app'
).replace(/\/+$/, '');

function buildStructuredData(bundle: ContentBundle) {
  const { profile, skills, experience, certificates, publications } = bundle;
  const fullName =
    [profile.full_name_1, profile.full_name_2].filter(Boolean).join(' ') ||
    'Faradhita Eka Septiana';

  const sameAs = [
    safeHref(profile.linkedin_url),
    ...publications.map((pub) => safeHref(pub.url)),
  ].filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url)));

  const educationEntries = experience
    .filter((item) => item.type === 'education')
    .map((item) => ({
      '@type': 'CollegeOrUniversity',
      name: item.title,
    }));

  const knowsAbout = Array.from(
    new Set([
      ...skills.map((s) => s.name),
      'Data Analysis',
      'Data Science',
      'Data Visualization',
      'Natural Language Processing (NLP)',
      'RFM Customer Segmentation',
    ])
  );

  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': personId,
      name: fullName,
      givenName: profile.full_name_1 || 'Faradhita',
      familyName: profile.full_name_2 || 'Eka Septiana',
      alternateName: Array.from(
        new Set(
          [profile.full_name_1, profile.logo_text, fullName].filter(Boolean)
        )
      ),
      url: siteUrl,
      image: profile.hero_photo_url || profile.og_image_url || undefined,
      jobTitle: profile.role || 'Data Analyst & Data Science',
      description:
        profile.meta_description ||
        profile.about_text ||
        `Portofolio resmi ${fullName}`,
      email: profile.email ? `mailto:${profile.email}` : undefined,
      address: profile.location
        ? {
            '@type': 'PostalAddress',
            addressLocality: profile.location,
            addressCountry: 'ID',
          }
        : undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      knowsAbout,
      alumniOf: educationEntries.length > 0 ? educationEntries : undefined,
      hasCredential:
        certificates.length > 0
          ? certificates.map((cert) => ({
              '@type': 'EducationalOccupationalCredential',
              name: cert.title,
              credentialCategory: 'certificate',
              recognizedBy: cert.issuer
                ? { '@type': 'Organization', name: cert.issuer }
                : undefined,
            }))
          : undefined,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: `${fullName} – Portofolio Data`,
      url: siteUrl,
      inLanguage: 'id-ID',
      author: { '@id': personId },
      publisher: { '@id': personId },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${siteUrl}/#profilepage`,
      url: siteUrl,
      name: profile.meta_title || `${fullName} – Portofolio Data`,
      inLanguage: 'id-ID',
      isPartOf: { '@id': websiteId },
      mainEntity: { '@id': personId },
      about: { '@id': personId },
    },
  ];

  for (const pub of publications) {
    const pubUrl = safeHref(pub.url);
    graph.push({
      '@type': 'ScholarlyArticle',
      headline: pub.title,
      author: { '@id': personId },
      isPartOf: pub.venue ? { '@type': 'Periodical', name: pub.venue } : undefined,
      datePublished: pub.date || undefined,
      url: pubUrl || undefined,
      sameAs: pubUrl || undefined,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getContent();
  const profile = result.data?.profile;
  const skills = result.data?.skills ?? [];

  const fullName = profile
    ? [profile.full_name_1, profile.full_name_2].filter(Boolean).join(' ')
    : 'Faradhita Eka Septiana';

  const title =
    profile?.meta_title || `${fullName} – Data Analyst & Data Science Portfolio`;
  const description =
    profile?.meta_description ||
    profile?.about_text?.slice(0, 160) ||
    `Portofolio resmi ${fullName} — Data Analyst & Data Science.`;
  const ogImage = profile?.og_image_url || profile?.hero_photo_url || '';

  const dynamicKeywords = Array.from(
    new Set([
      fullName,
      profile?.full_name_1 || 'Faradhita',
      `Portofolio ${fullName}`,
      `${fullName} Data Analyst`,
      `${fullName} Data Science`,
      profile?.location ? `Data Analyst ${profile.location}` : '',
      ...skills.map((s) => s.name),
      'Data Analyst',
      'Data Science',
      'Visualisasi Data',
      'NLP',
      'RFM Analysis',
    ].filter(Boolean))
  );

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: dynamicKeywords,
    authors: [{ name: fullName, url: safeHref(profile?.linkedin_url) || siteUrl }],
    creator: fullName,
    publisher: fullName,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: `${fullName} – Portofolio`,
      type: 'profile',
      firstName: profile?.full_name_1 || 'Faradhita',
      lastName: profile?.full_name_2 || 'Eka Septiana',
      locale: 'id_ID',
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const result = await getContent();

  if (!result.data) {
    return (
      <>
        <Navbar logoText="FES" links={[]} />
        <ErrorFallback message={result.error} />
      </>
    );
  }

  const { profile, facts, projects, certificates, experience, publications, skills } =
    result.data;

  const hasAbout = Boolean(profile.about_text.trim() || profile.about_photo_url);
  const hasProjects = projects.length > 0;
  const hasExperience = experience.length > 0 || publications.length > 0;
  const hasCertificates = certificates.length > 0;
  const hasSkills = skills.length > 0;
  const hasContact = Boolean(
    profile.contact_intro.trim() ||
      safeHref(profile.whatsapp_url) ||
      safeHref(profile.linkedin_url) ||
      safeHref(profile.email)
  );

  const navLinks: NavLinkItem[] = [
    hasAbout ? { id: 'tentang', label: 'Tentang' } : null,
    hasProjects ? { id: 'project', label: 'Project' } : null,
    hasExperience ? { id: 'pengalaman', label: 'Pengalaman' } : null,
    hasCertificates ? { id: 'sertifikat', label: 'Sertifikat' } : null,
    hasSkills ? { id: 'keahlian', label: 'Keahlian' } : null,
    hasContact ? { id: 'kontak', label: 'Kontak' } : null,
  ].filter((item): item is NavLinkItem => item !== null);

  const structuredData = buildStructuredData(result.data);

  return (
    <LightboxProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <div className="flex min-h-screen flex-col">
        <Navbar logoText={profile.logo_text || 'FES'} links={navLinks} />

        {result.fromCache && (
          <div
            role="status"
            className="border-b border-[var(--line)] bg-[var(--soft)] px-5 py-2 text-center text-xs text-[var(--teal)]"
          >
            Menampilkan salinan cache terakhir karena koneksi pembaruan data sedang terkendala.
          </div>
        )}

        <main id="konten-utama" className="flex-1">
          <Hero
            profile={profile}
            facts={facts}
            hasProjects={hasProjects}
            hasContact={hasContact}
          />

          {hasAbout && <About profile={profile} facts={facts} />}

          {hasProjects && <Projects projects={projects} />}

          {hasExperience && (
            <ExperienceSection experience={experience} publications={publications} />
          )}

          {hasCertificates && <Certificates certificates={certificates} />}

          {hasSkills && <Skills skills={skills} />}
        </main>

        <ContactFooter profile={profile} />
      </div>
    </LightboxProvider>
  );
}
