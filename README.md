# Faradhita Eka Septiana — Data Portfolio & CMS

[![Live Demo](https://img.shields.io/badge/Live-faradhita.vercel.app-0b6168?style=flat-square&logo=vercel&logoColor=white)](https://faradhita.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Website portofolio resmi **Faradhita Eka Septiana** (Data Analyst & Data Science) yang dibangun dengan **Next.js App Router** dan dilengkapi **Admin CMS (`/admin`)** tanpa database berbayar—menggunakan **Google Sheets** sebagai penyimpanan konten dan **Google Drive** sebagai penyimpanan gambar melalui **Google Apps Script**.

---

## Fitur Utama

### Halaman Publik (`/`)
- **Glassmorphism Navbar & Scrollspy** — Navigasi mengambang yang otomatis menyembunyikan tautan section yang kosong dan menyorot section aktif saat halaman di-scroll.
- **Mode Terang & Gelap** — Tema *Alabaster Editorial* (terang) dan *Deep Slate Analytical* (gelap), mengikuti `prefers-color-scheme` dengan toggle manual tersimpan di `localStorage`.
- **Studi Kasus & Lightbox** — Tampilan studi kasus proyek data, dokumentasi pengalaman, dan sertifikat dengan pratinjau penuh (*Lightbox*) yang mendukung keyboard (`Esc`, panah `←` `→`).
- **Aksesibel & Tangguh** — Fokus keyboard jelas, target sentuh minimal 44×44 px, menghormati `prefers-reduced-motion`, lengkap dengan loading skeleton, empty state, error boundary, fallback cache terakhir, dan halaman 404.
- **SEO & Structured Data** — Metadata dinamis dari Google Sheets, OpenGraph (`profile`), Twitter Card, `robots.txt` (disallow `/admin`), `sitemap.xml`, dan JSON-LD Schema.org (`Person`, `ProfilePage`, `WebSite`, `ScholarlyArticle`).

### Panel Admin CMS (`/admin`)
- **Autentikasi Aman** — Login password tunggal dengan sesi JWT (`jose`) pada cookie `HttpOnly`, `Secure` (produksi), `SameSite=Lax`, rate limit 5 gagal / 10 menit per IP, serta proteksi `middleware.ts` + header `X-Robots-Tag: noindex, nofollow`.
- **Manajemen Konten Lengkap** — Edit Profil & Hero, Tentang & Fakta, Project, Sertifikat, Pengalaman, Publikasi, Keahlian, serta Kontak & SEO.
- **Upload Gambar Terkompresi** — Kompresi otomatis di browser (sisi panjang maks 1600px, kualitas 0,82, batas 5 MB) sebelum diunggah ke Google Drive melalui `/api/admin/upload`.
- **Pembaruan Cepat (ISR)** — Halaman publik di-cache (`tags: ['content']`, `revalidate = 300`) dan langsung di-revalidate via `revalidateTag('content')` setiap kali perubahan disimpan di admin.

---

## Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4, CSS Custom Properties |
| Ikon | Lucide React, Brand SVG Icons |
| Validasi & Auth | Zod, Jose (JWT Session) |
| Backend CMS & Storage | Google Apps Script, Google Sheets, Google Drive |
| Hosting | Vercel |

---

## Struktur Proyek

```text
.
├── app/
│   ├── (public)/
│   │   ├── page.tsx            # Halaman utama portofolio + SEO & JSON-LD
│   │   └── loading.tsx         # Loading skeleton halaman publik
│   ├── admin/
│   │   ├── layout.tsx          # Metadata noindex admin
│   │   ├── login/page.tsx      # Halaman login admin
│   │   └── (panel)/            # Panel CMS (/admin, /admin/[section], loading, error, not-found)
│   ├── api/admin/              # Route handlers (login, logout, content, profile, items, reorder, upload)
│   ├── error.tsx               # Error boundary halaman utama
│   ├── global-error.tsx        # Error boundary global fallback
│   ├── not-found.tsx           # Halaman 404 publik
│   ├── icon.svg & apple-icon.tsx
│   ├── robots.ts & sitemap.ts
│   └── layout.tsx & globals.css
├── apps-script/
│   └── Code.gs                 # Backend Google Apps Script untuk Sheets & Drive
├── components/
│   ├── public/                 # Navbar, Hero, About, Projects, Experience, Certificates, Skills, ContactFooter, Lightbox, EmptyState, ErrorFallback
│   └── admin/                  # Sidebar, ItemList, Form per section, ImageUploader, ChipInput, SaveBar
├── lib/                        # Client GAS server-only, normalisasi konten, session, rate-limit, validasi Zod
├── scripts/
│   └── seed.mjs                # Skrip seeding awal aset & data ke Drive + Sheets
├── seed/
│   └── seed.json               # Data seed awal sesuai PRD Lampiran A
└── TUTORIAL_GOOGLE_APPS_SCRIPT.md
```

---

## Setup Lokal

### 1. Prasyarat
- Node.js 20+ dan npm.
- Spreadsheet Google Sheets + folder Google Drive + Web App Google Apps Script yang sudah disiapkan (ikuti [TUTORIAL_GOOGLE_APPS_SCRIPT.md](./TUTORIAL_GOOGLE_APPS_SCRIPT.md)).

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env.local` (file `.env.local` otomatis diabaikan oleh Git):

```bash
cp .env.example .env.local
```

Isi seluruh variabel di `.env.local`:

| Variabel | Wajib | Sisi | Keterangan |
| :--- | :---: | :---: | :--- |
| `GAS_URL` | Ya | Server | URL Web App Google Apps Script yang berakhiran `/exec` (bukan `/dev`). |
| `GAS_SECRET` | Ya | Server | Secret acak panjang yang **harus sama persis** dengan Script Property `GAS_SECRET` di Apps Script. |
| `ADMIN_PASSWORD` | Ya | Server | Password kuat untuk login ke `/admin/login`. |
| `SESSION_SECRET` | Ya | Server | String acak minimal 32 karakter untuk menandatangani token sesi JWT admin. |
| `NEXT_PUBLIC_SITE_URL` | Ya | Publik | URL utama situs, mis. `http://localhost:3000` (lokal) atau `https://faradhita.vercel.app` (produksi). |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Opsional | Publik | Kode verifikasi Google Search Console. |

> **Penting:** Jangan pernah memberi prefix `NEXT_PUBLIC_` pada `GAS_URL`, `GAS_SECRET`, `ADMIN_PASSWORD`, atau `SESSION_SECRET`. Semua panggilan ke Apps Script hanya boleh dilakukan di server Next.js.

Contoh isi `.env.local`:

```env
GAS_URL=https://script.google.com/macros/s/XXXX/exec
GAS_SECRET=ganti-dengan-secret-acak-panjang
ADMIN_PASSWORD=ganti-dengan-password-owner-kuat
SESSION_SECRET=ganti-dengan-string-acak-minimal-32-karakter
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

### 4. Seed Data Awal (Opsional, bila Sheets masih kosong)

```bash
node scripts/seed.mjs
```

Skrip ini idempoten (otomatis melewati tab yang sudah terisi). Untuk menimpa data yang sudah ada, tambahkan flag `--force`:

```bash
node scripts/seed.mjs --force
```

### 5. Jalankan Development Server

```bash
npm run dev
```

- Portofolio publik: [http://localhost:3000](http://localhost:3000)
- Panel Admin CMS: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Skrip Tersedia

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan lokal |
| `npm run build` | Membuat production build Next.js |
| `npm run start` | Menjalankan server produksi hasil build |
| `npm run lint` | Menjalankan pemeriksaan ESLint |

---

## Cara Deploy ke Vercel

1. Push repository ke GitHub/GitLab/Bitbucket.
2. Buka [Vercel Dashboard](https://vercel.com/new) lalu klik **Import** pada repository ini.
3. Sebelum klik **Deploy** (atau melalui **Project Settings → Environment Variables**), tambahkan semua variabel lingkungan berikut untuk environment **Production** (dan Preview bila perlu):
   - `GAS_URL` → URL `/exec` dari Google Apps Script
   - `GAS_SECRET` → sama dengan Script Property `GAS_SECRET`
   - `ADMIN_PASSWORD` → password login admin
   - `SESSION_SECRET` → string acak minimal 32 karakter
   - `NEXT_PUBLIC_SITE_URL` → URL produksi Vercel (mis. `https://faradhita.vercel.app`)
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` → *(opsional)* kode verifikasi Google Search Console
4. Klik **Deploy** dan tunggu proses build selesai.
5. Verifikasi setelah live:
   - Buka `/` dan pastikan seluruh data dari Google Sheets tampil rapi (mode terang & gelap).
   - Buka `/admin` tanpa login → harus redirect ke `/admin/login`.
   - Login ke `/admin/login`, ubah satu teks lalu simpan → refresh `/` dan pastikan perubahan langsung muncul.
   - *(Opsional)* Daftarkan `https://<domain-kamu>/sitemap.xml` di Google Search Console.

> Setiap kali mengubah Environment Variable di Dashboard Vercel, lakukan **Redeploy** agar nilai baru terbaca oleh build produksi.

---

## Cara Redeploy Google Apps Script

Apabila `apps-script/Code.gs` diubah di kemudian hari, **menyimpan file di editor Apps Script saja tidak memperbarui Web App yang sedang aktif**. Lakukan langkah berikut:

1. Buka Google Sheets portofolio → klik menu **Extensions → Apps Script**.
2. Salin perubahan terbaru dari `apps-script/Code.gs` ke editor, lalu klik **Save** (`Ctrl + S`).
3. Klik tombol **Deploy** (pojok kanan atas) → pilih **Manage deployments**.
4. Pada deployment Web App yang aktif, klik ikon **Edit (pensil)** di pojok kanan atas panel.
5. Pada kolom **Version**, pilih **New version** (isi deskripsi singkat bila perlu).
6. Pastikan pengaturan **Execute as: Me** dan **Who has access: Anyone** tetap sama, lalu klik **Deploy**.
7. Selesai — URL `/exec` tetap sama sehingga `GAS_URL` di `.env.local` dan Vercel **tidak perlu diganti**.

---

## Lisensi

Hak cipta © Faradhita Eka Septiana. Seluruh konten, foto, dan studi kasus merupakan milik pemilik portofolio.
