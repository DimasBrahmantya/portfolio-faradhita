import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg)',
        surface: 'var(--surf)',
        soft: 'var(--soft)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--mute)',
        },
        line: 'var(--line)',
        teal: {
          core: 'var(--teal)',
        },
        accent: {
          DEFAULT: 'var(--acc)',
          btn: 'var(--acc-btn)',
          'btn-hover': 'var(--acc-btn-hover)',
        },
        status: {
          'error-bg': 'var(--error-bg)',
          'error-border': 'var(--error-border)',
          'success-bg': 'var(--success-bg)',
          'success-border': 'var(--success-border)',
          'disabled-bg': 'var(--disabled-bg)',
        },
        footer: {
          bg: 'var(--footer-bg)',
          surf: 'var(--footer-surf)',
          ink: 'var(--footer-ink)',
          muted: 'var(--footer-mute)',
          line: 'var(--footer-line)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-hero': ['4.25rem', { lineHeight: '1.06', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-section': ['2.625rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-card': ['1.625rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        eyebrow: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.12em', fontWeight: '500' }],
      },
      spacing: {
        'nav-height': '4.5rem',
        'tap-min': '2.75rem',
        'section-y': '5rem',
        'section-y-lg': '6rem',
        'sidebar-w': '16.5rem',
      },
      borderRadius: {
        chip: '6px',
        control: '8px',
        card: '12px',
        panel: '16px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        dialog: 'var(--shadow-dialog)',
      },
    },
  },
  plugins: [],
};

export default config;
