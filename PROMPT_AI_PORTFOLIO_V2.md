# PROMPT AI — Portfolio v2 (untuk Antigravity)

## Cara pakai

1. Buat folder proyek, mis. `portfolio-v2`. Buka di Antigravity.
2. Taruh file ini di folder:
   - `docs/PRD_PORTFOLIO_V2.md`
   - `assets/` (hasil ekstrak `assets_portfolio.zip`, 15 gambar)
   - `apps-script/Code.gs` (dari `TUTORIAL_GOOGLE_APPS_SCRIPT.md`)
   - `design/` (export desain Figcraft: PNG/PDF/HTML; kalau belum ada, kosongkan)
3. Tempel **PROMPT UTAMA** di bawah ke chat agent.
4. Setelah agent selesai satu tahap, balas `lanjut` untuk tahap berikutnya. Jangan suruh semua sekaligus.

---

## PROMPT UTAMA (tempel ini)

```
Kamu senior full-stack engineer. Bangun "Portfolio v2" Faradhita Eka Septiana.

SUMBER KEBENARAN
- Baca penuh docs/PRD_PORTFOLIO_V2.md sebelum menulis kode. Ikuti PRD: arsitektur, data model, kontrak API, halaman, kriteria penerimaan, Lampiran A (seed data).
- Desain visual: ikuti file di /design (hasil Figcraft). Kalau /design kosong, buat UI bersih berdasarkan PRD bagian 10 dan beri komentar `// TODO-DESIGN` di tempat yang harus disesuaikan nanti. Jangan mengarang gaya yang bertentangan dengan desain.
- Backend: apps-script/Code.gs sudah disediakan. Baca dan patuhi kontraknya. Jangan menulis ulang kecuali ada bug; kalau ada bug, jelaskan dulu perubahannya.

STACK
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Data: Google Sheets lewat Google Apps Script Web App. Gambar: Google Drive lewat Apps Script.
- Deploy target: Vercel.

