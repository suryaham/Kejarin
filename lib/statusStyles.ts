import type { StatusDb, StatusPapan } from "@/lib/types";

export const STATUS_LABEL: Record<StatusDb, string> = {
  belum_mulai: "Belum Mulai",
  berjalan: "Berjalan",
  selesai: "Selesai",
};

interface ColumnStyle {
  label: string;
  emoji: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  cardAccent: string;
}

export const COLUMN_STYLES: Record<StatusPapan, ColumnStyle> = {
  belum_mulai: {
    label: "Belum Mulai",
    emoji: "📋",
    headerBg: "bg-slate-500",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-300",
    cardAccent: "border-l-slate-400",
  },
  berjalan: {
    label: "Berjalan",
    emoji: "🚧",
    headerBg: "bg-sky-500",
    badgeBg: "bg-sky-100 dark:bg-sky-900",
    badgeText: "text-sky-700 dark:text-sky-300",
    cardAccent: "border-l-sky-400",
  },
  selesai: {
    label: "Selesai",
    emoji: "✅",
    headerBg: "bg-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    cardAccent: "border-l-emerald-400",
  },
  overdue: {
    label: "Overdue",
    emoji: "🔥",
    headerBg: "bg-rose-500",
    badgeBg: "bg-rose-100 dark:bg-rose-900",
    badgeText: "text-rose-700 dark:text-rose-300",
    cardAccent: "border-l-rose-500",
  },
};

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-pink-500",
];

export function avatarColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
