import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import type { Fact, Profile } from '@/types/content';
import { Reveal } from './Reveal';
import { SafeImage } from './SafeImage';

interface AboutProps {
  profile: Profile;
  facts: Fact[];
}

export function About({ profile, facts }: AboutProps) {
  const paragraphs = profile.about_text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0 && !profile.about_photo_url) {
    return null;
  }

  const fullName = [profile.full_name_1, profile.full_name_2].filter(Boolean).join(' ') || 'Faradhita Eka Septiana';

  return (
    <section
      id="tentang"
      aria-labelledby="about-heading"
      className="border-y border-[var(--line)] bg-[var(--surf)] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 lg:gap-14">
          {/* Portrait Card + Meta */}
          {profile.about_photo_url && (
            <Reveal variant="fade-left" className="md:col-span-5 lg:col-span-4">
              <div className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
                <div className="aspect-[4/5] w-full overflow-hidden bg-[var(--soft)]">
                  <SafeImage
                    src={profile.about_photo_url}
                    alt={`Potret ${fullName}`}
                    loading="lazy"
                    width={400}
                    height={500}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                {(profile.role || profile.location) && (
                  <div className="space-y-1.5 border-t border-[var(--line)] p-4 text-xs text-[var(--mute)]">
                    {profile.role && (
                      <p className="flex items-start gap-2 font-medium text-[var(--ink)]">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                        <span>{profile.role}</span>
                      </p>
                    )}
                    {profile.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--teal)]" aria-hidden="true" />
                        <span>{profile.about_location_label}: {profile.location}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {/* Narrative + Facts */}
          <Reveal
            variant="fade-up"
            delay={100}
            className={profile.about_photo_url ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-12 max-w-3xl'}
          >
            <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
              {profile.about_eyebrow}
            </p>
            <h2
              id="about-heading"
              className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[36px] lg:text-[42px]"
            >
              {profile.about_heading}
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--mute)]">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {facts.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {facts.map((fact, idx) => (
                  <Reveal key={fact.id} variant="scale-in" delay={140 + idx * 70}>
                    <div className="h-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--teal)]/50 hover:shadow-sm">
                      <p className="font-display text-2xl font-bold text-[var(--teal)]">
                        {fact.value}
                      </p>
                      <p className="mt-1 text-sm text-[var(--mute)]">{fact.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