ATURAN KERAS
1. Browser tidak boleh memanggil Apps Script langsung. Semua lewat Next.js server (Server Component / Route Handler). GAS_URL dan GAS_SECRET hanya di server. Jangan pernah pakai prefix NEXT_PUBLIC_ untuk secret.
2. Semua env dibaca dari .env.local: GAS_URL, GAS_SECRET, ADMIN_PASSWORD, SESSION_SECRET, NEXT_PUBLIC_SITE_URL. Buat .env.example tanpa nilai asli. Tambahkan .env.local ke .gitignore.
3. Panggilan ke Apps Script: fetch POST dengan header "Content-Type": "text/plain;charset=utf-8", body JSON.stringify({ secret, action, ...payload }), redirect: "follow", cache: "no-store" untuk write. Untuk getAll di halaman publik pakai next: { tags: ["content"], revalidate: 300 }.
4. Setelah setiap write sukses di route admin, panggil revalidateTag("content").
5. Kolom JSON di Sheets (points, images, tags) datang sebagai string. Parse di lib/content.ts dengan try/catch dan fallback aman ([] atau string kosong). Jangan crash karena data rusak.
6. Jangan pakai dangerouslySetInnerHTML. Validasi URL: hanya http(s), mailto, tel.
7. Admin: login password tunggal, cookie httpOnly + secure + sameSite=lax, ditandatangani HMAC dengan SESSION_SECRET (pakai Web Crypto / jose, kompatibel Edge middleware). Rate limit login 5 gagal / 10 menit / IP (in-memory cukup). middleware.ts proteksi /admin/* dan /api/admin/* (kecuali login). /admin noindex dan disallow di robots.
8. Upload gambar: kompres di browser dulu (canvas, sisi panjang maks 1600px, kualitas 0.82, webp/jpeg), batas 5 MB, kirim base64 ke /api/admin/upload. Tampilkan preview dan progres.
9. Dark mode otomatis (prefers-color-scheme) + toggle manual. Responsif 390 / 768 / 1440. A11y: fokus terlihat, alt text, lightbox bisa keyboard (Esc, panah), hormati prefers-reduced-motion.
10. Kode bersih, tipe ketat (tanpa any), komponen kecil, nama jelas. Bahasa UI: Indonesia.
11. Jangan install library berat tanpa alasan. Boleh: zod (validasi), jose (JWT), lucide-react (ikon), @dnd-kit/core (opsional drag urutan).
12. Setiap akhir tahap: jalankan `npm run lint` dan `npm run build`, perbaiki error, lalu tulis ringkasan: file dibuat, cara tes, apa yang belum.

TAHAPAN (kerjakan satu per satu, berhenti di akhir tiap tahap, tunggu aku bilang "lanjut")

TAHAP 1 — Fondasi
- create-next-app (TS, Tailwind, App Router, ESLint). Struktur folder sesuai PRD bagian 11.
- types/content.ts (semua tipe: Profile, Fact, Project, Certificate, Experience, Publication, Skill, ContentBundle).
- lib/gas.ts (client server-side), lib/content.ts (getContent + parse aman), lib/session.ts, .env.example.
- Selesai bila: `npm run build` lolos dan getContent() mengembalikan data dari Apps Script (tes dengan route sementara /api/debug yang dihapus setelah tes).

TAHAP 2 — Seed data
- Buat seed/seed.json dari PRD Lampiran A (Profile, Facts, Projects, Certificates, Experience, Publications, Skills; gambar merujuk nama file di /assets).
- Buat scripts/seed.mjs (Node): upload semua file /assets via action uploadImage, ganti nama file dengan URL hasil upload, lalu tulis ke Sheets (updateProfile + createItem per baris, urut sesuai `order`). Idempoten: kalau tab sudah berisi data, tanya/lewati dengan flag --force.
- Baca env dari .env.local. Cetak ringkasan hasil.
- Selesai bila: setelah `node scripts/seed.mjs`, semua tab di Sheets terisi dan gambar ada di Drive.

TAHAP 3 — Halaman publik (/)
- Komponen: Navbar (sticky, link otomatis hilang kalau section kosong), Hero, About (+Facts), Projects, Experience (timeline + Publikasi), Certificates, Skills, Contact, Footer, Lightbox (galeri + sertifikat).
- Server Component, data dari getContent(); filter visible=true, urut by order.
- SEO: generateMetadata dari Profile (meta_title, meta_description, og_image_url), semantic HTML, sitemap.xml, robots.txt.
- Ikuti desain /design. Fallback aman bila Apps Script gagal.
- Selesai bila: tampilan setara/lebih baik dari portfolio lama, semua konten dari Sheets, Lighthouse a11y ≥ 95.

TAHAP 4 — Admin: auth + shell
- /admin/login, route login/logout, middleware, layout admin (sidebar: Profil & Hero, Tentang & Fakta, Project, Sertifikat, Pengalaman, Publikasi, Keahlian, Kontak & SEO).
- Selesai bila: tanpa login /admin redirect ke /admin/login; API admin tanpa cookie → 401; logout berfungsi.

TAHAP 5 — Admin: edit teks + CRUD
- Form edit Profile (tiap field), simpan per section, indikator "Menyimpan… / Tersimpan / Gagal".
- Komponen generik ItemList (thumbnail/judul, toggle visible, edit, hapus dengan konfirmasi, naik/turun urutan).
- Form: ProjectForm (tags chip, deskripsi, poin dengan label opsional, galeri gambar dengan caption + wide + urut), CertificateForm, ExperienceForm, PublicationForm, SkillForm, FactForm.
- ImageUploader (kompres + preview + upload).
- Peringatan keluar halaman bila ada perubahan belum disimpan.
- Validasi dengan zod di client dan server.
- Selesai bila semua kriteria penerimaan PRD bagian 14 no. 1–6 lolos.

TAHAP 6 — Polish & deploy
- Error boundary, loading skeleton, empty state, 404.
- Cek responsif 390/768/1440 light+dark, a11y, Lighthouse.
- README.md: setup lokal, env, cara deploy Vercel (set env di dashboard), cara redeploy Apps Script (Manage deployments → Edit → New version).
- Selesai bila: semua kriteria penerimaan PRD bagian 14 lolos; daftar sisa pekerjaan (jika ada) ditulis jujur.

Mulai dari TAHAP 1. Sebelum menulis kode, ringkas pemahamanmu tentang PRD dalam maksimal 10 baris dan sebut asumsi yang kamu ambil.
```

---

## PROMPT TAMBAHAN (pakai kalau perlu)

### A. Kalau desain Figcraft sudah jadi (kirim setelah Tahap 1)

```
Desain Figcraft ada di /design. Analisis dulu semua frame: warna, tipografi, spacing, radius, bayangan, komponen. Buat design tokens di tailwind.config.ts dan app/globals.css (CSS variables untuk light + dark). Daftar komponen yang kamu temukan beserta variannya. Jangan menulis halaman dulu; tunjukkan tokens dan daftar komponen untuk kuterima.
```

### B. Debug koneksi Apps Script

```
Koneksi ke Apps Script bermasalah. Cek berurutan dan laporkan hasil tiap langkah:
1. GAS_URL berakhiran /exec (bukan /dev) dan terbaca di server.
2. Respons mentah dari fetch: status, content-type, 300 karakter pertama body. Kalau body HTML (halaman login Google), berarti deployment belum "Anyone".
3. secret cocok dengan Script Property GAS_SECRET.
4. Pakai redirect: "follow" dan Content-Type text/plain untuk POST.
5. Setelah ubah Code.gs, deployment harus dibuat versi baru.
Perbaiki hanya penyebab yang terbukti.
```

### C. Review keamanan sebelum deploy

```
Audit keamanan proyek ini. Cek: secret bocor ke bundle client (grep GAS_SECRET, ADMIN_PASSWORD, SESSION_SECRET di .next/static), route /api/admin/* tanpa pengecekan sesi, XSS dari data Sheets, validasi upload (mime, ukuran), rate limit login, cookie flags, robots/noindex admin. Beri daftar temuan berurut tingkat risiko beserta perbaikan; terapkan yang aman, tanyakan yang mengubah perilaku.
```

### D. Tambah fitur kecil

```
Tambah fitur: [tulis fitur]. Ikuti struktur dan aturan keras yang sudah ada. Jangan ubah kontrak API Apps Script kecuali perlu; kalau perlu, tunjukkan diff Code.gs dan ingatkan aku untuk deploy versi baru.
```
