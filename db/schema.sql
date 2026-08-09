-- Kejarin — skema database (PostgreSQL / Vercel Postgres)

create extension if not exists "pgcrypto";

create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  deskripsi_tugas text not null,
  pic_nama text not null,
  pic_nomor_wa text not null,
  deadline date not null,
  status text not null default 'belum_mulai'
    check (status in ('belum_mulai', 'berjalan', 'selesai')),
  dibuat_pada timestamptz not null default now(),
  catatan_rapat text
);

create table if not exists reminder_logs (
  id uuid primary key default gen_random_uuid(),
  action_item_id uuid not null references action_items(id) on delete cascade,
  pesan_terkirim text not null,
  terkirim_pada timestamptz not null default now()
);

create index if not exists idx_action_items_status on action_items(status);
create index if not exists idx_action_items_deadline on action_items(deadline);
create index if not exists idx_reminder_logs_item on reminder_logs(action_item_id);
