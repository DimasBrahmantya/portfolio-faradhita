import React from 'react';
import type { Profile, Skill } from '@/types/content';
import { Reveal } from './Reveal';
import { SkillIcon } from './SkillIcon';

interface SkillsProps {
  skills: Skill[];
  profile: Profile;
}

interface SkillGroup {
  label: string;
  items: Skill[];
}

const AUTO_CATEGORY_ORDER = [
  'Bahasa & Notebook',
  'Visualisasi & BI',
  'Produktivitas & Office',
];

/** Tebakan kategori dari nama, dipakai hanya jika kolom kategori di admin kosong. */
function detectSkillCategory(name: string): string | null {
  const lower = name.toLowerCase();
  if (
    lower.includes('python') ||
    lower.includes('colab') ||
    lower.includes('vs code') ||
    lower.includes('visual studio') ||
    lower.includes('jupyter') ||
    lower.includes('sql') ||
    lower.includes('r ') ||
    lower === 'r' ||
    lower.includes('git')
  ) {
    return 'Bahasa & Notebook';
  }
  if (
    lower.includes('looker') ||
    lower.includes('tableau') ||
    lower.includes('power bi') ||
    lower.includes('figma') ||
    lower.includes('seaborn') ||
    lower.includes('matplotlib')
  ) {
    return 'Visualisasi & BI';
  }
  if (
    lower.includes('excel') ||
    lower.includes('word') ||
    lower.includes('powerpoint') ||
    lower.includes('spreadsheet') ||
    lower.includes('sheets') ||
    lower.includes('office')
  ) {
    return 'Produktivitas & Office';
  }
  return null;
}

export function Skills({ skills, profile }: SkillsProps) {
  if (skills.length === 0) {
    return null;
  }

  const fallbackCategory = profile.skills_default_category;
  const groupedMap = new Map<string, Skill[]>();
  for (const skill of skills) {
    const cat = skill.category || detectSkillCategory(skill.name) || fallbackCategory;
    const existing = groupedMap.get(cat) ?? [];
    existing.push(skill);
    groupedMap.set(cat, existing);
  }

  const rank = (label: string) => {
    if (label === fallbackCategory) return Number.MAX_SAFE_INTEGER;
    const idx = AUTO_CATEGORY_ORDER.indexOf(label);
    return idx === -1 ? AUTO_CATEGORY_ORDER.length : idx;
  };

  // Map mempertahankan urutan kemunculan; sort stabil menjaga urutan kategori kustom.
  const groups: SkillGroup[] = Array.from(groupedMap, ([label, items]) => ({ label, items })).sort(
    (a, b) => rank(a.label) - rank(b.label)
  );

  return (
    <section
      id="keahlian"
      aria-labelledby="skills-heading"
      className="border-y border-[var(--line)] bg-[var(--surf)] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal variant="fade-up">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--teal)]">
            {profile.skills_eyebrow}
          </p>
          <h2
            id="skills-heading"
            className="mt-3 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[36px] lg:text-[42px]"
          >
            {profile.skills_heading}
          </h2>
        </Reveal>

        <div className="mt-10 space-y-4">
          {groups.map((group, groupIdx) => (
            <Reveal key={group.label} variant="fade-up" delay={groupIdx * 90}>
              <div className="grid grid-cols-1 items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 transition-all duration-300 hover:border-[var(--teal)]/40 hover:shadow-[var(--shadow-elevated)] md:grid-cols-[220px_1fr]">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--mute)]">
                  {group.label}
                </h3>

                <ul className="flex flex-wrap gap-3">
                  {group.items.map((skill) => (
                    <li
                      key={skill.id}
                      className="group inline-flex min-h-[44px] items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surf)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--teal)]/60 hover:shadow-sm"
                    >
                      <SkillIcon name={skill.name} iconUrl={skill.icon_url} />
                      <span>{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
