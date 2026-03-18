import { AccountToggle } from "@/components/navigation/AccountToggle";
import { DashboardTabs } from "@/components/navigation/DashboardTabs";

import { getAccounts, getMonthlySnapshots, getTransactionsSince, getCashFlowCategories, getTransactions, getLatestSnapshot, autoGenerateMissingSnapshots, autoExecuteRecurringTransactions, getGoals, getRecurringTransactions } from "@/app/actions";
import { calculateNetWorth } from "@/lib/finance";

import { TreasuryTab } from "@/components/tabs/TreasuryTab";
import { LedgerTab } from "@/components/tabs/LedgerTab";
import { ClearinghouseTab } from "@/components/tabs/ClearinghouseTab";
import { GoalsTab } from "@/components/tabs/GoalsTab";
import { AutomationTab } from "@/components/tabs/AutomationTab";

export default async function Home() {
  await autoGenerateMissingSnapshots();
  await autoExecuteRecurringTransactions();
  
  const accountsData = await getAccounts() || [];
  const snapshotsData = await getMonthlySnapshots() || [];
  const goalsData = await getGoals() || [];
  const recurringData = await getRecurringTransactions() || [];
  
  // Burn Rate Calculation (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTransactions = await getTransactionsSince(thirtyDaysAgo.toISOString().split('T')[0]);
  
  let burnRate = 0;
  recentTransactions.forEach(t => {
    // Sum essential expenses
    if (t.transaction_type === "expense" && t.category?.is_essential) {
      burnRate += Number(t.amount);
    }
  });

  // Ledger Data
  const categoriesData = await getCashFlowCategories() || [];
  const allTransactions = await getTransactions() || [];

  // Clearinghouse Data
  const latestSnapshot = await getLatestSnapshot();
  const snapshotDate = latestSnapshot ? latestSnapshot.snapshot_date : undefined;
  const transactionsSinceSnapshot = await getTransactionsSince(snapshotDate) || [];

  // Basic cast mapping for calculating Net Worth
  const assetsList = accountsData.filter(a => !a.is_liability).map(a => ({
    id: a.id, name: a.name, category: a.category, current_balance: Number(a.current_balance)
  }));
  const liabilitiesList = accountsData.filter(a => a.is_liability).map(a => ({
    id: a.id, name: a.name, category: a.category, current_balance: Number(a.current_balance)
  }));
  
  const currentNetWorth = calculateNetWorth(assetsList, liabilitiesList);

  // Bucketing Logic for Quick Stats
  let liquidAssets = 0;
  let marketableAssets = 0;
  let illiquidAssets = 0;
  let totalLiabilitiesSum = 0;

  accountsData.forEach(a => {
    const bal = Number(a.current_balance) || 0;
    if (a.is_liability) {
      totalLiabilitiesSum += bal;
    } else {
      const cat = a.category.toLowerCase();
      // Broad matching covering original and supreme list
      if (cat.includes("kas") || cat.includes("tabungan") || cat.includes("deposito") || cat.includes("e-wallet") || cat.includes("valuta") || cat.includes("tier 1")) {
        liquidAssets += bal;
      } else if (cat.includes("reksadana") || cat.includes("saham") || cat.includes("sbn") || cat.includes("obligasi") || cat.includes("kripto") || cat.includes("p2p") || cat.includes("tier 2")) {
        marketableAssets += bal;
      } else {
        illiquidAssets += bal;
      }
    }
  });

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Wabi Sabi</span>
              Finance
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Because We Actually Care ❤️</p>
          </div>
          
          <AccountToggle />
        </header>

        {/* Unified Tab Component */}
        <DashboardTabs 
           treasuryTab={
             <TreasuryTab 
               currentNetWorth={currentNetWorth}
               snapshotsData={snapshotsData}
               liquidAssets={liquidAssets}
               marketableAssets={marketableAssets}
               illiquidAssets={illiquidAssets}
               totalLiabilitiesSum={totalLiabilitiesSum}
               accountsData={accountsData}
               burnRate={burnRate}
             />
           }
           ledgerTab={
             <LedgerTab 
               accounts={accountsData} 
               categories={categoriesData} 
               transactions={allTransactions} 
             />
           }
           clearinghouseTab={
             <ClearinghouseTab 
               accounts={accountsData} 
               latestSnapshot={latestSnapshot} 
               transactions={transactionsSinceSnapshot} 
             />
           }
           goalsTab={<GoalsTab goals={goalsData} accounts={accountsData} />}
           automationTab={<AutomationTab recurring={recurringData} accounts={accountsData} categories={categoriesData} />}
        />
        
      </div>
    </main>
  );
}
