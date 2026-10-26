import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, Sparkles, FileSpreadsheet, ArrowRight, Zap, Award } from 'lucide-react';
import { useDebt } from '../context/DebtContext';
import { StrategyComparisonCards } from '../components/StrategyComparisonCards';
import { PayoffChart } from '../components/PayoffChart';
import { ScheduleTable } from '../components/ScheduleTable';

export function StrategiesPage() {
  const {
    debts,
    currency,
    extraPayment,
    setExtraPayment,
    selectedStrategy,
    setSelectedStrategy,
    simulationResults,
    loadSampleData
  } = useDebt();

  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'schedule'

  const { avalanche, snowball, chartData, portfolioMetrics } = simulationResults;

  const presetAmounts = currency === '₹' ? [1000, 5000, 10000, 25000] : [50, 100, 250, 500];

  if (debts.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">No Debts to Compare</h2>
        <p className="text-xs text-slate-400">
          Add at least one debt to your portfolio to simulate the Avalanche vs. Snowball payoff waterfall.
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
            Go to My Debts &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const activeStrategySchedule =
    selectedStrategy === 'avalanche' ? avalanche.monthlySchedule : snowball.monthlySchedule;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Payoff Strategy Comparison</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate Avalanche (mathematical optimal) vs. Snowball (behavioral momentum) waterfalls.
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'chart'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Graph
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Schedule Table
          </button>
        </div>
      </div>

      {/* Interactive Extra Monthly Budget Slider (₹0 to ₹50,000 range) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Extra Monthly Payment Slider
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Budget channeled exclusively to prioritized target debt
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-emerald-400">
              +{currency}{Number(extraPayment).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block font-medium">/month extra</span>
          </div>
        </div>

        <div className="pt-2">
          <input
            type="range"
            min="0"
            max={currency === '₹' ? 50000 : 1000}
            step={currency === '₹' ? 500 : 25}
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Quick Add Pill Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 uppercase font-semibold mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => setExtraPayment(0)}
            className={`px-2.5 py-1 text-xs rounded-md border font-mono transition ${
              extraPayment === 0
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            0
          </button>
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setExtraPayment((prev) => prev + amt)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-emerald-400 font-mono transition"
            >
              +{currency}{amt.toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setExtraPayment(currency === '₹' ? 50000 : 1000)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono transition"
          >
            Max ({currency}{currency === '₹' ? '50,000' : '1,000'})
          </button>
        </div>
      </div>

      {/* Side-by-Side Strategy Cards */}
      <StrategyComparisonCards
        avalanche={avalanche}
        snowball={snowball}
        selectedStrategy={selectedStrategy}
        onSelectStrategy={setSelectedStrategy}
        currency={currency}
      />

      {/* Main Tab Content */}
      {activeTab === 'chart' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Multi-Line Payoff Comparison Graph
              </h3>
              <p className="text-xs text-slate-400">
                Selected: <strong className="capitalize text-emerald-400">{selectedStrategy}</strong> &bull; Total payoff by {selectedStrategy === 'avalanche' ? avalanche.payoffDate : snowball.payoffDate}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspect Table</span>
            </button>
          </div>

          <PayoffChart
            chartData={chartData}
            currency={currency}
            selectedStrategy={selectedStrategy}
            isCompact={false}
          />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Month-by-Month Amortization Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Detailed waterfall timeline under the <strong className="capitalize text-emerald-400">{selectedStrategy}</strong> method
              </p>
            </div>
          </div>

          <ScheduleTable
            schedule={activeStrategySchedule}
            currency={currency}
            debts={debts}
            isRefinanceSchedule={false}
          />
        </div>
      )}
    </div>
  );
}
