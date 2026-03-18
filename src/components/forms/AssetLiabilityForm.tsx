"use client";

import { useState } from "react";
import { PlusCircle, ArrowRight, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { addAccount, updateAccountBalance } from "@/app/actions";
import { SearchableSelect } from "./SearchableSelect";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";

export const TREASURY_CATEGORIES = [
  { id: "Kas / Uang Tunai", name: "Kas / Uang Tunai", grouping: "Tier 1: Sangat Likuid (Cash & Equivalents)" },
  { id: "Rekening Tabungan Bank", name: "Rekening Tabungan Bank", grouping: "Tier 1: Sangat Likuid (Cash & Equivalents)" },
  { id: "Deposito Berjangka", name: "Deposito Berjangka", grouping: "Tier 1: Sangat Likuid (Cash & Equivalents)" },
  { id: "E-Wallet (GoPay, OVO, dll)", name: "E-Wallet (GoPay, OVO, Dana, dll)", grouping: "Tier 1: Sangat Likuid (Cash & Equivalents)" },
  { id: "Valuta Asing (Forex/Hard Cash)", name: "Valuta Asing (Forex/Hard Cash)", grouping: "Tier 1: Sangat Likuid (Cash & Equivalents)" },
  
  { id: "Reksadana Pasar Uang (RDPU)", name: "Reksadana Pasar Uang (RDPU)", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "Reksadana Pendapatan Tetap (RDPT)", name: "Reksadana Pendapatan Tetap (RDPT)", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "Reksadana Saham / Campuran", name: "Reksadana Saham / Campuran", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "Saham Domestik (IHSG)", name: "Saham Domestik (IHSG)", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "Saham Global (US/International)", name: "Saham Global (US/International)", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "SBN (ORI, SBR, Sukuk, SR)", name: "SBN (ORI, SBR, Sukuk, SR)", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "Obligasi Korporasi", name: "Obligasi Korporasi", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "Kripto (Bitcoin, Altcoins)", name: "Kripto (Bitcoin, Altcoins)", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  { id: "P2P Lending", name: "P2P Lending", grouping: "Tier 2: Sekuritas & Investasi Pasar" },
  
  { id: "Logam Mulia (Emas Antam/UBS)", name: "Logam Mulia (Emas Antam/UBS)", grouping: "Tier 3: Aset Ilikuid & Fisik" },
  { id: "Properti (Rumah Tempat Tinggal)", name: "Properti (Rumah Tempat Tinggal)", grouping: "Tier 3: Aset Ilikuid & Fisik" },
  { id: "Properti (Tanah / Investasi)", name: "Properti (Tanah / Investasi)", grouping: "Tier 3: Aset Ilikuid & Fisik" },
  { id: "Kendaraan (Mobil / Motor)", name: "Kendaraan (Mobil / Motor)", grouping: "Tier 3: Aset Ilikuid & Fisik" },
  { id: "Barang Berharga (Jam Tangan, Tas)", name: "Barang Berharga (Jam Tangan Mewah, Tas)", grouping: "Tier 3: Aset Ilikuid & Fisik" },
  { id: "Aset Bisnis / Ekuitas Pribadi", name: "Aset Bisnis / Ekuitas Pribadi", grouping: "Tier 3: Aset Ilikuid & Fisik" },
  
  { id: "BPJS Ketenagakerjaan (JHT / JP)", name: "BPJS Ketenagakerjaan (JHT / JP)", grouping: "Dana Pensiun & Terkunci" },
  { id: "DPLK (Dana Pensiun Lembaga Keuangan)", name: "DPLK (Dana Pensiun Lembaga Keuangan)", grouping: "Dana Pensiun & Terkunci" },
  
  { id: "Piutang (Uang Dipinjamkan)", name: "Piutang (Uang Dipinjamkan ke Orang Lain)", grouping: "Tier 4: Piutang" },
  { id: "Tagihan / Faktur Bisnis", name: "Tagihan / Faktur Bisnis Terutang", grouping: "Tier 4: Piutang" },
  
  { id: "Liabilitas: Kartu Kredit", name: "Kartu Kredit", grouping: "Liabilitas Jangka Pendek (Current Liabilities)" },
  { id: "Liabilitas: Paylater (Shopee, GoPay)", name: "Paylater (Shopee, GoPay, dll)", grouping: "Liabilitas Jangka Pendek (Current Liabilities)" },
  { id: "Liabilitas: Pinjol / KTA", name: "Pinjaman Online (Pinjol) / KTA Bank", grouping: "Liabilitas Jangka Pendek (Current Liabilities)" },
  { id: "Liabilitas: Hutang Pribadi/Teman", name: "Hutang Pribadi / Keluarga / Teman", grouping: "Liabilitas Jangka Pendek (Current Liabilities)" },
  
  { id: "Liabilitas: KPR (Rumah/Apartemen)", name: "KPR (Kredit Pemilikan Rumah)", grouping: "Liabilitas Jangka Panjang (Long Term)" },
  { id: "Liabilitas: KKB (Kendaraan)", name: "KKB (Kredit Kendaraan Bermotor)", grouping: "Liabilitas Jangka Panjang (Long Term)" },
  { id: "Liabilitas: Pinjaman Bisnis Modal", name: "Pinjaman Modal Bisnis", grouping: "Liabilitas Jangka Panjang (Long Term)" }
];

type FormMode = "Add" | "Update";

export function AssetLiabilityForm({ accounts }: { accounts: any[] }) {
  const [mode, setMode] = useState<FormMode>("Add");
  const [loading, setLoading] = useState(false);

  // Add State
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState("Kas / Uang Tunai");
  const [addOwner, setAddOwner] = useState("Keluarga");
  const addValueInput = useCurrencyInput();

  // Update State
  const [updateId, setUpdateId] = useState(accounts?.[0]?.id || "");
  const updateValueInput = useCurrencyInput();

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addValueInput.rawValue) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("name", addName);
    formData.append("category", addType);
    formData.append("initialValue", addValueInput.rawValue);
    formData.append("owner", addOwner);

    await addAccount(formData);
    setLoading(false);
    setAddName("");
    addValueInput.reset();
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateId || !updateValueInput.rawValue) return;
    setLoading(true);
    await updateAccountBalance(updateId, parseFloat(updateValueInput.rawValue));
    setLoading(false);
    updateValueInput.reset();
  };

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 shadow-2xl relative transition-all duration-500">
      <div className={`absolute top-0 right-10 w-24 h-[1px] transition-colors duration-500 ${mode === 'Add' ? 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/50 to-transparent'}`}></div>
      
      <div className="flex flex-col xl:flex-row justify-between xl:items-start items-stretch gap-6 mb-8">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Entri Manual</h2>
          <p className="text-zinc-400 text-sm mt-1">{mode === 'Add' ? 'Buat aset atau liabilitas baru' : 'Perbarui saldo penutupan bulan ini'}</p>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-fit">
          <button 
            type="button"
            onClick={() => setMode("Add")}
            className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-all", mode === "Add" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            Pencatatan Baru
          </button>
          <button 
            type="button"
            onClick={() => setMode("Update")}
            className={cn("px-4 py-1.5 text-xs font-medium rounded-lg transition-all", mode === "Update" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
          >
            Perbarui Saldo
          </button>
        </div>
      </div>

      {mode === "Add" ? (
        <form className="space-y-6" onSubmit={handleAddSubmit}>
          <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tipe</label>
                <SearchableSelect 
                  options={TREASURY_CATEGORIES}
                  value={addType}
                  onChange={(val) => setAddType(val)}
                  placeholder="Cari tipe aset/liabilitas..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nama / Identitas</label>
                <input 
                  type="text" 
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Misal: Reksadana Sucorinvest, KPR Mandiri" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nilai Awal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono pointer-events-none">Rp</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    required
                    value={addValueInput.displayValue}
                    onChange={addValueInput.handleChange}
                    placeholder="0" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pemilik</label>
                <div className="relative">
                  <select 
                    value={addOwner}
                    onChange={(e) => setAddOwner(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer">
                    <option value="Keluarga">🏠 Keluarga</option>
                    <option value="Vian">👤 Vian</option>
                    <option value="Marshella">👤 Marshella</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <button disabled={loading} className="w-full group mt-2 relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-emerald-950 bg-emerald-400 rounded-xl overflow-hidden transition-all hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin text-emerald-950/80" /> : <PlusCircle size={18} className="text-emerald-950/80" />}
              <span>{loading ? "Menyimpan..." : "Buat Pencatatan"}</span>
              {!loading && <ArrowRight size={16} className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
            </button>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleUpdateSubmit}>
          <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pilih Akun / Aset</label>
                <SearchableSelect 
                  options={accounts?.map(acc => ({
                    id: acc.id,
                    name: `${acc.name} (Saldo: Rp ${Number(acc.current_balance).toLocaleString('id-ID')})`,
                    grouping: acc.category
                  })) || []}
                  value={updateId}
                  onChange={(val) => setUpdateId(val)}
                  placeholder="Cari akun untuk diperbarui..."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Saldo Tetap Baru (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-mono pointer-events-none">Rp</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      required
                      value={updateValueInput.displayValue}
                      onChange={updateValueInput.handleChange}
                      placeholder="Masukkan nilai penutupan..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xl"
                    />
                  </div>
                </div>
              </div>
              
              <button disabled={loading || !accounts || accounts.length === 0} className="w-full group mt-2 relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-blue-600 rounded-xl overflow-hidden transition-all hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin text-white/80" /> : <RefreshCw size={18} className="text-white/80 group-hover:rotate-180 transition-transform duration-500" />}
                <span>{loading ? "Menyimpan..." : "Kunci Saldo Baru"}</span>
              </button>
          </div>
        </form>
      )}
    </div>
  );
}
