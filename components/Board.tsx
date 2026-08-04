"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import ActionItemCard from "@/components/ActionItemCard";
import SmartAddModal from "@/components/SmartAddModal";
import { statusPapan, type ActionItem, type StatusDb, type StatusPapan } from "@/lib/types";
import { COLUMN_STYLES } from "@/lib/statusStyles";

const COLUMNS: StatusPapan[] = ["belum_mulai", "berjalan", "selesai", "overdue"];

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
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              🎯 Kejarin
            </h1>
            <p className="text-sm text-white/80">Papan Action Item</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Item
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-white/90">Memuat...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => {
              const style = COLUMN_STYLES[col];
              const colItems = items.filter((it) => statusPapan(it) === col);
              return (
                <div
                  key={col}
                  className="flex flex-col rounded-2xl bg-white/15 p-2.5 backdrop-blur-sm"
                >
                  <div
                    className={`mb-2.5 flex items-center justify-between rounded-xl ${style.headerBg} px-3 py-2 shadow-sm`}
                  >
                    <span className="text-sm font-semibold text-white">
                      {style.emoji} {style.label}
                    </span>
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold text-white">
                      {colItems.length}
                    </span>
                  </div>
                  <div className="flex min-h-[80px] flex-col gap-2.5">
                    {colItems.length === 0 ? (
                      <p className="rounded-xl border-2 border-dashed border-white/30 py-6 text-center text-xs text-white/70">
                        Belum ada item di sini
                      </p>
                    ) : (
                      colItems.map((item) => (
                        <ActionItemCard
                          key={item.id}
                          item={item}
                          columnStatus={col}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/80">
            <Sparkles size={16} />
            Klik &quot;Tambah Item&quot; untuk mulai mencatat action item rapat kamu
          </div>
        )}
      </div>

      {showModal && (
        <SmartAddModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
