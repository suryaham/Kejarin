"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles, CalendarRange, X } from "lucide-react";
import ActionItemCard from "@/components/ActionItemCard";
import SmartAddModal from "@/components/SmartAddModal";
import { statusPapan, type ActionItem, type StatusDb, type StatusPapan } from "@/lib/types";
import { COLUMN_STYLES } from "@/lib/statusStyles";

const COLUMNS: StatusPapan[] = ["belum_mulai", "berjalan", "selesai", "overdue"];

export default function Board() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (dateFrom && it.deadline < dateFrom) return false;
      if (dateTo && it.deadline > dateTo) return false;
      return true;
    });
  }, [items, dateFrom, dateTo]);

  const isFiltering = dateFrom !== "" || dateTo !== "";

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl">
              <span>🎯</span>
              <span>Kejarin</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">Papan Action Item</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Item
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-1.5 text-sm text-white/70">
            <CalendarRange size={16} />
            Filter deadline:
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border-0 bg-white/10 px-2.5 py-1.5 text-sm text-white outline-none ring-1 ring-inset ring-white/10 [color-scheme:dark] focus:ring-2 focus:ring-indigo-400"
          />
          <span className="text-sm text-white/50">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border-0 bg-white/10 px-2.5 py-1.5 text-sm text-white outline-none ring-1 ring-inset ring-white/10 [color-scheme:dark] focus:ring-2 focus:ring-indigo-400"
          />
          {isFiltering && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20"
            >
              <X size={12} />
              Reset
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-white/90">Memuat...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => {
              const style = COLUMN_STYLES[col];
              const colItems = filteredItems.filter((it) => statusPapan(it) === col);
              return (
                <div
                  key={col}
                  className="flex flex-col rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10"
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
                      <p className="rounded-xl border-2 border-dashed border-white/20 py-6 text-center text-xs text-white/50">
                        {isFiltering ? "Tidak ada item di rentang ini" : "Belum ada item di sini"}
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
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
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
