"use client";

import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { AssetLiabilityForm } from "@/components/forms/AssetLiabilityForm";
import { AssetTable } from "@/components/tables/AssetTable";
import { ZakatCalculator } from "@/components/widgets/ZakatCalculator";
import { SeedSnapshotsButton } from "@/components/widgets/SeedSnapshotsButton";
import { getFullBackup } from "@/app/actions";
import { Download } from "lucide-react";

type TreasuryTabProps = {
  currentNetWorth: number;
  snapshotsData: any[];
  liquidAssets: number;
  marketableAssets: number;
  illiquidAssets: number;
  totalLiabilitiesSum: number;
  accountsData: any[];
  burnRate: number;
};

export function TreasuryTab({
  currentNetWorth,
  snapshotsData,
  liquidAssets,
  marketableAssets,
  illiquidAssets,
  totalLiabilitiesSum,
  accountsData,
  burnRate
}: TreasuryTabProps) {
  
  const formatShort = (val: number) => {
    if (val === 0) return "Rp 0";
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(2)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const handleBackup = async () => {
    const data = await getFullBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aegis_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Massive Top-line Net Worth Metric */}
      <section className="flex flex-col items-center justify-center py-12">
        <p className="text-zinc-400 text-sm tracking-widest uppercase mb-2 font-medium">Total Kekayaan Bersih</p>
        <div className="text-6xl md:text-8xl font-light tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:drop-shadow-[0_0_40px_rgba(37,99,235,0.2)] transition-all duration-500">
          <span className="text-5xl md:text-7xl text-zinc-500 mr-2">Rp</span>{currentNetWorth.toLocaleString('id-ID')}
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <NetWorthChart data={snapshotsData} currentNetWorth={currentNetWorth} />
            {!snapshotsData || snapshotsData.length === 0 ? (
              <SeedSnapshotsButton currentNetWorth={currentNetWorth} />
            ) : null}
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Aset Likuid", value: formatShort(liquidAssets), color: "blue" },
              { label: "Sekuritas Pasa...", value: formatShort(marketableAssets), color: "indigo" },
              { label: "Aset Ilikuid", value: formatShort(illiquidAssets), color: "emerald" },
              { label: "Total Liab...", value: formatShort(totalLiabilitiesSum), color: "red" }
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
                <p className="text-zinc-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2 truncate" title={stat.label}>{stat.label}</p>
                <p className="text-white text-lg sm:text-xl font-medium tracking-tight truncate">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/20 blur-3xl -z-10 rounded-full"></div>
               <p className="text-red-400 text-xs font-medium uppercase tracking-wider mb-2">Absolute Burn Rate (30 Hari)</p>
               <p className="text-white text-3xl font-light font-mono">Rp {burnRate.toLocaleString('id-ID')}</p>
               <p className="text-zinc-500 text-xs mt-2">Total pengeluaran esensial berulang</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
               <p className="text-blue-400 text-xs font-medium uppercase tracking-wider mb-2">Emergency Runway</p>
               <p className="text-white text-3xl font-light font-mono">
                 {burnRate > 0 ? (liquidAssets / burnRate).toFixed(1) : "∞"} <span className="text-xl text-zinc-500">Bulan</span>
               </p>
               <p className="text-zinc-500 text-xs mt-2">Ketahanan kas likuid terhadap Burn Rate</p>
            </div>
          </div>
          
          <AssetTable accounts={accountsData as any} />
        </div>

        {/* Form Column */}
        <div className="space-y-4">
          <AssetLiabilityForm accounts={accountsData as any} />
          <ZakatCalculator liquidAssets={liquidAssets} />
          
          {/* Data Backup */}
          <button
            onClick={handleBackup}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800/60 border border-white/5 rounded-2xl py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors"
          >
            <Download size={14}/> Backup Semua Data (JSON)
          </button>
        </div>

      </div>
    </div>
  );
}
