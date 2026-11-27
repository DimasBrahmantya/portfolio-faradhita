import React from 'react';
import { Linkedin, Mail, MessageCircle } from 'lucide-react';
import type { Profile } from '@/types/content';
import { safeHref } from '@/lib/url';
import { Reveal } from './Reveal';

interface ContactFooterProps {
  profile: Profile;
}

export function ContactFooter({ profile }: ContactFooterProps) {
  const fullName = [profile.full_name_1, profile.full_name_2].filter(Boolean).join(' ') || 'Faradhita Eka Septiana';
  const whatsappHref = safeHref(profile.whatsapp_url);
  const linkedinHref = safeHref(profile.linkedin_url);
  const emailHref = safeHref(profile.email);
  const hasContactContent = Boolean(
    profile.contact_intro || whatsappHref || linkedinHref || emailHref
  );

  return (
    <div className="bg-[#0e171e] text-[#edf2f5]">
      {hasContactContent && (
        <section
          id="kontak"
          aria-labelledby="contact-heading"
          className="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-8 sm:pt-20"
        >
          <Reveal variant="fade-up">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#58c9d1]">
                {profile.contact_eyebrow}
              </p>
              <h2
                id="contact-heading"
                className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[#edf2f5] sm:text-[36px] lg:text-[42px]"
              >
                {profile.contact_heading}
              </h2>
              {profile.contact_intro && (
                <p className="mt-3 text-base leading-relaxed text-[#a4b5c2]">
                  {profile.contact_intro}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#c92a45] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ad2139]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>{profile.contact_whatsapp_label}</span>
                </a>
              )}

              {linkedinHref && (
                <a
                  href={linkedinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#3a4f5e] bg-[#16232d] px-5 py-2.5 text-sm font-semibold text-[#edf2f5] transition-colors hover:border-[#58c9d1] hover:text-[#58c9d1]"
                >
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                  <span>{profile.contact_linkedin_label}</span>
                </a>
              )}

              {emailHref && (
                <a
                  href={emailHref}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#3a4f5e] bg-[#16232d] px-5 py-2.5 text-sm font-semibold text-[#edf2f5] transition-colors hover:border-[#58c9d1] hover:text-[#58c9d1]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{profile.contact_email_label}</span>
                </a>
              )}
            </div>
          </div>
          </Reveal>
        </section>
      )}

      <footer className="border-t border-[#253744]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-[#a4b5c2] sm:flex-row sm:items-center sm:px-8">
          <p>
            {profile.footer_text.trim() || [profile.location, fullName].filter(Boolean).join(' · ')}
          </p>
          {profile.email && emailHref && (
            <a
              href={emailHref}
              className="font-mono text-xs text-[#a4b5c2] transition-colors hover:text-[#58c9d1]"
            >
              {profile.email}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
