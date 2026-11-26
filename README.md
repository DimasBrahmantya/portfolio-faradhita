# Faradhita Eka Septiana — Data Portfolio & CMS

[![Live Demo](https://img.shields.io/badge/Live-faradhita.vercel.app-0b6168?style=flat-square&logo=vercel&logoColor=white)](https://faradhita.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Website portofolio resmi **Faradhita Eka Septiana** (Data Analyst & Data Science) yang dibangun dengan **Next.js App Router** dan dilengkapi **Admin CMS (`/admin`)** tanpa database berbayar—menggunakan **Google Sheets** sebagai penyimpanan konten dan **Google Drive** sebagai penyimpanan gambar melalui **Google Apps Script**.

---

## Fitur Utama

### Halaman Publik (`/`)
- **Glassmorphism Navbar & Scrollspy** — Navigasi mengambang bergaya frosted-glass yang otomatis menyorot section aktif (`Tentang`, `Project`, `Pengalaman`, `Sertifikat`, `Keahlian`, `Kontak`) saat halaman di-scroll.
- **Mode Terang & Gelap** — Pergantian tema *Alabaster Editorial* (terang) dan *Deep Slate Analytical* (gelap) dengan toggle ikon minimalis serta deteksi preferensi sistem.
- **Studi Kasus & Lightbox** — Tampilan studi kasus proyek data, dokumentasi magang, dan sertifikat dengan pratinjau penuh (*Lightbox*) yang mendukung navigasi keyboard.
- **Logo Asli Keahlian** — Menampilkan ikon resmi perangkat kerja (Python, Google Colab, VS Code, Google Looker Studio, Microsoft Excel/Word/PowerPoint, dll.) dengan fallback otomatis.
- **Animasi Halus & Aksesibel** — Efek *fade-in/fade-out* berbasis `IntersectionObserver` yang tetap menghormati pengaturan `prefers-reduced-motion`.
- **SEO & Structured Data** — Metadata dinamis, OpenGraph (`profile`), Twitter Card, `robots.txt`, `sitemap.xml`, dan **JSON-LD Schema.org** (`Person`, `ProfilePage`, `WebSite`, `ScholarlyArticle`).

### Panel Admin CMS (`/admin`)
- **Autentikasi Aman** — Login berbasis sesi terenkripsi (`jose` JWT + `HttpOnly` cookie) dengan proteksi `middleware.ts` dan rate limiting.
- **Manajemen Konten Lengkap** — Edit Profil & Hero, Tentang & Fakta, Project, Sertifikat, Pengalaman, Publikasi, Keahlian, serta Kontak & SEO.
- **Upload Gambar ke Google Drive** — Unggah foto langsung dari panel admin ke folder Google Drive yang sudah dikonfigurasi.
- **Pembaruan Cepat (ISR)** — Konten publik di-cache otomatis (`revalidate = 300`) dan langsung di-revalidate setiap kali perubahan disimpan di admin.

---

## Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4, CSS Custom Properties |
| Ikon | Lucide React, Brand SVG/CDN Icons |
| Validasi & Auth | Zod, Jose (JWT Session) |
| Backend CMS & Storage | Google Apps Script, Google Sheets, Google Drive |
| Hosting | Vercel |

---

## Struktur Proyek

```text
.
├── app/
│   ├── (public)/page.tsx       # Halaman utama portofolio + SEO & JSON-LD
│   ├── admin/                  # Panel CMS (/admin, /admin/login, /admin/[section])
│   ├── api/admin/              # Route handlers (auth, CRUD konten, reorder, upload)
│   ├── icon.svg & apple-icon.tsx
│   ├── robots.ts & sitemap.ts
│   └── layout.tsx & globals.css
├── apps-script/
│   └── Code.gs                 # Backend Google Apps Script untuk Sheets & Drive
├── components/
│   ├── public/                 # Navbar, Hero, About, Projects, Experience, Certificates, Skills, Lightbox
│   └── admin/                  # Form & manajemen daftar konten CMS
├── lib/                        # Fetcher GAS, normalisasi konten, sanitasi tanggal & URL, auth
├── scripts/
│   └── seed.mjs                # Skrip seeding awal ke Google Sheets & Drive
└── TUTORIAL_GOOGLE_APPS_SCRIPT.md
```

---

## Menjalankan Secara Lokal

### 1. Instalasi Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment Variable

Salin `.env.example` menjadi `.env.local` lalu isi nilainya:

```env
GAS_URL=https://script.google.com/macros/s/XXXX/exec
GAS_SECRET=secret-acak-panjang
ADMIN_PASSWORD=password-admin-kuat
SESSION_SECRET=string-acak-minimal-32-karakter
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Opsional: kode verifikasi Google Search Console
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

> Untuk panduan setup Google Sheets, Google Drive, dan deploy `apps-script/Code.gs`, lihat [TUTORIAL_GOOGLE_APPS_SCRIPT.md](./TUTORIAL_GOOGLE_APPS_SCRIPT.md).

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat portofolio, atau [http://localhost:3000/admin](http://localhost:3000/admin) untuk masuk ke panel CMS.

---

## Skrip Tersedia

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan lokal |
| `npm run build` | Membuat production build Next.js |
| `npm run start` | Menjalankan server produksi hasil build |
| `npm run lint` | Menjalankan pemeriksaan ESLint |

---

## Deployment ke Vercel

1. Hubungkan repository ini ke proyek baru di [Vercel](https://vercel.com).
2. Tambahkan seluruh variabel pada `.env.example` di **Project Settings → Environment Variables**, dengan:
   - `NEXT_PUBLIC_SITE_URL=https://faradhita.vercel.app`
3. Klik **Deploy**. Setelah live, daftarkan `https://faradhita.vercel.app/sitemap.xml` di **Google Search Console** untuk mempercepat pengindeksan.

---

## Lisensi

Hak cipta © Faradhita Eka Septiana. Seluruh konten, foto, dan studi kasus merupakan milik pemilik portofolio.
