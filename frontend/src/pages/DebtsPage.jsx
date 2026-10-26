import React from 'react';
import { Plus, RotateCcw, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { useDebt } from '../context/DebtContext';
import { DebtCardRow } from '../components/DebtCardRow';
import { EmptyState } from '../components/UI/EmptyState';

export function DebtsPage() {
  const {
    debts,
    currency,
    openDebtModal,
    removeDebt,
    clearAllDebts,
    loadSampleData,
    simulationResults
  } = useDebt();

  const totalBalance = debts.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + (Number(d.minPayment) || 0), 0);
  const weightedApr =
    totalBalance > 0
      ? debts.reduce((sum, d) => sum + (Number(d.balance) || 0) * (Number(d.apr) || 0), 0) / totalBalance
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Debt Portfolio Workspace</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your liabilities, review monthly interest charges, and audit debt traps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Demo</span>
          </button>

          <button
            type="button"
            onClick={clearAllDebts}
            disabled={debts.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-rose-800/80 text-slate-400 hover:text-rose-400 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Reset workspace to empty"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => openDebtModal(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Debt</span>
          </button>
        </div>
      </div>

      {/* Aggregate Portfolio Strip */}
      {debts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <div className="flex justify-between items-center sm:block">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Total Principal</span>
            <span className="font-mono font-bold text-white text-base">
              {currency}{totalBalance.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center sm:block border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-4 pt-2 sm:pt-0">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Total Required Minimums</span>
            <span className="font-mono font-bold text-slate-200 text-base">
              {currency}{totalMinPayment.toLocaleString()}/mo
            </span>
          </div>

          <div className="flex justify-between items-center sm:block border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-4 pt-2 sm:pt-0">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block">Weighted Avg APR</span>
            <span className="font-mono font-bold text-amber-400 text-base">
              {weightedApr.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Trap Alerts */}
      {simulationResults.portfolioMetrics.hasTrappedDebts && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-rose-200">
            <span className="font-bold block text-sm">Negative Amortization Warning</span>
            One or more debts have minimum payments lower than the interest charges incurred each month.
            Under minimums alone, this balance will compound indefinitely!
          </div>
        </div>
      )}

      {/* Active Debt List or Empty State */}
      {debts.length === 0 ? (
        <EmptyState
          onAddDebt={() => openDebtModal(null)}
          onLoadSample={loadSampleData}
        />
      ) : (
        <div className="space-y-3">
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">Debt / Creditor</div>
            <div className="col-span-3">Balance</div>
            <div className="col-span-2">APR %</div>
            <div className="col-span-2">Min. Monthly Payment</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="space-y-2.5">
            {debts.map((debt) => (
              <DebtCardRow
                key={debt.id}
                debt={debt}
                currency={currency}
                onEdit={openDebtModal}
                onRemove={removeDebt}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
