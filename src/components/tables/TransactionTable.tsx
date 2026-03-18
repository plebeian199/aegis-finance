"use client";

import { useState, useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Repeat, Edit2, Trash2, Check, X, Loader2, RefreshCw, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteTransaction, updateTransactionDetails } from "@/app/actions";

const ROWS_PER_PAGE = 20;

export function TransactionTable({ transactions, accounts = [], categories = [] }: { transactions: any[], accounts?: any[], categories?: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editDate, setEditDate] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCatId, setEditCatId] = useState("");
  const [editSourceId, setEditSourceId] = useState("");
  const [editDestId, setEditDestId] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const handleEditClick = (t: any) => {
    setEditingId(t.id);
    setEditDate(t.transaction_date);
    setEditDesc(t.description);
    setEditAmount(t.amount.toString());
    setEditCatId(t.category_id || "");
    setEditSourceId(t.source_account_id || "");
    setEditDestId(t.destination_account_id || "");
  };

  const handleSaveEdit = async (t: any) => {
    if (!editAmount || isNaN(Number(editAmount))) return;
    setLoadingId(t.id);
    await updateTransactionDetails(t.id, {
      transaction_date: editDate,
      amount: parseFloat(editAmount),
      description: editDesc,
      category_id: editCatId || null,
      source_account_id: editSourceId || null,
      destination_account_id: editDestId || null
    });
    setEditingId(null);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus transaksi ini?")) {
      setLoadingId(id);
      await deleteTransaction(id);
      setLoadingId(null);
    }
  };

  // Filtered + Searched data
  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (filterType !== "all") {
      list = list.filter(t => t.transaction_type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.description || "").toLowerCase().includes(q) ||
        (t.category?.name || "").toLowerCase().includes(q) ||
        (t.source?.name || "").toLowerCase().includes(q) ||
        (t.destination?.name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / ROWS_PER_PAGE);
  const paginatedData = filteredTransactions.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Reset page when filter changes
  const handleFilterChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ["Tanggal", "Jenis", "Kategori", "Deskripsi", "Nominal", "Akun Asal", "Akun Tujuan"];
    const rows = filteredTransactions.map(t => {
      const date = t.transaction_date;
      const type = t.transaction_type;
      const category = t.category?.name || "Transfer/Uncategorized";
      const desc = `"${(t.description || "").replace(/"/g, '""')}"`;
      const amount = t.amount;
      const source = t.source?.name || "";
      const dest = t.destination?.name || "";
      return [date, type, category, desc, amount, source, dest].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 p-8 text-center">
        <p className="text-zinc-500">Belum ada transaksi tercatat.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-white text-xl font-medium tracking-tight">Riwayat Transaksi</h2>
        <button 
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-blue-500/20"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          {[
            { val: "all", label: "Semua" },
            { val: "expense", label: "Keluar" },
            { val: "income", label: "Masuk" },
            { val: "transfer", label: "Transfer" },
          ].map(f => (
            <button 
              key={f.val} 
              onClick={() => handleFilterChange(f.val)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${filterType === f.val ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <th className="pb-4 pt-2 px-4 font-medium w-[15%]">Tanggal</th>
              <th className="pb-4 pt-2 px-4 font-medium w-[25%]">Deskripsi</th>
              <th className="pb-4 pt-2 px-4 font-medium w-[20%]">Kategori</th>
              <th className="pb-4 pt-2 px-4 font-medium w-[15%]">Rekening</th>
              <th className="pb-4 pt-2 px-4 font-medium text-right w-[15%]">Nominal (Rp)</th>
              <th className="pb-4 pt-2 px-4 font-medium text-center w-[10%]">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {paginatedData.map((t) => {
              const isIncome = t.transaction_type === "income";
              const isExpense = t.transaction_type === "expense";
              const isTransfer = t.transaction_type === "transfer";
              const isEditing = editingId === t.id;
              
              return (
                <tr key={t.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${t.is_locked ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-4 text-zinc-400 whitespace-nowrap">
                    {isEditing ? (
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" style={{ colorScheme: 'dark' }} />
                    ) : (
                      new Date(t.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                    )}
                  </td>
                  <td className="py-4 px-4 w-1/3">
                    <div className="flex items-center gap-3">
                      <div className={`shrink-0 p-2 rounded-lg ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : isExpense ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {isIncome && <ArrowDownRight size={14} />}
                        {isExpense && <ArrowUpRight size={14} />}
                        {isTransfer && <Repeat size={14} />}
                      </div>
                      {isEditing ? (
                        <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-medium truncate">{t.description}</span>
                          {t.is_recurring && (
                            <span className="flex items-center gap-1 text-[10px] text-blue-400 mt-0.5">
                              <RefreshCw size={10} /> Rutin
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {isEditing ? (
                      <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">(Tanpa Kategori)</option>
                        {categories.filter(c => isExpense ? c.type === 'expense' : c.type === 'income').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : t.category ? (
                      <div>
                        <div className="text-zinc-300">{t.category.name}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{t.category.grouping}</div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">Transfer Internal</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-zinc-400 text-xs">
                    {isEditing ? (
                      <div className="space-y-1">
                        {!isIncome && (
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-600 w-8">Dari:</span>
                            <select value={editSourceId} onChange={e => setEditSourceId(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-md px-1 py-1 text-white text-[10px] focus:outline-none">
                              <option value="">(Pilih Akun)</option>
                              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </div>
                        )}
                        {!isExpense && (
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-600 w-8">Ke:</span>
                            <select value={editDestId} onChange={e => setEditDestId(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-md px-1 py-1 text-white text-[10px] focus:outline-none">
                              <option value="">(Pilih Akun)</option>
                              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {isIncome && <span className="text-zinc-300">Ke: {t.destination?.name}</span>}
                        {isExpense && <span className="text-zinc-300">Dari: {t.source?.name}</span>}
                        {isTransfer && (
                          <>
                            <span className="text-zinc-500 truncate">Dari: {t.source?.name}</span>
                            <span className="text-zinc-300 truncate">Ke: {t.destination?.name}</span>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={`py-4 px-4 text-right font-mono font-medium ${isIncome ? 'text-emerald-400' : isExpense ? 'text-white' : 'text-blue-400'}`}>
                    {isEditing ? (
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-32 bg-black/40 border border-white/20 rounded-md px-2 py-1 text-white text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    ) : (
                      <>
                        {isIncome ? '+' : isExpense ? '-' : ''}Rp {Number(t.amount).toLocaleString('id-ID')}
                      </>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center w-24 relative">
                    {loadingId === t.id ? (
                      <Loader2 size={16} className="animate-spin text-zinc-500 inline-block" />
                    ) : isEditing ? (
                      <div className="inline-flex gap-1 border border-white/5 rounded-md p-0.5 bg-black/20">
                        <button onClick={() => handleSaveEdit(t)} className="text-emerald-500 hover:text-emerald-400 p-1.5 rounded hover:bg-emerald-400/10 transition-colors" title="Simpan">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-400/10 transition-colors" title="Batal">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity border border-white/5 rounded-md p-0.5 bg-black/20">
                        {!t.is_locked ? (
                          <>
                            <button onClick={() => handleEditClick(t)} className="text-zinc-500 hover:text-blue-400 p-1.5 rounded hover:bg-blue-400/10 transition-colors" title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-400/10 transition-colors" title="Hapus">
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-medium px-2 py-1">LOCKED</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <p className="text-xs text-zinc-500">{filteredTransactions.length} transaksi • Halaman {currentPage}/{totalPages}</p>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) { page = i + 1; }
              else if (currentPage <= 3) { page = i + 1; }
              else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
              else { page = currentPage - 2 + i; }
              return (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${currentPage === page ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                  {page}
                </button>
              );
            })}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
