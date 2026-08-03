# Kejarin

Aplikasi web untuk manager yang membantu mencatat action item hasil rapat dengan cepat (dibantu AI), melacak statusnya di satu papan, dan mengingatkan PIC secara otomatis lewat WhatsApp saat mendekati atau melewati deadline.

## Fitur

1. **Smart Add** — ketik catatan bebas, Claude API mengekstrak PIC/tugas/deadline untuk dikonfirmasi sebelum disimpan.
2. **Papan Action Item** — kolom Belum Mulai / Berjalan / Selesai / Overdue (overdue dihitung otomatis dari deadline).
3. **Auto-Reminder WhatsApp** — cron job harian mengecek item H-1/overdue, membuat pesan lewat Claude API, lalu mengirim via Twilio WhatsApp API.

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Anthropic API (`@anthropic-ai/sdk`) — dipanggil dari API routes, bukan dari client
- PostgreSQL (`pg`) — kompatibel dengan Vercel Postgres/Neon atau Postgres lainnya
- Twilio WhatsApp API
- Vercel Cron Jobs

## Setup Lokal

1. Install dependencies:
   ```bash
   npm install
   ```
2. Siapkan database Postgres, lalu salin `.env.example` menjadi `.env.local` dan isi:
   - `DATABASE_URL` — connection string Postgres. Skema tabel akan dibuat otomatis saat request pertama (lihat `db/schema.sql`).
   - `ANTHROPIC_API_KEY` — API key Anthropic (wajib untuk fitur Smart Add & Auto-Reminder).
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — untuk fitur Auto-Reminder WhatsApp (opsional di awal).
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
- `/api/cron/reminder` — GET, dipanggil Vercel Cron (jadwal di `vercel.json`, default 08:00 WIB) untuk cek deadline & kirim reminder WhatsApp

## Catatan

- Fitur 2.1 (Smart Add) dan 2.2 (Papan) bisa langsung dipakai setelah `DATABASE_URL` dan `ANTHROPIC_API_KEY` diisi.
- Fitur 2.3 (Auto-Reminder WA) butuh akun Twilio WhatsApp aktif — kerjakan setelah alur dasar berjalan.
