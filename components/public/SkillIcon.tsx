'use client';

import React, { useMemo, useState } from 'react';
import { SafeImage } from './SafeImage';

interface SkillIconProps {
  name: string;
  iconUrl?: string;
}

const BRAND_LOGO_RULES: Array<{ match: (lower: string) => boolean; urls: string[] }> = [
  {
    match: (s) => s.includes('python'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
      'https://cdn.simpleicons.org/python/3776AB',
    ],
  },
  {
    match: (s) => s.includes('colab'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecolab/googlecolab-original.svg',
      'https://cdn.simpleicons.org/googlecolab/F9AB00',
    ],
  },
  {
    match: (s) => s.includes('visual studio') || s.includes('vs code') || s === 'vscode',
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg',
      'https://img.icons8.com/color/96/visual-studio-code-2019.png',
    ],
  },
  {
    match: (s) => s.includes('looker'),
    urls: [
      'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_data_studio.svg',
      'https://cdn.simpleicons.org/looker/4285F4',
    ],
  },
  {
    match: (s) => s.includes('excel'),
    urls: [
      'https://img.icons8.com/color/96/microsoft-excel-2019--v1.png',
      'https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg',
    ],
  },
  {
    match: (s) => s.includes('word'),
    urls: [
      'https://img.icons8.com/color/96/microsoft-word-2019--v1.png',
      'https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg',
    ],
  },
  {
    match: (s) => s.includes('powerpoint') || s.includes('power point'),
    urls: [
      'https://img.icons8.com/color/96/microsoft-powerpoint-2019--v1.png',
      'https://upload.wikimedia.org/wikipedia/commons/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg',
    ],
  },
  {
    match: (s) => s.includes('power bi') || s.includes('powerbi'),
    urls: [
      'https://img.icons8.com/color/96/power-bi.png',
      'https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg',
    ],
  },
  {
    match: (s) => s.includes('tableau'),
    urls: [
      'https://img.icons8.com/color/96/tableau-software.png',
      'https://cdn.simpleicons.org/tableau/E97627',
    ],
  },
  {
    match: (s) => s.includes('figma'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
      'https://cdn.simpleicons.org/figma/F24E1E',
    ],
  },
  {
    match: (s) => s.includes('jupyter'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jupyter/jupyter-original.svg',
      'https://cdn.simpleicons.org/jupyter/F37626',
    ],
  },
  {
    match: (s) => s.includes('mysql'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
      'https://cdn.simpleicons.org/mysql/4479A1',
    ],
  },
  {
    match: (s) => s.includes('postgres'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
      'https://cdn.simpleicons.org/postgresql/4169E1',
    ],
  },
  {
    match: (s) => s.includes('bigquery'),
    urls: ['https://cdn.simpleicons.org/googlebigquery/669DF6'],
  },
  {
    match: (s) => s.includes('sql'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-original.svg',
      'https://img.icons8.com/color/96/sql.png',
    ],
  },
  {
    match: (s) => s.includes('sheets') || s.includes('spreadsheet'),
    urls: [
      'https://img.icons8.com/color/96/google-sheets.png',
      'https://cdn.simpleicons.org/googlesheets/34A853',
    ],
  },
  {
    match: (s) => s.includes('pandas'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg',
      'https://cdn.simpleicons.org/pandas/150458',
    ],
  },
  {
    match: (s) => s.includes('numpy'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg',
      'https://cdn.simpleicons.org/numpy/013243',
    ],
  },
  {
    match: (s) => s.includes('scikit'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg',
      'https://cdn.simpleicons.org/scikitlearn/F7931E',
    ],
  },
  {
    match: (s) => s.includes('tensorflow'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg',
      'https://cdn.simpleicons.org/tensorflow/FF6F00',
    ],
  },
  {
    match: (s) => s.includes('matplotlib'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/matplotlib/matplotlib-original.svg',
    ],
  },
  {
    match: (s) => s.includes('github'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
      'https://cdn.simpleicons.org/github/181717',
    ],
  },
  {
    match: (s) => s.includes('git'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
      'https://cdn.simpleicons.org/git/F05032',
    ],
  },
  {
    match: (s) => s === 'r' || s.startsWith('r ') || s.includes('rstudio'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg',
      'https://cdn.simpleicons.org/r/276DC3',
    ],
  },
  {
    match: (s) => s.includes('canva'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg',
      'https://cdn.simpleicons.org/canva/00C4CC',
    ],
  },
  {
    match: (s) => s.includes('notion'),
    urls: [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/notion/notion-original.svg',
      'https://cdn.simpleicons.org/notion/000000',
    ],
  },
];

function getFallbackBadge(name: string): { text: string; bg: string } {
  const lower = name.toLowerCase();
  if (lower.includes('python')) return { text: 'Py', bg: 'bg-[#2b5b84]' };
  if (lower.includes('colab')) return { text: 'Co', bg: 'bg-[#d97706]' };
  if (lower.includes('visual studio') || lower.includes('vs code')) return { text: 'VS', bg: 'bg-[#007acc]' };
  if (lower.includes('looker')) return { text: 'LS', bg: 'bg-[#4285f4]' };
  if (lower.includes('excel')) return { text: 'X', bg: 'bg-[#1d6f42]' };
  if (lower.includes('word')) return { text: 'W', bg: 'bg-[#2b579a]' };
  if (lower.includes('powerpoint')) return { text: 'P', bg: 'bg-[#b7472a]' };

  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return { text: letters || '•', bg: 'bg-[var(--teal)]' };
}

export function SkillIcon({ name, iconUrl }: SkillIconProps) {
  const candidates = useMemo(() => {
    const lower = name.toLowerCase().trim();
    const matched = BRAND_LOGO_RULES.find((rule) => rule.match(lower));
    return matched ? matched.urls : [];
  }, [name]);

  const [idx, setIdx] = useState(0);

  if (iconUrl) {
    return (
      <SafeImage
        src={iconUrl}
        alt={`Logo ${name}`}
        width={24}
        height={24}
        className="h-6 w-6 shrink-0 rounded object-contain"
      />
    );
  }

  const currentUrl = candidates[idx];
  if (currentUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentUrl}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setIdx((prev) => prev + 1)}
        className="h-6 w-6 shrink-0 object-contain transition-transform duration-300 group-hover:scale-110"
      />
    );
  }

  const badge = getFallbackBadge(name);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white ${badge.bg}`}
    >
      {badge.text}
    </span>
  );
}
