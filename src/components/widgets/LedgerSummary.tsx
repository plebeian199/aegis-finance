"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Filter, ChevronDown, Check, X, Edit2, Loader2, Target, PieChart as PieChartIcon, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { updateCategoryLimit } from "@/app/actions";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4', '#14b8a6', '#f97316'];

type LedgerSummaryProps = {
  transactions: any[];
  categories?: any[];
};

export function LedgerSummary({ transactions, categories = [] }: LedgerSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      if (!t.transaction_date) return;
      const d = new Date(t.transaction_date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    const sorted = Array.from(months).sort().reverse();
    const current = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    if (!sorted.includes(current)) sorted.unshift(current);
    return sorted;
  }, [transactions]);

  const [year, month] = selectedMonth.split('-');

  const { income, expense, recurringExpense } = useMemo(() => {
    let inc = 0; let exp = 0; let recExp = 0;
    transactions.forEach(t => {
      if (!t.transaction_date) return;
      const d = new Date(t.transaction_date);
      if (d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month)) {
        if (t.transaction_type === 'income') inc += Number(t.amount);
        else if (t.transaction_type === 'expense') {
          exp += Number(t.amount);
          if (t.is_recurring) recExp += Number(t.amount);
        }
      }
    });
    return { income: inc, expense: exp, recurringExpense: recExp };
  }, [transactions, selectedMonth, year, month]);

  const netFlow = income - expense;
  const isPositiveFlow = netFlow >= 0;
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Chart Data Preparation
  const categoryPieData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      if (!t.transaction_date) return;
      const d = new Date(t.transaction_date);
      if (d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month)) {
        if (t.transaction_type === 'expense' && t.category) {
          map.set(t.category.name, (map.get(t.category.name) || 0) + Number(t.amount));
        }
      }
    });
    return Array.from(map.entries())
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedMonth, year, month]);

  const barData = [
    { name: 'Pemasukan', Amount: income, fill: '#10b981' },
    { name: 'Pengeluaran', Amount: expense, fill: '#ef4444' }
  ];

  // Multi-month trend data (last 6 months)
  const trendData = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short' });
      months.push({ key, label, income: 0, expense: 0 });
    }
    transactions.forEach(t => {
      if (!t.transaction_date) return;
      const d = new Date(t.transaction_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = months.find(m => m.key === key);
      if (found) {
        if (t.transaction_type === 'income') found.income += Number(t.amount);
        else if (t.transaction_type === 'expense') found.expense += Number(t.amount);
      }
    });
    return months;
  }, [transactions]);

  const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 border border-white/10 rounded-lg shadow-xl backdrop-blur-xl">
          <p className="text-zinc-300 text-xs mb-1">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-white font-mono font-medium">{formatRp(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Budget Tracker
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
  
  const budgetUsage = useMemo(() => {
    const usage = new Map<string, number>();
    transactions.forEach(t => {
      if (!t.transaction_date) return;
      const d = new Date(t.transaction_date);
      if (d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month)) {
        if (t.transaction_type === 'expense' && t.category_id) {
          usage.set(t.category_id, (usage.get(t.category_id) || 0) + Number(t.amount));
        }
      }
    });
    return usage;
  }, [transactions, selectedMonth, year, month]);

  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState("");
  const [isSavingLimit, setIsSavingLimit] = useState<string | null>(null);

  const handleEditLimitClick = (cat: any) => {
    setEditingLimitId(cat.id);
    setEditLimitVal(String(cat.monthly_limit || 0));
  };

  const handleSaveLimit = async (catId: string) => {
    setIsSavingLimit(catId);
    await updateCategoryLimit(catId, parseFloat(editLimitVal) || 0);
    setEditingLimitId(null);
    setIsSavingLimit(null);
  };

  return (
    <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 p-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Header Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Ringkasan Arus Kas</h2>
          <p className="text-sm text-zinc-400 mt-1">Analytics operasional pendapatan dan beban bulanan</p>
        </div>
        
        <div className="relative inline-block w-full sm:w-56">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none shadow-inner"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-black/20 rounded-2xl p-5 border border-emerald-500/10 relative overflow-hidden group">
          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
            <ArrowDownRight size={64} className="text-emerald-500" />
          </div>
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">Pemasukan</p>
          <p className="text-2xl font-mono text-emerald-400">{formatRp(income)}</p>
        </div>

        <div className="bg-black/20 rounded-2xl p-5 border border-rose-500/10 relative overflow-hidden group">
          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
            <ArrowUpRight size={64} className="text-rose-500" />
          </div>
          <p className="text-xs font-semibold text-rose-400/80 mb-2 uppercase tracking-wider">Pengeluaran</p>
          <p className="text-2xl font-mono text-white">{formatRp(expense)}</p>
        </div>

        <div className="bg-black/20 rounded-2xl p-5 border border-blue-500/10 relative overflow-hidden group">
          <p className="text-xs font-semibold text-blue-400/80 mb-2 uppercase tracking-wider">Pengeluaran Rutin</p>
          <p className="text-2xl font-mono text-blue-400">{formatRp(recurringExpense)}</p>
          <div className="mt-2 w-full bg-black/40 rounded-full h-1.5">
             <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${expense > 0 ? Math.min((recurringExpense / expense) * 100, 100) : 0}%` }}></div>
          </div>
        </div>

        <div className={cn("rounded-2xl p-5 border relative overflow-hidden group", isPositiveFlow ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20")}>
          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
            {isPositiveFlow ? <TrendingUp size={64} className="text-emerald-500" /> : <TrendingDown size={64} className="text-rose-500" />}
          </div>
          <p className={cn("text-xs font-semibold mb-2 uppercase tracking-wider", isPositiveFlow ? "text-emerald-400/80" : "text-rose-400/80")}>Net Cash Flow</p>
          <p className={cn("text-2xl font-mono", isPositiveFlow ? "text-emerald-400" : "text-rose-400")}>
            {isPositiveFlow ? '+' : '-'}{formatRp(Math.abs(netFlow))}
          </p>
        </div>

        <div className="bg-black/20 rounded-2xl p-5 border border-indigo-500/10 relative overflow-hidden group">
          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
            <Percent size={64} className="text-indigo-500" />
          </div>
          <p className="text-xs font-semibold text-indigo-400/80 mb-2 uppercase tracking-wider">Savings Rate</p>
          <p className={cn("text-2xl font-mono", savingsRate >= 30 ? "text-emerald-400" : savingsRate >= 10 ? "text-amber-400" : "text-rose-400")}>
            {savingsRate.toFixed(1)}%
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">Target: ≥30%</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Income vs Expense Bar Chart */}
        <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
          <h3 className="text-zinc-300 text-sm font-medium mb-6 flex items-center gap-2">
            <Filter size={16} /> Perbandingan Arus Kas
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis hide domain={[0, 'dataMax + 1000000']} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="Amount" radius={[6, 6, 6, 6]} barSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/2">
            <h3 className="text-zinc-300 text-sm font-medium mb-2 flex items-center gap-2">
              <PieChartIcon size={16} /> Komposisi Pengeluaran
            </h3>
            {categoryPieData.length === 0 ? (
              <div className="text-zinc-600 text-xs italic mt-10">Belum ada pengeluaran di bulan ini.</div>
            ) : (
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col justify-center h-[200px] overflow-y-auto pr-2 custom-scrollbar">
             {categoryPieData.map((data, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }}></div>
                    <span className="text-xs text-zinc-400 truncate" title={data.name}>{data.name}</span>
                  </div>
                  <span className="font-mono text-xs text-white shrink-0">{(data.value / expense * 100).toFixed(1)}%</span>
               </div>
             ))}
          </div>
        </div>

      </div>

      {/* Multi-Month Trend Chart */}
      <div className="bg-black/20 rounded-3xl p-6 border border-white/5 mb-10">
        <h3 className="text-zinc-300 text-sm font-medium mb-6 flex items-center gap-2">
          <TrendingUp size={16} /> Tren Arus Kas 6 Bulan
        </h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                formatter={(value: any, name: any) => [formatRp(value), String(name) === 'income' ? 'Pemasukan' : 'Pengeluaran']}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Progress Bars */}
      <div className="bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <Target className="text-blue-500" size={20} />
          <h3 className="text-white text-lg font-medium">Batas Anggaran Bulanan (Budgeting)</h3>
        </div>
        
        {expenseCategories.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">Belum ada kategori pengeluaran terdaftar.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
            {expenseCategories.map(cat => {
              const spent = budgetUsage.get(cat.id) || 0;
              const limit = Number(cat.monthly_limit || 0);
              const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              
              const isOver = limit > 0 && spent > limit;
              const isWarning = limit > 0 && percentage > 80 && !isOver;
              
              const isEditing = editingLimitId === cat.id;
              const isLoading = isSavingLimit === cat.id;

              // Only show strictly configured budgets OR categories that have spending this month
              if (limit === 0 && spent === 0) return null;

              return (
                <div key={cat.id} className="relative group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-zinc-300">{cat.name}</span>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={editLimitVal}
                          onChange={e => setEditLimitVal(e.target.value)}
                          className="w-28 bg-black/60 border border-white/20 rounded-md px-2 py-1 text-white text-right text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Limit Rp"
                          autoFocus
                        />
                        {isLoading ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : (
                          <>
                            <button onClick={() => handleSaveLimit(cat.id)} className="text-emerald-500 hover:text-emerald-400" title="Simpan"><Check size={14} /></button>
                            <button onClick={() => setEditingLimitId(null)} className="text-zinc-500 hover:text-rose-400" title="Batal"><X size={14} /></button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {limit > 0 ? (
                          <span className="text-xs font-mono text-zinc-500">
                            <span className={cn(isOver ? "text-rose-400" : isWarning ? "text-amber-400" : "text-white")}>{formatRp(spent)}</span> / {formatRp(limit)}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-zinc-400">{formatRp(spent)}</span>
                        )}
                        <button onClick={() => handleEditLimitClick(cat)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-blue-400 p-1">
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className={cn("w-full h-2 rounded-full overflow-hidden", limit > 0 ? "bg-black/60" : "bg-transparent")}>
                    {limit > 0 && (
                      <div 
                        className={cn("h-full transition-all duration-1000", isOver ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" : isWarning ? "bg-amber-400" : "bg-emerald-500")} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    )}
                  </div>
                  {isOver && <p className="text-[10px] text-rose-500 mt-1 absolute -bottom-4 right-0">Melebihi budget!</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
