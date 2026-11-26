'use client';

import React from 'react';
import { BookOpen, Expand, ExternalLink } from 'lucide-react';
import type { Experience, ExperienceType, Publication } from '@/types/content';
import { safeHref } from '@/lib/url';
import { useLightbox } from './Lightbox';
import { Reveal } from './Reveal';
import { SafeImage } from './SafeImage';

interface ExperienceSectionProps {
  experience: Experience[];
  publications: Publication[];
}

const TYPE_LABELS: Record<ExperienceType, string> = {
  work: 'Pengalaman Kerja',
  education: 'Pendidikan',
  training: 'Pelatihan & Sertifikasi',
};

export function ExperienceSection({ experience, publications }: ExperienceSectionProps) {
  const { openLightbox } = useLightbox();

  if (experience.length === 0 && publications.length === 0) {
    return null;
  }

  return (
    <section
      id="pengalaman"
      aria-labelledby="experience-heading"
      className="border-y border-[var(--line)] bg-[var(--surf)] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal variant="fade-up">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
            03 / PENGALAMAN, PENDIDIKAN &amp; PUBLIKASI
          </p>
          <h2
            id="experience-heading"
            className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[36px] lg:text-[42px]"
          >
            Pengalaman kerja, magang, dan riset akademik
          </h2>
        </Reveal>

        {experience.length > 0 && (
          <ol className="relative mt-10 space-y-6 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-[var(--line)] md:before:left-[219px]">
            {experience.map((item, expIdx) => {
              const typeLabel = TYPE_LABELS[item.type] || 'Pengalaman';
              const dotColor =
                item.type === 'work' ? 'bg-[var(--teal)]' : 'bg-[var(--acc)]';

              const lightboxItems = item.images.map((img) => ({
                url: img.url,
                caption: img.caption,
                alt: img.caption || `${item.title} — dokumentasi`,
              }));

              return (
                <li
                  key={item.id}
                  className="relative grid grid-cols-1 gap-3 pl-8 md:grid-cols-[200px_28px_1fr] md:gap-4 md:pl-0"
                >
                  {/* Period + Type */}
                  <div className="md:pt-5 md:text-right">
                    {item.period && (
                      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                        {item.period}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs font-medium text-[var(--teal)]">
                      {typeLabel}
                    </p>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-[6px] top-1.5 flex items-start justify-center md:static md:pt-6">
                    <span
                      className={`h-[11px] w-[11px] rounded-full ring-4 ring-[var(--surf)] ${dotColor}`}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Detail Card */}
                  <Reveal variant="fade-up" delay={expIdx * 60}>
                    <article className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 transition-all duration-300 hover:border-[var(--teal)]/40 hover:shadow-[var(--shadow-elevated)] sm:p-6">
                    <h3 className="font-display text-lg font-bold leading-snug text-[var(--ink)] sm:text-xl">
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--mute)] sm:text-base">
                        {item.subtitle}
                      </p>
                    )}

                    {item.points.length > 0 && (
                      <ul className="mt-3.5 space-y-2 text-sm leading-relaxed text-[var(--mute)] sm:text-base">
                        {item.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span
                              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--teal)]"
                              aria-hidden="true"
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.images.length > 0 && (
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {item.images.map((img, imgIdx) => {
                          const altText =
                            img.caption || `${item.title} — dokumentasi ${imgIdx + 1}`;
                          return (
                            <figure
                              key={`${item.id}-img-${imgIdx}`}
                              className="flex flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surf)]"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  openLightbox(lightboxItems, imgIdx, 'DOKUMENTASI')
                                }
                                aria-label={`Perbesar gambar: ${altText}`}
                                className="group relative block w-full cursor-zoom-in overflow-hidden bg-[var(--soft)]/40 text-left"
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden">
                                  <SafeImage
                                    src={img.url}
                                    alt={altText}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                  />
                                </div>
                                <span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surf)]/90 text-[var(--ink)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                >
                                  <Expand className="h-3.5 w-3.5" />
                                </span>
                              </button>
                              {img.caption && (
                                <figcaption className="border-t border-[var(--line)] px-3 py-2 text-xs leading-snug text-[var(--mute)]">
                                  {img.caption}
                                </figcaption>
                              )}
                            </figure>
                          );
                        })}
                      </div>
                    )}
                  </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <div className="mt-10 space-y-4">
            {publications.map((pub, pubIdx) => {
              const href = safeHref(pub.url);
              const metaLabel = [pub.venue, pub.date].filter(Boolean).join(' · ');

              return (
                <Reveal key={pub.id} variant="fade-up" delay={pubIdx * 70}>
                  <article
                    className="flex flex-col justify-between gap-5 rounded-xl border border-[var(--line)] border-l-4 border-l-[var(--acc)] bg-[var(--bg)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] sm:flex-row sm:items-center sm:p-6"
                  >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-[var(--acc)]">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        PUBLIKASI JURNAL ILMIAH{metaLabel ? ` · ${metaLabel}` : ''}
                      </span>
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-[var(--ink)] sm:text-xl">
                      {pub.title}
                    </h3>
                    {href && (
                      <p className="mt-1.5 truncate font-mono text-xs text-[var(--mute)]">
                        {href.replace(/^https?:\/\//i, '')}
                      </p>
                    )}
                  </div>

                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--acc)]/40 bg-[var(--surf)] px-4 py-2 text-sm font-semibold text-[var(--acc)] transition-colors hover:border-[var(--acc)] hover:bg-[var(--acc-btn)] hover:text-white"
                    >
                      <span>Buka Artikel (DOI)</span>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
