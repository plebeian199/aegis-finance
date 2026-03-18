import { TransactionForm } from "@/components/forms/TransactionForm";
import { TransactionTable } from "@/components/tables/TransactionTable";
import { LedgerSummary } from "@/components/widgets/LedgerSummary";

export function LedgerTab({ accounts, categories, transactions, liquidAssets = 0 }: { accounts: any[], categories: any[], transactions: any[], liquidAssets?: number }) {

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <LedgerSummary transactions={transactions} categories={categories} liquidAssets={liquidAssets} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TransactionForm accounts={accounts} categories={categories} />
        </div>
        <div className="lg:col-span-2">
          <TransactionTable transactions={transactions} accounts={accounts} categories={categories} />
        </div>
      </div>
    </div>
  );
}
