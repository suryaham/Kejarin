# Kejarin

Aplikasi web untuk manager yang membantu mencatat action item hasil rapat dengan cepat (dibantu AI), melacak statusnya di satu papan, dan mengingatkan PIC secara otomatis lewat WhatsApp saat mendekati atau melewati deadline.

## Fitur

1. **Smart Add** — ketik catatan bebas, Gemini API mengekstrak PIC/tugas/deadline untuk dikonfirmasi sebelum disimpan.
2. **Papan Action Item** — kolom Belum Mulai / Berjalan / Selesai / Overdue (overdue dihitung otomatis dari deadline).
3. **Auto-Reminder WhatsApp** — cron job harian mengecek item H-1/overdue, lalu mengirim pesan template WhatsApp resmi via Twilio.

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Google Gemini API (`@google/genai`) — dipanggil dari API routes untuk fitur Smart Add, bukan dari client. Punya tier gratis (dapatkan API key di [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
- PostgreSQL (`pg`) — kompatibel dengan Vercel Postgres/Neon (tier gratis tersedia) atau Postgres lainnya
- Twilio WhatsApp Business API — butuh akun berbayar + WhatsApp Sender terverifikasi (lihat catatan di bawah)
- Vercel Cron Jobs — gratis di plan Hobby

## Setup Lokal

1. Install dependencies:
   ```bash
   npm install
   ```
2. Siapkan database Postgres, lalu salin `.env.example` menjadi `.env.local` dan isi:
   - `DATABASE_URL` — connection string Postgres. Skema tabel akan dibuat otomatis saat request pertama (lihat `db/schema.sql`).
   - `GEMINI_API_KEY` — API key Google Gemini (wajib untuk fitur Smart Add). Gratis di [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — kredensial Twilio dan nomor WhatsApp Sender (opsional di awal, untuk fitur Auto-Reminder).
   - `TWILIO_TEMPLATE_SID_H1`, `TWILIO_TEMPLATE_SID_OVERDUE` — Content SID template WhatsApp yang sudah disetujui Meta (dibuat lewat Twilio Content Template Builder).
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

- Fitur 2.1 (Smart Add) dan 2.2 (Papan) bisa langsung dipakai setelah `DATABASE_URL` dan `GEMINI_API_KEY` diisi.
- Fitur 2.3 (Auto-Reminder WA) mengirim pesan lewat **Content Template WhatsApp** (bukan teks bebas), karena kebijakan WhatsApp/Meta mengharuskan pesan business-initiated (yang dipicu otomatis oleh cron, bukan balasan langsung) memakai template yang sudah disetujui.
- Untuk submit WhatsApp Sender dan template custom, Twilio mengharuskan **akun berbayar** (bukan trial) — lihat [twilio.com/en-us/whatsapp/pricing](https://www.twilio.com/en-us/whatsapp/pricing) untuk estimasi biaya (relatif kecil untuk volume pemakaian rendah/internal tim).
- Alternatif gratis yang sempat dieksplorasi: Meta WhatsApp Cloud API langsung (masih kena batasan serupa sebelum verifikasi bisnis selesai) dan SMS via Twilio trial (bebas dari batasan template, tapi tetap butuh saldo untuk beli nomor jika kredit trial sudah habis).
