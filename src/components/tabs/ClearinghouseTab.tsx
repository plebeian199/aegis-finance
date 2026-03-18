import { ReconciliationDashboard } from "@/components/widgets/ReconciliationDashboard";

export function ClearinghouseTab({ accounts, latestSnapshot, transactions }: { accounts: any[], latestSnapshot: any, transactions: any[] }) {

  return (
    <div className="animate-in fade-in duration-500 pt-8 max-w-5xl mx-auto">
      <ReconciliationDashboard 
        latestSnapshot={latestSnapshot} 
        transactions={transactions} 
        accounts={accounts} 
      />
    </div>
  );
}
