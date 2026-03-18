"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardTabsProps = {
  treasuryTab: ReactNode;
  ledgerTab: ReactNode;
  clearinghouseTab: ReactNode;
  goalsTab: ReactNode;
  automationTab: ReactNode;
};

export function DashboardTabs({ treasuryTab, ledgerTab, clearinghouseTab, goalsTab, automationTab }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"treasury" | "ledger" | "goals" | "automation" | "clearinghouse">("treasury");

  return (
    <div className="w-full">
      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 mb-8 sticky top-0 bg-black/80 backdrop-blur-xl z-20 pb-1 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <button
          onClick={() => setActiveTab("treasury")}
          className={cn(
            "px-4 md:px-6 py-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
            activeTab === "treasury" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Treasury
          {activeTab === "treasury" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "px-4 md:px-6 py-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
            activeTab === "ledger" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Ledger
          {activeTab === "ledger" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("clearinghouse")}
          className={cn(
            "px-4 md:px-6 py-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
            activeTab === "clearinghouse" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Clearinghouse
          {activeTab === "clearinghouse" && (
             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={cn(
            "px-4 md:px-6 py-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
            activeTab === "goals" ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Goals
          {activeTab === "goals" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("automation")}
          className={cn(
            "px-4 md:px-6 py-4 text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
            activeTab === "automation" ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Automation
          {activeTab === "automation" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-t-full shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "treasury" && treasuryTab}
        {activeTab === "ledger" && ledgerTab}
        {activeTab === "goals" && goalsTab}
        {activeTab === "automation" && automationTab}
        {activeTab === "clearinghouse" && clearinghouseTab}
      </div>
    </div>
  );
}
