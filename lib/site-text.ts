/**
 * Teks statis halaman publik (judul section, label tombol, menu navigasi, dll).
 * Disimpan sebagai pasangan key/value di sheet Profile, jadi tidak perlu kolom baru.
 * Field dengan default kosong berarti "otomatis" (dihitung dari data lain).
 */

export type SiteTextGroup =
  | 'profil'
  | 'tentang'
  | 'project'
  | 'pengalaman'
  | 'publikasi'
  | 'sertifikat'
  | 'keahlian'
  | 'kontak';

export interface SiteTextField {
  key: string;
  label: string;
  group: SiteTextGroup;
  defaultValue: string;
  hint?: string;
  multiline?: boolean;
  max?: number;
}

export const SITE_TEXT_FIELDS = [
  // Navbar & Hero
  { key: 'hero_eyebrow', group: 'profil', label: 'Teks kecil di atas nama (Hero)', defaultValue: '', hint: 'Kosongkan untuk otomatis: Lokasi · Peran.' },
  { key: 'nav_about', group: 'profil', label: 'Menu navigasi: Tentang', defaultValue: 'Tentang' },
  { key: 'nav_projects', group: 'profil', label: 'Menu navigasi: Project', defaultValue: 'Project' },
  { key: 'nav_experience', group: 'profil', label: 'Menu navigasi: Pengalaman', defaultValue: 'Pengalaman' },
  { key: 'nav_certificates', group: 'profil', label: 'Menu navigasi: Sertifikat', defaultValue: 'Sertifikat' },
  { key: 'nav_skills', group: 'profil', label: 'Menu navigasi: Keahlian', defaultValue: 'Keahlian' },
  { key: 'nav_contact', group: 'profil', label: 'Menu navigasi: Kontak', defaultValue: 'Kontak' },
  { key: 'cache_notice', group: 'profil', label: 'Pesan saat data dari cache', defaultValue: 'Menampilkan salinan cache terakhir karena koneksi pembaruan data sedang terkendala.', multiline: true },

  // Tentang
  { key: 'about_eyebrow', group: 'tentang', label: 'Label kecil section', defaultValue: '01 / TENTANG SAYA' },
  { key: 'about_heading', group: 'tentang', label: 'Judul section', defaultValue: 'Mengubah data mentah menjadi temuan yang jelas dan dapat ditindaklanjuti.', multiline: true },
  { key: 'about_location_label', group: 'tentang', label: 'Label lokasi di kartu foto', defaultValue: 'Domisili' },

  // Project
  { key: 'projects_eyebrow', group: 'project', label: 'Label kecil section', defaultValue: '02 / STUDI KASUS PROJECT' },
  { key: 'projects_heading', group: 'project', label: 'Judul section', defaultValue: 'Studi kasus analisis & visualisasi data', multiline: true },
  { key: 'projects_hint', group: 'project', label: 'Teks petunjuk di kanan judul', defaultValue: 'Klik gambar untuk pratinjau penuh (Lightbox)' },
  { key: 'projects_item_label', group: 'project', label: 'Label di atas tiap project', defaultValue: 'STUDI KASUS', hint: 'Nomor urut (01, 02, …) ditambahkan otomatis.' },

  // Pengalaman
  { key: 'experience_eyebrow', group: 'pengalaman', label: 'Label kecil section', defaultValue: '03 / PENGALAMAN, PENDIDIKAN & PUBLIKASI' },
  { key: 'experience_heading', group: 'pengalaman', label: 'Judul section', defaultValue: 'Pengalaman kerja, magang, dan riset akademik', multiline: true },
  { key: 'experience_label_work', group: 'pengalaman', label: 'Label tipe: Kerja', defaultValue: 'Pengalaman Kerja' },
  { key: 'experience_label_education', group: 'pengalaman', label: 'Label tipe: Pendidikan', defaultValue: 'Pendidikan' },
  { key: 'experience_label_training', group: 'pengalaman', label: 'Label tipe: Pelatihan', defaultValue: 'Pelatihan & Sertifikasi' },

  // Publikasi
  { key: 'publication_label', group: 'publikasi', label: 'Label kecil di atas judul publikasi', defaultValue: 'PUBLIKASI JURNAL ILMIAH' },
  { key: 'publication_button', group: 'publikasi', label: 'Teks tombol tautan', defaultValue: 'Buka Artikel (DOI)' },

  // Sertifikat
  { key: 'certificates_eyebrow', group: 'sertifikat', label: 'Label kecil section', defaultValue: '04 / SERTIFIKAT & SPESIALISASI' },
  { key: 'certificates_heading', group: 'sertifikat', label: 'Judul section', defaultValue: 'Sertifikat keahlian dan studi kasus', multiline: true },
  { key: 'certificates_hint', group: 'sertifikat', label: 'Teks petunjuk di kanan judul', defaultValue: 'Klik sertifikat untuk memperbesar' },
  { key: 'certificates_button', group: 'sertifikat', label: 'Teks tautan kredensial', defaultValue: 'Lihat Kredensial' },

  // Keahlian
  { key: 'skills_eyebrow', group: 'keahlian', label: 'Label kecil section', defaultValue: '05 / KEAHLIAN & PERANGKAT KERJA' },
  { key: 'skills_heading', group: 'keahlian', label: 'Judul section', defaultValue: 'Perangkat yang digunakan sehari-hari', multiline: true },
  { key: 'skills_default_category', group: 'keahlian', label: 'Nama kategori untuk keahlian tanpa kategori', defaultValue: 'Perangkat Lainnya', hint: 'Dipakai jika kategori kosong dan tidak terdeteksi otomatis.' },

  // Kontak & footer
  { key: 'contact_eyebrow', group: 'kontak', label: 'Label kecil section', defaultValue: '06 / KONTAK & KOLABORASI' },
  { key: 'contact_heading', group: 'kontak', label: 'Judul section', defaultValue: 'Mari terhubung', multiline: true },
  { key: 'contact_whatsapp_label', group: 'kontak', label: 'Teks tombol WhatsApp', defaultValue: 'Chat WhatsApp' },
  { key: 'contact_linkedin_label', group: 'kontak', label: 'Teks tombol LinkedIn', defaultValue: 'Kunjungi LinkedIn' },
  { key: 'contact_email_label', group: 'kontak', label: 'Teks tombol Email', defaultValue: 'Kirim Email' },
  { key: 'footer_text', group: 'kontak', label: 'Teks footer (kiri bawah)', defaultValue: '', hint: 'Kosongkan untuk otomatis: Lokasi · Nama lengkap.' },
] as const satisfies readonly SiteTextField[];

export type SiteTextKey = (typeof SITE_TEXT_FIELDS)[number]['key'];
export type SiteText = Record<SiteTextKey, string>;

export const SITE_TEXT_KEYS = SITE_TEXT_FIELDS.map((f) => f.key) as SiteTextKey[];

export const SITE_TEXT_MAX = 400;

export function siteTextFieldsFor(group: SiteTextGroup): readonly SiteTextField[] {
  return SITE_TEXT_FIELDS.filter((f) => f.group === group);
}

/** Isi nilai kosong dengan default, kecuali field "otomatis" (default kosong). */
export function normalizeSiteText(raw: Record<string, unknown>): SiteText {
  const out = {} as SiteText;
  for (const field of SITE_TEXT_FIELDS) {
    const value = raw[field.key];
    const str = typeof value === 'string' ? value.trim() : '';
    out[field.key] = str || field.defaultValue;
  }
  return out;
}
