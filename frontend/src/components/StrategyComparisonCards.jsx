import React from 'react';
import { Award, Zap, CheckCircle2, TrendingDown, Clock } from 'lucide-react';

export function StrategyComparisonCards({
  avalanche,
  snowball,
  selectedStrategy,
  onSelectStrategy,
  currency = '₹'
}) {
  const diffInterest = Math.abs((snowball?.totalInterestPaid || 0) - (avalanche?.totalInterestPaid || 0));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Payoff Strategy Comparison
        </h3>
        {diffInterest > 0 && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-md border border-emerald-900/80">
            Avalanche saves {currency}{Math.round(diffInterest).toLocaleString()} more
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Avalanche Strategy Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectStrategy('avalanche')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectStrategy('avalanche')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedStrategy === 'avalanche'
              ? 'border-emerald-500 bg-emerald-950/25 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base">
                Avalanche (Interest-First)
              </h4>
              {selectedStrategy === 'avalanche' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Optimal
            </span>
          </div>

          <div className="my-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Total Interest Paid
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {currency}{Math.round(avalanche?.totalInterestPaid || 0).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {avalanche?.yearsToPayoff || '0'} yrs ({avalanche?.totalMonths || 0} mos)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold justify-end">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>
                -{currency}{Math.round(avalanche?.interestSavedVsBaseline || 0).toLocaleString()} vs min
              </span>
            </div>
          </div>
        </div>

        {/* Snowball Strategy Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectStrategy('snowball')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectStrategy('snowball')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedStrategy === 'snowball'
              ? 'border-blue-500 bg-blue-950/25 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm sm:text-base">
                Snowball (Balance-First)
              </h4>
              {selectedStrategy === 'snowball' && (
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Behavioral
            </span>
          </div>

          <div className="my-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Total Interest Paid
            </span>
            <div className="text-2xl font-bold font-mono text-blue-400">
              {currency}{Math.round(snowball?.totalInterestPaid || 0).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {snowball?.yearsToPayoff || '0'} yrs ({snowball?.totalMonths || 0} mos)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold justify-end">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>
                -{currency}{Math.round(snowball?.interestSavedVsBaseline || 0).toLocaleString()} vs min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
