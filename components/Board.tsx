"use client";

import { useEffect, useState } from "react";
import ActionItemCard from "@/components/ActionItemCard";
import SmartAddModal from "@/components/SmartAddModal";
import { statusPapan, type ActionItem, type StatusDb, type StatusPapan } from "@/lib/types";

const COLUMNS: { key: StatusPapan; label: string }[] = [
  { key: "belum_mulai", label: "Belum Mulai" },
  { key: "berjalan", label: "Berjalan" },
  { key: "selesai", label: "Selesai" },
  { key: "overdue", label: "Overdue" },
];

export default function Board() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const res = await fetch("/api/items");
      const data = (await res.json()) as ActionItem[];
      if (!ignore) {
        setItems(data);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleStatusChange(id: string, status: StatusDb) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status } : it))
    );
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function handleCreated(item: ActionItem) {
    setItems((prev) => [...prev, item]);
    setShowModal(false);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Kejarin
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Papan Action Item
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          + Tambah Item
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Memuat...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const colItems = items.filter((it) => statusPapan(it) === col.key);
            return (
              <div key={col.key} className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-950">
                <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {col.label} ({colItems.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {colItems.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <SmartAddModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
