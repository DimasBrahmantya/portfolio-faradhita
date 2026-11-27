'use client';

import React from 'react';
import { Expand, ExternalLink } from 'lucide-react';
import type { CustomSection } from '@/types/content';
import { safeHref } from '@/lib/url';
import { useLightbox } from './Lightbox';
import { Reveal } from './Reveal';
import { SafeImage } from './SafeImage';

interface CustomSectionBlockProps {
  section: CustomSection;
  tinted?: boolean;
}

export function CustomSectionBlock({ section, tinted = false }: CustomSectionBlockProps) {
  const { openLightbox } = useLightbox();

  const paragraphs = section.description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const lightboxItems = section.images.map((img) => ({
    url: img.url,
    caption: img.caption,
    alt: img.caption || `${section.heading} — dokumentasi`,
  }));

  const headingId = `custom-section-${section.slug}`;

  return (
    <section
      id={section.slug}
      aria-labelledby={headingId}
      className={
        tinted
          ? 'border-y border-[var(--line)] bg-[var(--surf)] py-16 sm:py-20 lg:py-24'
          : 'py-16 sm:py-20 lg:py-24'
      }
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal variant="fade-up">
          {section.eyebrow && (
            <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
              {section.eyebrow}
            </p>
          )}
          <h2
            id={headingId}
            className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[36px] lg:text-[42px]"
          >
            {section.heading}
          </h2>
          {paragraphs.length > 0 && (
            <div className="mt-5 max-w-3xl space-y-3 text-base leading-relaxed text-[var(--mute)]">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          )}
        </Reveal>

        {section.items.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, idx) => {
              const href = safeHref(item.url);
              return (
                <Reveal key={`${section.id}-item-${idx}`} variant="fade-up" delay={(idx % 3) * 70} className="h-full">
                  <article
                    className={`flex h-full flex-col justify-between rounded-xl border border-[var(--line)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--teal)]/50 hover:shadow-[var(--shadow-elevated)] ${
                      tinted ? 'bg-[var(--bg)]' : 'bg-[var(--surf)]'
                    }`}
                  >
                    <div>
                      {item.subtitle && (
                        <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--teal)]">
                          {item.subtitle}
                        </p>
                      )}
                      <h3 className="mt-1 font-display text-lg font-bold leading-snug text-[var(--ink)]">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2.5 text-sm leading-relaxed text-[var(--mute)]">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[var(--acc)] hover:underline"
                      >
                        <span>{item.url_label || 'Lihat Selengkapnya'}</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        {section.images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.images.map((image, imgIdx) => {
              const altText = image.caption || `${section.heading} — gambar ${imgIdx + 1}`;
              return (
                <figure
                  key={`${section.id}-img-${imgIdx}`}
                  className={`flex flex-col overflow-hidden rounded-xl border border-[var(--line)] ${
                    tinted ? 'bg-[var(--bg)]' : 'bg-[var(--surf)]'
                  } ${image.wide ? 'md:col-span-2' : 'md:col-span-1'}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox(
                        lightboxItems,
                        imgIdx,
                        (section.nav_label || section.heading).toUpperCase()
                      )
                    }
                    aria-label={`Perbesar gambar: ${altText}`}
                    className="group relative block w-full cursor-zoom-in overflow-hidden bg-[var(--soft)]/40 text-left"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <SafeImage
                        src={image.url}
                        alt={altText}
                        loading="lazy"
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surf)]/90 text-[var(--ink)] opacity-0 shadow-xs transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <Expand className="h-4 w-4" />
                    </span>
                  </button>
                  {image.caption && (
                    <figcaption className="border-t border-[var(--line)] px-4 py-2.5 text-xs leading-relaxed text-[var(--mute)]">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
