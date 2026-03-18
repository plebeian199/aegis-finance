"use client";

import { useState } from "react";
import { Loader2, ArrowDownRight, ArrowUpRight, Repeat, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { addTransaction } from "@/app/actions";
import { SearchableSelect } from "@/components/forms/SearchableSelect";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";

type TransactionType = "income" | "expense" | "transfer";

export function TransactionForm({ 
  accounts, 
  categories 
}: { 
  accounts: any[], 
  categories: any[] 
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const amountInput = useCurrencyInput();
  const [description, setDescription] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type !== "transfer" && !categoryId) {
      alert("Harap pilih kategori transaksi.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("transaction_date", date);
    formData.append("amount", amountInput.rawValue);
    formData.append("description", description);
    formData.append("transaction_type", type);
    formData.append("is_recurring", isRecurring.toString());

    if (type === "expense") {
      formData.append("source_account_id", sourceId);
      formData.append("category_id", categoryId);
    } else if (type === "income") {
      formData.append("destination_account_id", destinationId);
      formData.append("category_id", categoryId);
    } else if (type === "transfer") {
      formData.append("source_account_id", sourceId);
      formData.append("destination_account_id", destinationId);
    }

    await addTransaction(formData);
    
    setLoading(false);
    amountInput.reset();
    setDescription("");
    setIsRecurring(false);
    // Keep the date and accounts selected for rapid entry
  };

  // Filter categories and group them
  const availableCategories = categories.filter(c => c.type === type);
  const groupedCategories = availableCategories.reduce((acc: any, cat: any) => {
    if (!acc[cat.grouping]) acc[cat.grouping] = [];
    acc[cat.grouping].push(cat);
    return acc;
  }, {});

  const typeConfig = {
    expense: { color: "from-red-500/50", button: "bg-red-500 hover:bg-red-400 text-red-950 shadow-[0_0_20px_rgba(239,68,68,0.3)]", icon: <ArrowUpRight size={18} /> },
    income: { color: "from-emerald-500/50", button: "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]", icon: <ArrowDownRight size={18} /> },
    transfer: { color: "from-blue-500/50", button: "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]", icon: <Repeat size={18} /> },
  };

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 shadow-2xl relative transition-all duration-500">
      <div className={`absolute top-0 right-10 w-24 h-[1px] transition-colors duration-500 bg-gradient-to-r ${typeConfig[type].color} via-transparent to-transparent`}></div>
      
      <div className="flex flex-col xl:flex-row justify-between xl:items-start items-stretch gap-6 mb-8">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Catat Transaksi</h2>
          <p className="text-zinc-400 text-sm mt-1">Sistem pencatatan double-entry (Berpasangan)</p>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-fit">
          <button 
            type="button"
            onClick={() => { setType("expense"); setCategoryId(""); }}
            className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1", type === "expense" ? "bg-red-500/20 text-red-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            <ArrowUpRight size={14} /> Pengeluaran
          </button>
          <button 
            type="button"
            onClick={() => { setType("income"); setCategoryId(""); }}
            className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1", type === "income" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            <ArrowDownRight size={14} /> Pemasukan
          </button>
          <button 
            type="button"
            onClick={() => { setType("transfer"); setCategoryId(""); }}
            className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1", type === "transfer" ? "bg-blue-500/20 text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Repeat size={14} /> Transfer
          </button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tanggal</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nominal (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono pointer-events-none">Rp</span>
              <input 
                type="text"
                inputMode="numeric"
                required
                value={amountInput.displayValue}
                onChange={amountInput.handleChange}
                placeholder="0" 
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono"
              />
            </div>
          </div>

          {(type === "expense" || type === "transfer") && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sumber Dana (Dari)</label>
              <div className="relative">
                <select 
                  required
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none transition-all cursor-pointer">
                  <option value="" disabled>Pilih Rekening / Aset Sumber</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Rp {Number(acc.current_balance).toLocaleString('id-ID')})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          )}

          {(type === "income" || type === "transfer") && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tujuan Dana (Ke)</label>
              <div className="relative">
                <select 
                  required
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none transition-all cursor-pointer">
                  <option value="" disabled>Pilih Rekening / Aset Tujuan</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Rp {Number(acc.current_balance).toLocaleString('id-ID')})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          )}

          {type !== "transfer" && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Kategori (Pencarian Cerdas)</label>
              <SearchableSelect
                options={availableCategories}
                value={categoryId}
                onChange={(val) => setCategoryId(val)}
                placeholder="Ketik untuk mencari kategori..."
              />
            </div>
          )}

          <div className="space-y-4 md:col-span-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Catatan Tambahan / Deskripsi</label>
              <input 
                type="text" 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Misal: Beli makan siang, Gaji bulan Maret..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            
            {type !== "transfer" && (
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="sr-only" 
                  />
                  <div className={cn("w-10 h-6 bg-black/40 border border-white/10 rounded-full transition-colors flex items-center px-1", isRecurring ? "bg-blue-500/50 border-blue-500/50" : "")}>
                    <div className={cn("w-4 h-4 bg-zinc-400 rounded-full transition-all transform", isRecurring ? "translate-x-4 bg-white" : "")} />
                  </div>
                </div>
                <div className="select-none">
                  <p className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">Pengeluaran/Pemasukan Rutin (Recurring)</p>
                  <p className="text-xs text-zinc-500">Tandai jika transaksi ini berulang setiap bulan.</p>
                </div>
              </label>
            )}
          </div>
          
          
        </div>
        
        <button disabled={loading} className={cn("w-full group mt-2 relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium rounded-xl overflow-hidden transition-all disabled:opacity-50", typeConfig[type].button)}>
          {loading ? <Loader2 size={18} className="animate-spin opacity-80" /> : <div className="opacity-80">{typeConfig[type].icon}</div>}
          <span>{loading ? "Menyimpan..." : "Catat Transaksi"}</span>
        </button>
      </form>
    </div>
  );
}
