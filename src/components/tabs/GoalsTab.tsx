"use client";

import { useState } from "react";
import { Target, Plus, Trash2, Check, ExternalLink, Link2, X } from "lucide-react";
import { addGoal, deleteGoal, assignAccountToGoal } from "@/app/actions";

export function GoalsTab({ goals, accounts }: { goals: any[], accounts: any[] }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("🎯");
  
  const [loading, setLoading] = useState(false);

  const [assigningGoalId, setAssigningGoalId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addGoal(name, parseFloat(target), targetDate, icon);
    setName("");
    setTarget("");
    setTargetDate("");
    setLoading(false);
  };

  const handleAssign = async (accountId: string, goalId: string | null) => {
    await assignAccountToGoal(accountId, goalId);
    setAssigningGoalId(null);
  };

  const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-6 md:p-8 backdrop-blur-xl">
            <h2 className="text-white text-lg font-medium tracking-tight mb-6 flex items-center gap-2">
              <Target size={18} className="text-amber-500" /> Target Keuangan
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Nama Target</label>
                <div className="flex gap-2">
                  <input required type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-12 bg-black/40 border border-white/10 rounded-xl px-2 text-center text-lg focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="🎯" />
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Contoh: Dana Darurat" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Total Dana Dibutuhkan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Rp</span>
                  <input required type="number" min="0" value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="50000000" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Target Waktu (Opsional)</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" style={{ colorScheme: 'dark' }} />
              </div>
              
              <button disabled={loading} type="submit" className="w-full mt-4 bg-amber-500 text-amber-950 font-medium rounded-xl py-2.5 text-sm hover:bg-amber-400 transition-colors disabled:opacity-50">
                {loading ? "Menyimpan..." : "Buat Target"}
              </button>
            </form>
          </div>
        </div>

        {/* Goals List  */}
        <div className="lg:col-span-2">
          {goals.length === 0 ? (
            <div className="w-full h-48 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-zinc-500">
              Belum ada target keuangan. Buat satu untuk mulai menabung!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map(goal => {
                // Find associated accounts to calculate progress
                const mappedAccounts = accounts.filter(a => a.goal_id === goal.id);
                const currentSaved = mappedAccounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
                const progress = Math.min((currentSaved / goal.target_amount) * 100, 100);
                
                const isAssigning = assigningGoalId === goal.id;

                return (
                  <div key={goal.id} className="bg-zinc-900/40 rounded-3xl border border-white/5 p-6 hover:border-amber-500/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-xl shadow-inner shadow-white/5">
                          {goal.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{goal.name}</h3>
                          {goal.target_date && <p className="text-xs text-zinc-500">Tenggat: {new Date(goal.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>}
                        </div>
                      </div>
                      <button onClick={async () => { if(confirm('Hapus target ini? Tautan akun akan dilepas.')) await deleteGoal(goal.id); }} className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400 font-mono">{formatRp(currentSaved)}</span>
                        <span className="text-white font-mono">{formatRp(goal.target_amount)}</span>
                      </div>
                      <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/5">
                        <div className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-right text-[10px] text-amber-500/80 mt-1 font-mono tracking-wider">{progress.toFixed(1)}% TERCAPAI</p>
                    </div>

                    {/* Account Assignments */}
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5"><Link2 size={12}/> Sumber Dana</span>
                        <button onClick={() => setAssigningGoalId(isAssigning ? null : goal.id)} className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">
                          {isAssigning ? "Tutup" : "Tautkan Akun"}
                        </button>
                      </div>
                      
                      {isAssigning && (
                        <div className="mb-3">
                          <select 
                            onChange={(e) => handleAssign(e.target.value, goal.id)}
                            className="w-full bg-black border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>Pilih akun untuk ditautkan...</option>
                            {accounts.filter(a => a.goal_id !== goal.id && !a.is_liability).map(a => (
                              <option key={a.id} value={a.id}>{a.name} ({formatRp(Number(a.current_balance))})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {mappedAccounts.length === 0 ? (
                          <span className="text-xs text-zinc-600 italic">Belum ada akun terkait</span>
                        ) : (
                          mappedAccounts.map(a => (
                            <span key={a.id} className="inline-flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-1 rounded-md text-[10px] text-zinc-300">
                              {a.name}
                              <button onClick={() => handleAssign(a.id, null)} className="text-zinc-500 hover:text-rose-400"><X size={10}/></button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
