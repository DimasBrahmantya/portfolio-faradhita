'use client';

import React from 'react';
import { Expand, ExternalLink } from 'lucide-react';
import type { Certificate, Profile } from '@/types/content';
import { safeHref } from '@/lib/url';
import { useLightbox } from './Lightbox';
import { Reveal } from './Reveal';
import { SafeImage } from './SafeImage';

interface CertificatesProps {
  certificates: Certificate[];
  profile: Profile;
}

export function Certificates({ certificates, profile }: CertificatesProps) {
  const { openLightbox } = useLightbox();

  if (certificates.length === 0) {
    return null;
  }

  const lightboxItems = certificates.map((cert) => ({
    url: cert.image_url,
    caption: [cert.title, cert.issuer, cert.issued_at].filter(Boolean).join(' · '),
    alt: `Sertifikat ${cert.title}${cert.issuer ? ` (${cert.issuer})` : ''}`,
  }));

  return (
    <section
      id="sertifikat"
      aria-labelledby="certificates-heading"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <Reveal variant="fade-up">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
              {profile.certificates_eyebrow}
            </p>
            <h2
              id="certificates-heading"
              className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[36px] lg:text-[42px]"
            >
              {profile.certificates_heading}
            </h2>
          </div>
          {profile.certificates_hint && (
            <p className="text-sm text-[var(--mute)]">{profile.certificates_hint}</p>
          )}
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert, idx) => {
          const credentialHref = safeHref(cert.credential_url);
          const meta = [cert.issuer, cert.issued_at].filter(Boolean).join(' · ');

          return (
            <Reveal key={cert.id} variant="scale-in" delay={(idx % 3) * 80} className="h-full">
              <article
                className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surf)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--teal)]/60 hover:shadow-[var(--shadow-elevated)]"
              >
              <button
                type="button"
                onClick={() => openLightbox(lightboxItems, idx, 'SERTIFIKAT')}
                aria-label={`Perbesar sertifikat ${cert.title}`}
                className="group relative block w-full cursor-zoom-in overflow-hidden border-b border-[var(--line)] bg-[var(--soft)]/40 text-left"
              >
                <div className="aspect-[4/3] w-full overflow-hidden p-2">
                  <SafeImage
                    src={cert.image_url}
                    alt={`Sertifikat ${cert.title}${cert.issuer ? ` — ${cert.issuer}` : ''}`}
                    loading="lazy"
                    className="h-full w-full rounded-md object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surf)]/90 text-[var(--ink)] opacity-0 shadow-xs transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Expand className="h-4 w-4" />
                </span>
              </button>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  {meta && (
                    <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--teal)]">
                      {meta}
                    </p>
                  )}
                  <h3 className="mt-1 text-base font-semibold leading-snug text-[var(--ink)]">
                    {cert.title}
                  </h3>
                </div>

                {credentialHref && (
                  <a
                    href={credentialHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--acc)] hover:underline"
                  >
                    <span>{profile.certificates_button}</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
