'use client';

import React from 'react';
import { Expand } from 'lucide-react';
import type { Profile, Project } from '@/types/content';
import { useLightbox } from './Lightbox';
import { Reveal } from './Reveal';
import { SafeImage } from './SafeImage';

interface ProjectsProps {
  projects: Project[];
  profile: Profile;
}

export function Projects({ projects, profile }: ProjectsProps) {
  const { openLightbox } = useLightbox();

  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="project"
      aria-labelledby="projects-heading"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <Reveal variant="fade-up">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
              {profile.projects_eyebrow}
            </p>
            <h2
              id="projects-heading"
              className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[36px] lg:text-[42px]"
            >
              {profile.projects_heading}
            </h2>
          </div>
          {profile.projects_hint && (
            <p className="text-sm text-[var(--mute)]">{profile.projects_hint}</p>
          )}
        </div>
      </Reveal>

      <div className="mt-10 space-y-8 lg:space-y-10">
        {projects.map((project, projectIdx) => {
          const lightboxItems = project.images.map((img) => ({
            url: img.url,
            caption: img.caption,
            alt: img.caption || `${project.title} — dokumentasi visual`,
          }));

          const isTwoImageSplit =
            project.images.length === 2 && !project.images[0].wide && project.images[1].wide;

          return (
            <Reveal key={project.id} variant="fade-up" delay={projectIdx * 60}>
              <article
                id={project.slug || undefined}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surf)] p-6 shadow-xs transition-all duration-300 hover:border-[var(--teal)]/40 hover:shadow-[var(--shadow-elevated)] sm:p-8"
              >
              <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--acc)]">
                {profile.projects_item_label} {String(projectIdx + 1).padStart(2, '0')}
              </p>

              <h3 className="mt-2 font-display text-[22px] font-bold leading-snug text-[var(--ink)] sm:text-[26px]">
                {project.title}
              </h3>

              {project.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Teknologi dan topik">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[6px] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--teal)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              {project.description && (
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--mute)]">
                  {project.description}
                </p>
              )}

              {project.points.length > 0 && (
                <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-[var(--ink)] sm:text-base">
                  {project.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--teal)]"
                        aria-hidden="true"
                      />
                      <span>
                        {point.label && (
                          <strong className="font-semibold text-[var(--ink)]">
                            {point.label}:{' '}
                          </strong>
                        )}
                        <span className="text-[var(--mute)]">{point.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {project.images.length > 0 && (
                <div
                  className={`mt-7 grid grid-cols-1 gap-4 ${
                    isTwoImageSplit ? 'md:grid-cols-12' : 'md:grid-cols-2'
                  }`}
                >
                  {project.images.map((image, imgIdx) => {
                    const spanClass = isTwoImageSplit
                      ? imgIdx === 0
                        ? 'md:col-span-5'
                        : 'md:col-span-7'
                      : image.wide
                        ? 'md:col-span-2'
                        : 'md:col-span-1';

                    const altText = image.caption || `${project.title} — gambar ${imgIdx + 1}`;

                    return (
                      <figure
                        key={`${project.id}-img-${imgIdx}`}
                        className={`flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)] ${spanClass}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openLightbox(
                              lightboxItems,
                              imgIdx,
                              `${profile.projects_item_label} ${String(projectIdx + 1).padStart(2, '0')}`
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
            </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
