import type { Metadata } from 'next';
import { IBM_Plex_Mono, Playfair_Display, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://faradhita.vercel.app'
).replace(/\/+$/, '');
const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
  'xldoMSdwb1lUUzyqGUUnoJ1GeaNZkuhFRvzv9ikFwdA';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Faradhita Eka Septiana – Data Analyst & Data Science Portfolio',
    template: '%s | Faradhita Eka Septiana',
  },
  description:
    'Portofolio resmi Faradhita Eka Septiana — Data Analyst & Data Science lulusan S1 Teknik Informatika. Menampilkan studi kasus visualisasi data Google Looker Studio, analisis sentimen NLP Python, segmentasi RFM, pengalaman kerja, sertifikat, dan publikasi jurnal ilmiah.',
  applicationName: 'Portofolio Faradhita Eka Septiana',
  authors: [{ name: 'Faradhita Eka Septiana', url: siteUrl }],
  creator: 'Faradhita Eka Septiana',
  publisher: 'Faradhita Eka Septiana',
  keywords: [
    'Faradhita Eka Septiana',
    'Faradhita',
    'Portofolio Faradhita Eka Septiana',
    'Data Analyst Indonesia',
    'Data Science Indonesia',
    'Data Analyst Jombang',
    'Google Looker Studio',
    'Python Data Analysis',
    'Analisis Sentimen NLP',
    'Segmentasi RFM',
    'Teknik Informatika Universitas Muhammadiyah Malang',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
  category: 'portfolio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${sourceSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased selection:bg-[var(--soft)] selection:text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
