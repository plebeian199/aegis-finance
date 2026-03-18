"use client";

import { useState } from "react";
import { Plus, Trash2, Repeat, Clock, ToggleLeft, ToggleRight, ArrowDownRight, ArrowUpRight, Edit2, X } from "lucide-react";
import { addRecurringTemplate, deleteRecurringTemplate, toggleRecurringTemplate, updateRecurringTemplate } from "@/app/actions";

export function AutomationTab({ recurring, accounts, categories }: { recurring: any[], accounts: any[], categories: any[] }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [freq, setFreq] = useState("monthly");
  const [nextDate, setNextDate] = useState("");
  
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  
  const [catId, setCatId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");

  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditClick = (rt: any) => {
    setEditingId(rt.id);
    setDesc(rt.description);
    setAmount(rt.amount.toString());
    setType(rt.transaction_type);
    setFreq(rt.frequency);
    setNextDate(rt.next_execution_date);
    setHasEndDate(!!rt.end_date);
    setEndDate(rt.end_date || "");
    setCatId(rt.category_id || "");
    
    if (rt.transaction_type === "expense") {
      setSourceId(rt.source_account_id || "");
      setDestId("");
    } else {
      setSourceId("");
      setDestId(rt.destination_account_id || "");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDesc(""); setAmount(""); setNextDate(""); setEndDate(""); setHasEndDate(false);
    setCatId(""); setSourceId(""); setDestId(""); setType("expense");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      description: desc,
      amount: parseFloat(amount),
      transaction_type: type,
      frequency: freq,
      next_execution_date: nextDate,
      end_date: hasEndDate && endDate ? endDate : null,
      category_id: catId || null,
      source_account_id: sourceId || null,
      destination_account_id: destId || null,
    };

    if (editingId) {
      await updateRecurringTemplate(editingId, payload);
    } else {
      await addRecurringTemplate({ ...payload, is_active: true });
    }
    
    cancelEdit();
    setLoading(false);
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleRecurringTemplate(id, !current);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus automation ini?")) {
      await deleteRecurringTemplate(id);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-6 md:p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-white text-lg font-medium tracking-tight flex items-center gap-2">
                 {editingId ? <Edit2 size={18} className="text-blue-500" /> : <Repeat size={18} className="text-purple-500" />}
                 {editingId ? "Edit Automation" : "Automation Engine"}
               </h2>
               {editingId && (
                 <button onClick={cancelEdit} className="text-zinc-500 hover:text-rose-400 p-1 bg-white/5 rounded-md border border-white/5 transition-colors">
                   <X size={14}/>
                 </button>
               )}
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setType('expense')} className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${type === 'expense' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-black/40 text-zinc-500 border-transparent hover:text-zinc-300'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setType('income')} className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-black/40 text-zinc-500 border-transparent hover:text-zinc-300'}`}>Pemasukan</button>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Deskripsi Pembayaran</label>
                <input required type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="Contoh: Langganan Netflix" />
              </div>
              
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Nominal (Rp)</label>
                <input required type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Kategori</label>
                  <select value={catId} onChange={e => setCatId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2.5 text-white text-xs focus:outline-none">
                    <option value="">(Pilih)</option>
                    {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Akun (Kas)</label>
                  <select value={type === 'expense' ? sourceId : destId} onChange={e => type === 'expense' ? setSourceId(e.target.value) : setDestId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2.5 text-white text-xs focus:outline-none">
                    <option value="">(Pilih)</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 border-dashed">
                 <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block">Siklus</label>
                  <select value={freq} onChange={e => setFreq(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs">
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block">Mulai Eksekusi</label>
                  <input required type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs" style={{colorScheme:'dark'}}/>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 border-dashed">
                <label className="flex items-center gap-2 text-[10px] text-zinc-400 cursor-pointer mb-2">
                  <input type="checkbox" checked={hasEndDate} onChange={() => setHasEndDate(!hasEndDate)} className="rounded border-white/10 bg-black/40 text-purple-500 focus:ring-0 focus:ring-offset-0" />
                  Menggunakan Tanggal Batas Akhir
                </label>
                {hasEndDate && (
                  <div>
                    <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs" style={{colorScheme:'dark'}}/>
                  </div>
                )}
              </div>

              <button disabled={loading} type="submit" className={`w-full mt-4 font-medium rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50 ${editingId ? 'bg-blue-500 text-blue-950 hover:bg-blue-400' : 'bg-purple-500 text-purple-950 hover:bg-purple-400'}`}>
                {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Aktifkan Autopilot")}
              </button>
            </form>
          </div>
        </div>

        {/* Template List */}
        <div className="lg:col-span-2">
          {recurring.length === 0 ? (
            <div className="w-full h-full min-h-[300px] bg-zinc-900/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center">
              <Clock size={40} className="text-zinc-600 mb-4" />
              <p className="text-zinc-300 font-medium text-lg">Autopilot Mati</p>
              <p className="text-zinc-500 text-sm mt-2 max-w-sm">Buat template rutin di samping, dan sistem akan otomatis mencatatnya ke Ledger setiap jadwal jatuh tempo ketika Anda membuka App ini.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-6 md:p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/10 text-xs text-zinc-500">
                        <th className="pb-3 px-2">Transaksi</th>
                        <th className="pb-3 px-2">Nominal</th>
                        <th className="pb-3 px-2">Rutinitas</th>
                        <th className="pb-3 px-2">Jadwal Fix</th>
                        <th className="pb-3 px-2 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                    {recurring.map(rt => {
                      // Need to resolve names locally since our supabase query might not handle the complex double joins dynamically right out of the box depending on FK names
                      const catName = categories.find(c => c.id === rt.category_id)?.name || "Uncategorized";
                      const srcAcc = accounts.find(a => a.id === rt.source_account_id)?.name;
                      const destAcc = accounts.find(a => a.id === rt.destination_account_id)?.name;

                      return (
                        <tr key={rt.id} className={`border-b border-white/5 hover:bg-white/[0.02] ${!rt.is_active ? 'opacity-50' : ''}`}>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-2">
                               <div className={`p-1.5 rounded-md ${rt.transaction_type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {rt.transaction_type === 'income' ? <ArrowDownRight size={12}/> : <ArrowUpRight size={12}/>}
                               </div>
                               <div>
                                 <p className="text-sm font-medium text-white">{rt.description}</p>
                                 <p className="text-[10px] text-zinc-500">{catName} • {srcAcc||destAcc}</p>
                               </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 font-mono text-sm text-zinc-300">
                            Rp {Number(rt.amount).toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 px-2">
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest">{rt.frequency}</span>
                            {rt.end_date && (
                              <div className="text-[9px] text-rose-400/80 mt-1 uppercase tracking-wider font-medium">Batas: {new Date(rt.end_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric'})}</div>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <span className="text-xs text-blue-300 font-mono flex items-center gap-1.5"><Clock size={12}/> {new Date(rt.next_execution_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                          </td>
                          <td className="py-4 px-2 text-right">
                             <div className="flex items-center justify-end gap-2">
                               <button onClick={() => handleToggle(rt.id, rt.is_active)} className={`p-1.5 rounded-md transition-colors ${rt.is_active ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-zinc-600 hover:text-emerald-400'}`}>
                                  {rt.is_active ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                               </button>
                               <button onClick={() => handleEditClick(rt)} className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-md hover:bg-blue-400/10 transition-colors">
                                 <Edit2 size={16}/>
                               </button>
                               <button onClick={() => handleDelete(rt.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-400/10 transition-colors">
                                 <Trash2 size={16}/>
                               </button>
                             </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
