"use client";

import { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Smart Add
        </h2>

        {!draft ? (
          <>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Tulis catatan bebas, contoh: &quot;Budi kirim laporan penjualan
              Jumat depan&quot;
            </p>
            <textarea
              className="mt-3 w-full rounded border border-zinc-300 bg-white p-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik catatan rapat di sini..."
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={handleExtract}
                disabled={loading || !text.trim()}
                className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {loading ? "Memproses..." : "Ekstrak dengan AI"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Cek dan koreksi hasil ekstraksi AI sebelum disimpan.
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                PIC
                <input
                  className="mt-1 rounded border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  value={draft.pic}
                  onChange={(e) => setDraft({ ...draft, pic: e.target.value })}
                />
              </label>
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                Nomor WhatsApp PIC
                <input
                  className="mt-1 rounded border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="62812xxxxxxx"
                  value={nomorWa}
                  onChange={(e) => setNomorWa(e.target.value)}
                />
              </label>
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                Deskripsi Tugas
                <textarea
                  className="mt-1 rounded border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  rows={2}
                  value={draft.deskripsi_tugas}
                  onChange={(e) =>
                    setDraft({ ...draft, deskripsi_tugas: e.target.value })
                  }
                />
              </label>
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                Deadline
                <input
                  type="date"
                  className="mt-1 rounded border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  value={draft.deadline}
                  onChange={(e) =>
                    setDraft({ ...draft, deadline: e.target.value })
                  }
                />
              </label>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDraft(null)}
                className="rounded px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Kembali
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
