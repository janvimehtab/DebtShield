import React from 'react';
import { Trash2, Edit3, AlertTriangle } from 'lucide-react';

export function DebtCardRow({ debt, currency = '₹', onEdit, onRemove }) {
  const balance = Number(debt.balance) || 0;
  const apr = Number(debt.apr) || 0;
  const minPayment = Number(debt.minPayment) || 0;
  const monthlyInterest = balance * (apr / 100 / 12);
  const isTrap = minPayment <= monthlyInterest;

  return (
    <div
      className={`grid grid-cols-12 gap-3 items-center p-3.5 sm:p-4 bg-slate-900/90 hover:bg-slate-800/80 rounded-xl border ${
        isTrap ? 'border-rose-900/80 bg-rose-950/15' : 'border-slate-800'
      } transition shadow-sm`}
    >
      {/* Col 1: Debt Name */}
      <div className="col-span-12 sm:col-span-4 min-w-0">
        <div className="font-semibold text-slate-100 text-sm truncate">
          {debt.name}
        </div>
        {isTrap ? (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Debt Trap: Min payment &lt; Interest ({currency}{Math.round(monthlyInterest).toLocaleString()}/mo)</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 mt-0.5">
            Est. Interest: {currency}{Math.round(monthlyInterest).toLocaleString()}/mo
          </div>
        )}
      </div>

      {/* Col 2: Balance */}
      <div className="col-span-4 sm:col-span-3 text-xs sm:text-sm font-mono text-slate-200">
        <span className="text-[10px] text-slate-500 uppercase block sm:hidden font-sans">Balance</span>
        <span className="font-bold">{currency}{balance.toLocaleString()}</span>
      </div>

      {/* Col 3: APR % */}
      <div className="col-span-3 sm:col-span-2 text-xs sm:text-sm font-mono font-semibold text-amber-400">
        <span className="text-[10px] text-slate-500 uppercase block sm:hidden font-sans">Rate</span>
        <span>{apr}% APR</span>
      </div>

      {/* Col 4: Min Monthly Payment */}
      <div className="col-span-3 sm:col-span-2 text-xs sm:text-sm font-mono text-slate-300">
        <span className="text-[10px] text-slate-500 uppercase block sm:hidden font-sans">Min Pay</span>
        <span>Min: {currency}{minPayment.toLocaleString()}</span>
      </div>

      {/* Col 5: Actions (Edit/Delete) */}
      <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1.5 text-right">
        <button
          type="button"
          onClick={() => onEdit(debt)}
          className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
          title="Edit debt"
          aria-label={`Edit ${debt.name}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(debt.id)}
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
          title="Delete debt"
          aria-label={`Delete ${debt.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
