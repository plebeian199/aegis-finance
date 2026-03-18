"use client";

import { HandCoins } from "lucide-react";

export function ZakatCalculator({ liquidAssets }: { liquidAssets: number }) {
  const nisabThreshold = 85000000; // Approx 85g gold @ current
  const isObligated = liquidAssets >= nisabThreshold;
  const zakatAmount = isObligated ? liquidAssets * 0.025 : 0;

  return (
    <div className="w-full bg-gradient-to-br from-emerald-900/40 to-green-900/20 rounded-3xl border border-emerald-500/20 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden mt-8">
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
          <HandCoins size={24} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-white text-lg font-medium tracking-tight">Kalkulator Zakat Maal</h2>
          <p className="text-emerald-400/80 text-xs mt-0.5">Nisab minimum (85g emas): Rp {nisabThreshold.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Aset Likuid Tersimpan (Haul 1 Tahun)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-2xl font-light tracking-tight">Rp {liquidAssets.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-500/20">
          {isObligated ? (
             <div className="flex justify-between items-end">
               <div>
                  <p className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1">Estimasi Zakat (2.5%)</p>
                  <p className="text-emerald-400 text-3xl font-medium tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    Rp {zakatAmount.toLocaleString('id-ID')}
                  </p>
               </div>
               <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-xs font-medium rounded-xl border border-emerald-500/30 transition-all">
                 Tunaikan Zakat
               </button>
             </div>
          ) : (
             <div>
                <p className="text-zinc-500 text-sm">Harta Anda belum mencapai ambang batas minimum (Nisab) untuk diwajibkan Zakat Maal.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
