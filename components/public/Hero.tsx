import React from 'react';
import { ArrowDownRight, MessageCircle } from 'lucide-react';
import type { Fact, Profile } from '@/types/content';
import { safeHref } from '@/lib/url';
import { SafeImage } from './SafeImage';

interface HeroProps {
  profile: Profile;
  facts: Fact[];
  hasAbout?: boolean;
  hasProjects: boolean;
  hasContact: boolean;
}

export function Hero({
  profile,
  facts,
  hasAbout = true,
  hasProjects,
  hasContact,
}: HeroProps) {
  const fullName = [profile.full_name_1, profile.full_name_2].filter(Boolean).join(' ') || 'Faradhita Eka Septiana';
  const autoEyebrow = [profile.location, profile.role.split('·')[0]?.trim()].filter(Boolean).join(' · ');
  const eyebrow = profile.hero_eyebrow.trim() || autoEyebrow;
  const hasPrimaryTarget = hasProjects || hasAbout;
  const primaryHref = hasProjects ? '#project' : '#tentang';
  const whatsappHref = safeHref(profile.whatsapp_url);
  const secondaryHref = hasContact ? '#kontak' : whatsappHref || '#tentang';
  const secondaryIsExternal = !hasContact && Boolean(whatsappHref);

  return (
    <section
      id="beranda"
      aria-labelledby="hero-heading"
      className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16"
    >
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 lg:gap-14">
        {/* Portrait Arch — top on mobile, right on desktop */}
        {profile.hero_photo_url && (
          <div
            className="animate-hero-scale-in order-1 flex justify-center md:order-2 md:col-span-5 md:justify-end"
            style={{ animationDelay: '120ms' }}
          >
            <div className="group w-full max-w-[280px] overflow-hidden rounded-t-full rounded-b-2xl border border-[var(--line)] bg-[var(--soft)] shadow-[var(--shadow-elevated)] transition-transform duration-500 hover:-translate-y-1 sm:max-w-[320px] lg:max-w-[360px]">
              <div className="aspect-[4/5] w-full overflow-hidden">
                <SafeImage
                  src={profile.hero_photo_url}
                  alt={`Foto profil ${fullName}`}
                  loading="eager"
                  fetchPriority="high"
                  width={360}
                  height={450}
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Editorial Copy + CTAs + Facts */}
        <div
          className={`order-2 md:order-1 ${
            profile.hero_photo_url ? 'md:col-span-7' : 'md:col-span-12 max-w-3xl'
          }`}
        >
          {eyebrow && (
            <p
              className="animate-hero-fade-up font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]"
              style={{ animationDelay: '40ms' }}
            >
              {eyebrow}
            </p>
          )}

          <h1
            id="hero-heading"
            className="animate-hero-fade-up mt-3 font-display text-[42px] font-extrabold leading-[1.06] tracking-[-0.02em] text-[var(--ink)] sm:text-[54px] lg:text-[68px]"
            style={{ animationDelay: '110ms' }}
          >
            <span className="block">{profile.full_name_1 || 'Faradhita'}</span>
            {profile.full_name_2 && (
              <span className="block text-[var(--acc)]">{profile.full_name_2}</span>
            )}
          </h1>

          {profile.role && (
            <p
              className="animate-hero-fade-up mt-5 max-w-xl text-base leading-relaxed text-[var(--mute)] sm:text-lg"
              style={{ animationDelay: '190ms' }}
            >
              {profile.role}
            </p>
          )}

          {(hasPrimaryTarget || hasContact || whatsappHref) && (
            <div
              className="animate-hero-fade-up mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              style={{ animationDelay: '260ms' }}
            >
              {hasPrimaryTarget && (
                <a
                  href={primaryHref}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--acc-btn)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--acc-btn-hover)] hover:shadow-md active:translate-y-0"
                >
                  <span>{profile.hero_cta_primary || 'Lihat Project'}</span>
                  <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}

              {(hasContact || whatsappHref) && (
                <a
                  href={secondaryHref}
                  target={secondaryIsExternal ? '_blank' : undefined}
                  rel={secondaryIsExternal ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--ink)]/30 bg-[var(--surf)] px-6 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--teal)] hover:text-[var(--teal)] hover:shadow-sm active:translate-y-0"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{profile.hero_cta_secondary || 'Hubungi Saya'}</span>
                </a>
              )}
            </div>
          )}

          {facts.length > 0 && (
            <dl
              className="animate-hero-fade-up mt-9 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-7 sm:grid-cols-3 sm:gap-6"
              style={{ animationDelay: '340ms' }}
            >
              {facts.map((fact) => (
                <div
                  key={fact.id}
                  className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surf)] p-3.5 transition-transform duration-300 hover:-translate-y-0.5 sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <dt className="order-2 mt-1 text-xs leading-snug text-[var(--mute)] sm:text-sm">
                    {fact.label}
                  </dt>
                  <dd className="order-1 font-display text-2xl font-bold tracking-tight text-[var(--teal)] sm:text-3xl">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
