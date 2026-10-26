import React from 'react';
import { Sliders, Sparkles, Plus } from 'lucide-react';

export function EmptyState({ onAddDebt, onLoadSample }) {
  return (
    <div className="py-14 px-4 text-center rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
        <Sliders className="w-7 h-7 text-emerald-400 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-bold text-slate-100">No active debts found.</h3>
      <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm">
        Add a debt or click &ldquo;Load Demo Data&rdquo; to simulate Avalanche and Snowball payoff waterfalls.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onLoadSample}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Data
        </button>
        <button
          type="button"
          onClick={onAddDebt}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5 border border-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
          + Add First Debt
        </button>
      </div>
    </div>
  );
}
