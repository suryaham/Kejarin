# Kejarin

Aplikasi web untuk manager yang membantu mencatat action item hasil rapat dengan cepat (dibantu AI), melacak statusnya di satu papan, dan mengingatkan PIC secara otomatis lewat SMS saat mendekati atau melewati deadline.

## Fitur

1. **Smart Add** — ketik catatan bebas, Gemini API mengekstrak PIC/tugas/deadline untuk dikonfirmasi sebelum disimpan.
2. **Papan Action Item** — kolom Belum Mulai / Berjalan / Selesai / Overdue (overdue dihitung otomatis dari deadline).
3. **Auto-Reminder SMS** — cron job harian mengecek item H-1/overdue, membuat pesan lewat Gemini API, lalu mengirim via Twilio SMS API.

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Google Gemini API (`@google/genai`) — dipanggil dari API routes, bukan dari client. Punya tier gratis (dapatkan API key di [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
- PostgreSQL (`pg`) — kompatibel dengan Vercel Postgres/Neon (tier gratis tersedia) atau Postgres lainnya
- Twilio SMS API — trial account gratis untuk testing
- Vercel Cron Jobs — gratis di plan Hobby

## Setup Lokal

1. Install dependencies:
   ```bash
   npm install
   ```
2. Siapkan database Postgres, lalu salin `.env.example` menjadi `.env.local` dan isi:
   - `DATABASE_URL` — connection string Postgres. Skema tabel akan dibuat otomatis saat request pertama (lihat `db/schema.sql`).
   - `GEMINI_API_KEY` — API key Google Gemini (wajib untuk fitur Smart Add & Auto-Reminder). Gratis di [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM` — untuk fitur Auto-Reminder SMS (opsional di awal). Nomor PIC penerima perlu didaftarkan sebagai "Verified Caller ID" di Twilio Console selama masih pakai akun trial.
   - `CRON_SECRET` — opsional, untuk melindungi endpoint cron.
3. Jalankan dev server:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000).

## Struktur Halaman/API

- `/` — Papan Action Item + tombol Smart Add
- `/api/parse-item` — POST, ekstraksi AI dari teks bebas
- `/api/items` — GET (list) & POST (buat item baru)
- `/api/items/[id]` — PATCH (update status)
- `/api/cron/reminder` — GET, dipanggil Vercel Cron (jadwal di `vercel.json`, default 08:00 WIB) untuk cek deadline & kirim reminder SMS

## Catatan

- Fitur 2.1 (Smart Add) dan 2.2 (Papan) bisa langsung dipakai setelah `DATABASE_URL` dan `GEMINI_API_KEY` diisi.
- Fitur 2.3 (Auto-Reminder SMS) butuh akun Twilio (trial gratis cukup untuk testing, dengan syarat nomor penerima terdaftar sebagai Verified Caller ID) — kerjakan setelah alur dasar berjalan.
- Seluruh stack di atas bisa dijalankan tanpa biaya (Vercel Hobby, Neon/Supabase free tier, Gemini API free tier, Twilio trial).
- Fitur WhatsApp reminder sempat dieksplorasi (lewat Twilio maupun Meta WhatsApp Cloud API langsung) tapi terblokir kebijakan business-initiated messaging Meta yang mengharuskan verifikasi bisnis. Bisa diaktifkan kembali di masa depan setelah verifikasi bisnis selesai.
