"use client";

import { useState, Fragment } from "react";
import { Edit2, Clock, Trash2, Check, X, Loader2, ChevronDown, ChevronRight, CornerDownRight } from "lucide-react";
import { deleteAccount, updateAccountDetails } from "@/app/actions";
import { TREASURY_CATEGORIES } from "../forms/AssetLiabilityForm";

type Account = {
  id: string;
  name: string;
  category: string;
  owner?: string;
  is_liability: boolean;
  current_balance: number;
  last_updated: string;
};

export function AssetTable({ accounts }: { accounts: Account[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editValue, setEditValue] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleEditClick = (asset: Account) => {
    setEditingId(asset.id);
    setEditName(asset.name);
    setEditCategory(asset.category);
    setEditOwner(asset.owner || "Keluarga");
    setEditValue(asset.current_balance.toString());
  };

  const handleSaveEdit = async (id: string) => {
    setLoadingId(id);
    await updateAccountDetails(id, {
      name: editName,
      category: editCategory,
      owner: editOwner,
      current_balance: parseFloat(editValue)
    });
    setEditingId(null);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus akun ini dari database?")) {
      setLoadingId(id);
      await deleteAccount(id);
      setLoadingId(null);
    }
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 shadow-2xl mt-8 text-center text-zinc-500">
        Belum ada akun atau aset yang dicatat.
      </div>
    );
  }

  const getGrouping = (catId: string) => {
    return TREASURY_CATEGORIES.find(c => c.id === catId || c.name === catId)?.grouping || "Lain-lain";
  }

  const assets = accounts.filter(a => !a.is_liability);
  const liabilities = accounts.filter(a => a.is_liability);

  const groupedAssets = assets.reduce((acc, asset) => {
    const group = getGrouping(asset.category);
    if (!acc[group]) acc[group] = [];
    acc[group].push(asset);
    return acc;
  }, {} as Record<string, Account[]>);

  const groupedLiabilities = liabilities.reduce((acc, liability) => {
    const group = getGrouping(liability.category);
    if (!acc[group]) acc[group] = [];
    acc[group].push(liability);
    return acc;
  }, {} as Record<string, Account[]>);

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_balance), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.current_balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  const renderRow = (asset: Account, isMinor: boolean = false) => {
    const isEditing = editingId === asset.id;
    const isLoading = loadingId === asset.id;

    return (
      <tr key={asset.id} className={`hover:bg-white/[0.02] transition-colors group ${isMinor ? 'bg-black/20' : ''}`}>
        <td className={`py-4 px-4 ${isMinor ? 'pl-8' : ''}`}>
          <div className="flex items-center gap-2">
            {isMinor && <CornerDownRight size={14} className="text-zinc-600 shrink-0" />}
            {isEditing ? (
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full min-w-[150px] bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                placeholder="Nama Akun"
              />
            ) : (
              <span className={`text-sm tracking-wide font-medium ${isMinor ? 'text-zinc-300' : 'text-white'}`}>{asset.name}</span>
            )}
          </div>
        </td>
        <td className="py-4 px-4">
          {isEditing ? (
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full min-w-[150px] bg-black/40 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Pilih Kategori</option>
              {TREASURY_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-zinc-400">{asset.category}</span>
          )}
        </td>
        <td className="py-4 px-4">
          {isEditing ? (
            <select
              value={editOwner}
              onChange={(e) => setEditOwner(e.target.value)}
              className="w-full min-w-[100px] bg-black/40 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Keluarga">Keluarga</option>
              <option value="Vian">Vian</option>
              <option value="Marshella">Marshella</option>
            </select>
          ) : (
             <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-zinc-300 px-2 py-1 rounded-md border border-white/10">
              {asset.owner || "Keluarga"}
            </span>
          )}
        </td>
        <td className="py-4 px-4 text-right">
          {isEditing ? (
            <input 
              type="number" 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full min-w-[120px] bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-right font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          ) : (
            <span className={`text-sm font-mono ${isMinor ? 'text-zinc-300' : 'text-white'}`}>Rp {Number(asset.current_balance).toLocaleString('id-ID')}</span>
          )}
        </td>
        <td className="py-4 px-4 text-right">
          <span className="inline-flex items-center gap-1.5 justify-end text-xs text-zinc-500">
            <Clock size={12} className="text-zinc-600" />
            {new Date(asset.last_updated).toLocaleDateString("id-ID", { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </td>
        <td className="py-4 px-4 text-center">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-zinc-500 inline-block" />
          ) : isEditing ? (
            <div className="inline-flex gap-1">
              <button onClick={() => handleSaveEdit(asset.id)} className="text-emerald-500 hover:text-emerald-400 p-1.5 rounded-md hover:bg-emerald-400/10" title="Simpan">
                <Check size={16} />
              </button>
              <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-400/10" title="Batal">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditClick(asset)} className="text-zinc-500 hover:text-blue-400 p-1.5 rounded-md hover:bg-blue-400/10" title="Edit">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(asset.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-400/10" title="Hapus">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden mt-8">
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Neraca Keuangan (Balance Sheet)</h2>
          <p className="text-zinc-400 text-sm mt-1">Status posisi keuangan komprehensif saat ini</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider w-1/4">Akun / Aset</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider w-1/4">Kategori</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider w-[12%]">Pemilik</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right w-1/5">Nilai / Saldo</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right w-[15%]">Terakhir Update</th>
              <th className="pb-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-center w-[8%]">Aksi</th>
            </tr>
          </thead>
          
          {/* Aset Section */}
          <tbody className="divide-y divide-white/5">
            <tr className="bg-black/20">
              <td colSpan={6} className="py-3 px-4 font-semibold text-blue-400 tracking-wide">
                DAFTAR ASET (ASSETS)
              </td>
            </tr>
            {Object.entries(groupedAssets).map(([groupName, items]) => {
              const majorItems = items.filter(a => Number(a.current_balance) >= 1000000);
              const minorItems = items.filter(a => Number(a.current_balance) < 1000000);
              const minorSum = minorItems.reduce((sum, a) => sum + Number(a.current_balance), 0);
              const isExpanded = expandedGroups[`asset-${groupName}`];

              return (
                <Fragment key={`asset-${groupName}`}>
                  <tr>
                    <td colSpan={6} className="py-2 px-4 pt-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest bg-black/10">
                      {groupName}
                    </td>
                  </tr>
                  
                  {majorItems.map(asset => renderRow(asset, false))}
                  
                  {minorItems.length > 0 && (
                    <>
                      <tr 
                        onClick={() => toggleGroup(`asset-${groupName}`)}
                        className="cursor-pointer hover:bg-white/[0.05] transition-colors border-t border-dashed border-white/10 group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium group-hover:text-blue-400 transition-colors">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            Akun Kecil ({minorItems.length})
                          </div>
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-xs text-zinc-600 italic">
                          &lt; Rp 1 Jt
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-zinc-400 font-mono">Rp {minorSum.toLocaleString('id-ID')}</span>
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      
                      {isExpanded && minorItems.map(asset => renderRow(asset, true))}
                    </>
                  )}
                </Fragment>
              );
            })}
            <tr className="bg-blue-500/5 border-t border-blue-500/20">
              <td colSpan={3} className="py-4 px-4 font-semibold text-white">TOTAL ASET</td>
              <td colSpan={3} className="py-4 px-4 text-right font-mono font-bold text-blue-400 text-lg">
                Rp {totalAssets.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>

          {/* Liabilitas Section */}
          <tbody className="divide-y divide-white/5 border-t-8 border-transparent">
            <tr className="bg-black/20">
              <td colSpan={6} className="py-3 px-4 font-semibold text-red-400 tracking-wide">
                DAFTAR LIABILITAS (LIABILITIES)
              </td>
            </tr>
            {Object.entries(groupedLiabilities).map(([groupName, items]) => {
              const majorItems = items.filter(a => Number(a.current_balance) >= 1000000);
              const minorItems = items.filter(a => Number(a.current_balance) < 1000000);
              const minorSum = minorItems.reduce((sum, a) => sum + Number(a.current_balance), 0);
              const isExpanded = expandedGroups[`liab-${groupName}`];

              return (
                <Fragment key={`liab-${groupName}`}>
                  <tr>
                    <td colSpan={6} className="py-2 px-4 pt-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest bg-black/10">
                      {groupName}
                    </td>
                  </tr>
                  
                  {majorItems.map(liability => renderRow(liability, false))}
                  
                  {minorItems.length > 0 && (
                    <>
                      <tr 
                        onClick={() => toggleGroup(`liab-${groupName}`)}
                        className="cursor-pointer hover:bg-white/[0.05] transition-colors border-t border-dashed border-white/10 group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium group-hover:text-red-400 transition-colors">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            Liabilitas Kecil ({minorItems.length})
                          </div>
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-xs text-zinc-600 italic">
                          &lt; Rp 1 Jt
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-zinc-400 font-mono">Rp {minorSum.toLocaleString('id-ID')}</span>
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      
                      {isExpanded && minorItems.map(liability => renderRow(liability, true))}
                    </>
                  )}
                </Fragment>
              );
            })}
            {liabilities.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-zinc-600 text-sm italic">
                  Tidak ada liabilitas yang dicatat. Hebat! 🎉
                </td>
              </tr>
            )}
            <tr className="bg-red-500/5 border-t border-red-500/20">
              <td colSpan={3} className="py-4 px-4 font-semibold text-white">TOTAL LIABILITAS</td>
              <td colSpan={3} className="py-4 px-4 text-right font-mono font-bold text-red-400 text-lg">
                Rp {totalLiabilities.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>

          {/* Ekuitas (Net Worth) Section */}
          <tbody className="border-t-4 border-white/10">
            <tr className="bg-emerald-500/10">
              <td colSpan={3} className="py-6 px-4 font-bold text-white text-lg tracking-tight">EKUITAS (KEKAYAAN BERSIH)</td>
              <td colSpan={3} className="py-6 px-4 text-right font-mono font-bold text-emerald-400 text-2xl">
                Rp {netWorth.toLocaleString('id-ID')}
              </td>
            </tr>
            <tr className="bg-black/30">
              <td colSpan={3} className="py-3 px-4 text-xs font-medium text-zinc-500">TOTAL LIABILITAS + EKUITAS</td>
              <td colSpan={3} className="py-3 px-4 text-right font-mono font-semibold text-zinc-400 text-sm">
                Rp {(totalLiabilities + netWorth).toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
