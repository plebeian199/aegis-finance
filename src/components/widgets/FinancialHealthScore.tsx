"use client";

import { cn } from "@/lib/utils";

type HealthScoreProps = {
  savingsRate: number;        // percentage
  emergencyMonths: number;    // months of runway
  debtToAsset: number;        // percentage  
  debtToIncome: number;       // percentage
  goalProgress: number;       // percentage (avg)
};

function scoreMetric(value: number, greenMin: number, yellowMin: number, inverse: boolean = false): number {
  if (inverse) {
    if (value <= greenMin) return 100;
    if (value <= yellowMin) return 60;
    return 20;
  }
  if (value >= greenMin) return 100;
  if (value >= yellowMin) return 60;
  return 20;
}

export function FinancialHealthScore({ savingsRate, emergencyMonths, debtToAsset, debtToIncome, goalProgress }: HealthScoreProps) {
  const scores = [
    { label: "Savings Rate", value: savingsRate, score: scoreMetric(savingsRate, 30, 10), format: `${savingsRate.toFixed(0)}%`, weight: 0.25 },
    { label: "Dana Darurat", value: emergencyMonths, score: scoreMetric(emergencyMonths, 6, 3), format: `${emergencyMonths.toFixed(1)} bln`, weight: 0.25 },
    { label: "Debt / Asset", value: debtToAsset, score: scoreMetric(debtToAsset, 20, 50, true), format: `${debtToAsset.toFixed(0)}%`, weight: 0.20 },
    { label: "Debt / Income", value: debtToIncome, score: scoreMetric(debtToIncome, 36, 43, true), format: `${debtToIncome.toFixed(0)}%`, weight: 0.15 },
    { label: "Progress Goals", value: goalProgress, score: scoreMetric(goalProgress, 70, 30), format: `${goalProgress.toFixed(0)}%`, weight: 0.15 },
  ];

  const compositeScore = Math.round(scores.reduce((sum, s) => sum + s.score * s.weight, 0));

  const getColor = (score: number) => {
    if (score >= 70) return { ring: "text-emerald-400", bg: "from-emerald-500/20", label: "Sehat 💪" };
    if (score >= 40) return { ring: "text-amber-400", bg: "from-amber-500/20", label: "Waspada ⚠️" };
    return { ring: "text-rose-400", bg: "from-rose-500/20", label: "Kritis 🚨" };
  };

  const { ring, bg, label } = getColor(compositeScore);

  // SVG ring math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (compositeScore / 100) * circumference;

  return (
    <div className={cn("w-full bg-gradient-to-br to-transparent rounded-3xl border border-white/5 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden", bg)}>
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="flex items-center gap-6">
        {/* Ring Gauge */}
        <div className="relative shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
            <circle 
              cx="64" cy="64" r={radius} fill="none" 
              stroke="currentColor" strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(ring, "transition-all duration-1000 ease-out")}
              style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-mono font-bold", ring)}>{compositeScore}</span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium mb-1">Skor Kesehatan Keuangan</h3>
          <p className={cn("text-xs font-medium mb-4", ring)}>{label}</p>
          
          <div className="space-y-2">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-500 truncate">{s.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-700", s.score >= 70 ? "bg-emerald-500" : s.score >= 40 ? "bg-amber-400" : "bg-rose-500")}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">{s.format}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
