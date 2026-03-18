"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Snapshot = {
  snapshot_date: string;
  net_worth: number;
};

export function NetWorthChart({ data }: { data: Snapshot[] }) {
  
  // Format the data for the chart
  const chartData = data?.map(d => {
    const date = new Date(d.snapshot_date);
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      netWorth: Number(d.net_worth)
    };
  }) || [];

  // Calculate MoM and YoY if we have enough data
  let momGrowth = 0;
  let yoyGrowth = 0;
  
  if (chartData.length >= 2) {
    const latest = chartData[chartData.length - 1].netWorth;
    const previous = chartData[chartData.length - 2].netWorth;
    momGrowth = ((latest - previous) / previous) * 100;
  }
  
  if (chartData.length >= 12) {
    const latest = chartData[chartData.length - 1].netWorth;
    const lastYear = chartData[chartData.length - 12].netWorth;
    yoyGrowth = ((latest - lastYear) / lastYear) * 100;
  }

  return (
    <div className="w-full h-[400px] bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Pertumbuhan MoM & YoY</h2>
          <div className="text-white text-3xl font-light tracking-tight mt-1 flex items-baseline gap-4">
            {chartData.length > 0 ? (
               <>
                 <span className={momGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}>
                   {momGrowth > 0 ? "+" : ""}{momGrowth.toFixed(1)}% <span className="text-sm bg-zinc-800/80 px-2 py-0.5 rounded-full font-medium text-zinc-300">MoM</span>
                 </span>
                 <span className={yoyGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}>
                   {yoyGrowth > 0 ? "+" : ""}{yoyGrowth.toFixed(1)}% <span className="text-sm bg-zinc-800/80 px-2 py-0.5 rounded-full font-medium text-zinc-300">YoY</span>
                 </span>
               </>
            ) : (
               <span className="text-zinc-500 text-lg">Belum ada data historis</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(1)}M`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Kekayaan Bersih']}
            />
            <Area 
              type="monotone" 
              dataKey="netWorth" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorNetWorth)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
