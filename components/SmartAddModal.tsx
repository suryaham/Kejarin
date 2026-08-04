"use client";

import { useState } from "react";
import { Sparkles, X, ArrowLeft, Check } from "lucide-react";
import type { ActionItem } from "@/lib/types";

interface Draft {
  pic: string;
  deskripsi_tugas: string;
  deadline: string;
}

export default function SmartAddModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (item: ActionItem) => void;
}) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [nomorWa, setNomorWa] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Gagal mengekstrak. Coba tulis ulang kalimatnya.");
      const data = (await res.json()) as Draft;
      setDraft(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    if (!nomorWa.trim()) {
      setError("Nomor WhatsApp PIC wajib diisi (format 62xxxxxxxxxx)");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deskripsi_tugas: draft.deskripsi_tugas,
          pic_nama: draft.pic,
          pic_nomor_wa: nomorWa.trim(),
          deadline: draft.deadline,
          catatan_rapat: text,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan item");
      const item = (await res.json()) as ActionItem;
      onCreated(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="relative bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-4">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles size={18} />
            Smart Add
          </h2>
          <p className="mt-0.5 text-xs text-white/80">
            {draft ? "Langkah 2 dari 2 — cek hasilnya" : "Langkah 1 dari 2 — ceritakan tugasnya"}
          </p>
        </div>

        <div className="p-5">
          {!draft ? (
            <>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Tulis catatan bebas, contoh: &quot;Budi kirim laporan penjualan
                Jumat depan&quot;
              </p>
              <textarea
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 outline-none ring-indigo-400 transition-shadow focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ketik catatan rapat di sini..."
              />
              {error && (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleExtract}
                  disabled={loading || !text.trim()}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Sparkles size={14} />
                  {loading ? "Memproses..." : "Ekstrak dengan AI"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Cek dan koreksi hasil ekstraksi AI sebelum disimpan.
              </p>
              <div className="mt-3 flex flex-col gap-3">
                <label className="flex flex-col text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  PIC
                  <input
                    className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800"
                    value={draft.pic}
                    onChange={(e) => setDraft({ ...draft, pic: e.target.value })}
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nomor WhatsApp PIC
                  <input
                    className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="62812xxxxxxx"
                    value={nomorWa}
                    onChange={(e) => setNomorWa(e.target.value)}
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Deskripsi Tugas
                  <textarea
                    className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800"
                    rows={2}
                    value={draft.deskripsi_tugas}
                    onChange={(e) =>
                      setDraft({ ...draft, deskripsi_tugas: e.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Deadline
                  <input
                    type="date"
                    className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800"
                    value={draft.deadline}
                    onChange={(e) =>
                      setDraft({ ...draft, deadline: e.target.value })
                    }
                  />
                </label>
              </div>
              {error && (
                <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setDraft(null)}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <ArrowLeft size={14} />
                  Kembali
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Check size={14} />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
