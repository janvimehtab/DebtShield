import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useDebt } from '../context/DebtContext';
import { evaluateRefinance } from '../utils/debtEngine';
import { ScheduleTable } from '../components/ScheduleTable';

export function RefinancePage() {
  const {
    debts,
    currency,
    selectedStrategy,
    extraPayment,
    loadSampleData
  } = useDebt();

  const [rate, setRate] = useState(10.5);
  const [durationMonths, setDurationMonths] = useState(36);
  const [feePct, setFeePct] = useState(1.5);
  const [showAmortization, setShowAmortization] = useState(false);

  const durationPresets = [12, 24, 36, 48, 60];

  const refinanceResult = useMemo(() => {
    return evaluateRefinance(
      debts,
      rate,
      durationMonths,
      feePct,
      selectedStrategy,
      extraPayment
    );
  }, [debts, rate, durationMonths, feePct, selectedStrategy, extraPayment]);

  const { refinanceMetrics, comparisonWithCurrent, amortizationSchedule } = refinanceResult;

  if (debts.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">No Active Debts to Consolidate</h2>
        <p className="text-xs text-slate-400">
          Add active liabilities or load demo data to model consolidation loan trade-offs.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={loadSampleData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Demo Data
          </button>
          <Link
            to="/debts"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
          >
            Manage Debts &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const isNetSavingsPositive = comparisonWithCurrent.netSavings > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Loan Consolidation Simulator</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate consolidating {debts.length} high-interest debts into a single personal loan with a fixed APR.
          </p>
        </div>

        {/* "Is Refinancing Worth It?" Recommendation Badge */}
        <div>
          {isNetSavingsPositive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended: Saves {currency}{Math.round(comparisonWithCurrent.netSavings).toLocaleString()}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Not Advised: Waterfall Saves More Cash</span>
            </span>
          )}
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Proposed Refinance APR % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              Proposed Refinance APR
            </span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              {rate}% APR
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="0.25"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>5.0%</span>
            <span>15.0%</span>
            <span>25.0%</span>
          </div>
        </div>

        {/* Loan Term Duration (12, 24, 36, 48, 60 months) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              Loan Term Duration
            </span>
            <span className="font-mono text-white font-bold text-sm">
              {durationMonths} Months
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
            {durationPresets.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setDurationMonths(months)}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  durationMonths === months
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {months}m
              </button>
            ))}
          </div>
        </div>

        {/* Origination Fee % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              Origination Fee
            </span>
            <span className="font-mono text-amber-400 font-bold text-sm">
              {feePct}% ({currency}{Math.round(refinanceMetrics.originationFee).toLocaleString()})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={feePct}
            onChange={(e) => setFeePct(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0%</span>
            <span>2.5%</span>
            <span>5.0%</span>
          </div>
        </div>
      </div>

      {/* Comparative Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current vs Refinanced Monthly Payment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            New Monthly Commitment
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {currency}{Math.round(refinanceMetrics.monthlyPayment).toLocaleString()}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            vs {currency}{Math.round(comparisonWithCurrent.currentMonthlyMin).toLocaleString()} current min
          </span>
        </div>

        {/* Metric 2: Net Interest Difference */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Net Cash Difference
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isNetSavingsPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isNetSavingsPositive ? '+' : ''}
            {currency}{Math.round(comparisonWithCurrent.netSavings).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            After {currency}{Math.round(refinanceMetrics.originationFee).toLocaleString()} fee
          </span>
        </div>

        {/* Metric 3: Total Refinanced Principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Total Financed Balance
          </span>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {currency}{Math.round(refinanceMetrics.totalLoanAmount).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Principal: {currency}{Math.round(refinanceMetrics.totalPrincipal).toLocaleString()}
          </span>
        </div>

        {/* Metric 4: Fee Break-Even Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Fee Recovery Break-Even
          </span>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {refinanceMetrics.breakEvenMonths > 0
              ? `${refinanceMetrics.breakEvenMonths} Mos`
              : 'Immediate'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Time to offset origination fee
          </span>
        </div>
      </div>

      {/* Amortization Schedule Accordion / View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Consolidation Loan Amortization Schedule ({durationMonths} Months)
            </h3>
            <p className="text-xs text-slate-400">
              Fixed monthly breakdown of principal reduction and interest charges
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition"
          >
            {showAmortization ? 'Collapse Table' : 'Expand Schedule'}
          </button>
        </div>

        {showAmortization ? (
          <ScheduleTable
            schedule={amortizationSchedule}
            currency={currency}
            isRefinanceSchedule={true}
          />
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
            <p>Amortization table collapsed for clean readability.</p>
            <button
              type="button"
              onClick={() => setShowAmortization(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Expand Amortization Table</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
