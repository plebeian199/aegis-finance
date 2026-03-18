"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { seedHistoricalSnapshots } from "@/app/actions";

export function SeedSnapshotsButton({ currentNetWorth }: { currentNetWorth: number }) {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    await seedHistoricalSnapshots(currentNetWorth);
    setLoading(false);
  };

  return (
    <div className="mt-4 w-full bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-blue-300 text-sm font-medium">Grafik kosong?</p>
        <p className="text-blue-400/80 text-xs mt-0.5">Hasilkan 12 bulan data historis simulasi untuk melihat fitur perbandingan MoM & YoY.</p>
      </div>
      <button 
        onClick={handleSeed}
        disabled={loading || currentNetWorth <= 0}
        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {loading ? "Menghasilkan..." : "Simulasikan Riwayat 1 Tahun"}
      </button>
    </div>
  );
}
