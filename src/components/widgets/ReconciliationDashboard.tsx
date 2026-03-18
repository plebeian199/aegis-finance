"use client";

import { useState, useEffect, useMemo } from "react";
import { ShieldAlert, ShieldCheck, Calculator, ArrowRight, Lock, Loader2 } from "lucide-react";
import { closeMonth, createAdjustmentTransaction } from "@/app/actions";

interface ReconciliationProps {
  latestSnapshot: any;
  transactions: any[];
  accounts: any[];
}

export function ReconciliationDashboard({ latestSnapshot, transactions, accounts }: ReconciliationProps) {
  // 1. Calculate Starting Balance (from previous snapshot or current Tier 1 accounts if no snapshot)
  const startingBalance = useMemo(() => {
    if (latestSnapshot) {
      return Number(latestSnapshot.liquid_assets);
    }
    // Fallback: This is not perfectly accurate if doing initial setup, but prevents zero logic errors
    return 0; // Or better: just 0 if no snapshot exists to force them to establish a baseline
  }, [latestSnapshot]);

  // 2. Calculate Net Cash Flow (Income - Expense) from transactions since last snapshot
  const { totalIncome, totalExpense, netCashFlow } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    
    transactions.forEach(t => {
      if (t.transaction_type === "income") inc += Number(t.amount);
      if (t.transaction_type === "expense") exp += Number(t.amount);
    });

    return { totalIncome: inc, totalExpense: exp, netCashFlow: inc - exp };
  }, [transactions]);

  // 3. Expected Cash Balance
  const expectedBalance = startingBalance + netCashFlow;

  // 4. Actual Bank Balance (sum of all current Tier 1 accounts)
  // We can let them override it, but for a true Clearinghouse, they update Account Balances on Tab 1
  // and see if the Database Accounts match the Ledger.
  const actualLedgerBalance = useMemo(() => {
    return accounts
      .filter(a => a.category.includes("Tier 1"))
      .reduce((sum, a) => sum + Number(a.current_balance), 0);
  }, [accounts]);

  const [actualInput, setActualInput] = useState<string>(actualLedgerBalance.toString());
  const [isClosing, setIsClosing] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const handleCloseMonth = async () => {
    if (!isReconciled) return;
    setIsClosing(true);
    const res = await closeMonth();
    setIsClosing(false);
    if (res.success) {
      alert("Bulan berhasil dikunci! Snapshot telah digenerate.");
    } else {
      alert("Gagal mengunci bulan: " + res.error);
    }
  };

  // Update input if ledger changes
  useEffect(() => {
    setActualInput(actualLedgerBalance.toString());
  }, [actualLedgerBalance]);

  const variance = Number(actualInput) - expectedBalance;
  const isReconciled = variance === 0;

  const handleAdjustment = async () => {
    if (variance === 0) return;
    setIsAdjusting(true);
    const amount = Math.abs(variance);
    const isIncome = variance > 0;
    
    await createAdjustmentTransaction(amount, isIncome);
    setIsAdjusting(false);
  };

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 lg:p-12 shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className={`absolute top-0 right-10 w-32 h-[1px] transition-colors duration-500 ${isReconciled ? 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-500 to-transparent'}`}></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-white text-2xl font-light tracking-tight flex items-center gap-3">
            <Calculator className="text-zinc-500" /> Dashboard Rekonsiliasi
          </h2>
          <p className="text-zinc-400 mt-2">Cocokkan Buku Besar (Ledger) dengan Realita Saldo Kas Anda.</p>
        </div>
        
        {isReconciled ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck size={18} />
            <span className="font-medium text-sm">Balanced & Valid</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-xl border border-amber-500/20">
            <ShieldAlert size={18} />
            <span className="font-medium text-sm">Terdapat Selisih (Variance)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 relative">
        {/* Connection Line */}
        <div className="hidden lg:block absolute top-[40%] left-[20%] right-[20%] h-[2px] bg-white/5 -z-10"></div>

        {/* Step 1: Starting */}
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Starting Balance</div>
          <div className="text-xs text-zinc-600 mb-4 truncate">{latestSnapshot ? `Snapshot: ${latestSnapshot.snapshot_date}` : 'Tidak ada snapshot awal'}</div>
          <div className="text-2xl text-white font-mono break-words">
            Rp {startingBalance.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Step 2: Flow */}
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Net Cash Flow</div>
          <div className="text-xs text-zinc-600 mb-4">Pemasukan - Pengeluaran</div>
          <div className={`text-2xl font-mono break-words ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netCashFlow >= 0 ? '+' : ''}Rp {netCashFlow.toLocaleString('id-ID')}
          </div>
          <div className="mt-4 flex justify-between text-xs font-mono">
            <span className="text-emerald-500/80">In: {totalIncome / 1000 >= 1000 ? (totalIncome / 1000000).toFixed(1) + 'M' : (totalIncome / 1000).toFixed(0) + 'k'}</span>
            <span className="text-red-500/80">Out: {totalExpense / 1000 >= 1000 ? (totalExpense / 1000000).toFixed(1) + 'M' : (totalExpense / 1000).toFixed(0) + 'k'}</span>
          </div>
        </div>

        {/* Step 3: Expected */}
        <div className="bg-black/40 rounded-2xl p-6 border border-blue-500/20 relative shadow-[0_0_30px_rgba(59,130,246,0.1)]">
          <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">Expected Balance</div>
          <div className="text-xs text-zinc-600 mb-4">Sesuai Catatan Buku Besar</div>
          <div className="text-2xl text-white font-mono font-medium break-words">
            Rp {expectedBalance.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Verification Box */}
      <div className="bg-zinc-800/50 rounded-2xl p-8 border border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-sm font-medium text-zinc-300">Actual Bank Balances (Realita)</label>
            <p className="text-xs text-zinc-500 mb-4">Total Kas/Bank di genggaman Anda saat ini.</p>
            <input 
              type="number" 
              value={actualInput}
              onChange={(e) => setActualInput(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-6 py-4 text-white text-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-400 mb-2">Unreconciled Variance</div>
              <div className={`text-4xl font-mono font-light tracking-tight ${variance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Rp {Math.abs(variance).toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                {variance === 0 
                  ? "Perfectly Balanced." 
                  : variance > 0 
                  ? "Ada uang lebih yang belum dicatat." 
                  : "Ada pengeluaran yang belum dicatat."}
              </div>
              
              {variance !== 0 && (
                <button 
                  onClick={handleAdjustment}
                  disabled={isAdjusting}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50"
                  title="Otomatis buat transaksi adjustment agar balance."
                >
                  {isAdjusting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Buat Jurnal Penyesuaian
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Month Close Button (Step 4 stub) */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleCloseMonth}
          disabled={!isReconciled || isClosing}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-white bg-blue-600 rounded-xl overflow-hidden transition-all hover:bg-blue-500 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:shadow-none"
        >
          {isClosing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
          <span>{isClosing ? "Memproses..." : "Generate Snapshot & Lock Month"}</span>
          {isReconciled && !isClosing && <ArrowRight size={16} className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
        </button>
      </div>

    </div>
  );
}
