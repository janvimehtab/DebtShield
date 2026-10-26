import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingDown,
  Clock,
  CreditCard,
  ArrowRight,
  Plus,
  AlertCircle,
  Sparkles,
  Award
} from 'lucide-react';
import { useDebt } from '../context/DebtContext';
import { MetricCard } from '../components/UI/MetricCard';
import { PayoffChart } from '../components/PayoffChart';
import { DebtCardRow } from '../components/DebtCardRow';

export function DashboardPage() {
  const {
    currency,
    debts,
    simulationResults,
    openDebtModal,
    removeDebt,
    loadSampleData
  } = useDebt();

  const { portfolioMetrics, avalanche, trappedDebts, chartData } = simulationResults;

  return (
    <div className="space-y-6">
      {/* Debt Trap Alert Banner */}
      {portfolioMetrics.hasTrappedDebts && (
        <div className="bg-rose-950/40 border border-rose-600/50 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-rose-200 text-sm block">
              Debt Trap Alert: Negative Amortization Detected
            </span>
            <p className="text-rose-300 mt-0.5">
              {trappedDebts.length} debt(s) have minimum payments lower than their monthly interest charge.
              Without extra budget, their balances will expand exponentially.
            </p>
          </div>
          <Link
            to="/debts"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition shrink-0"
          >
            Review Debts
          </Link>
        </div>
      )}

      {/* 4 Top Metric Cards */}
      <section aria-label="Key Portfolio Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Debt Balance */}
          <MetricCard
            title="Total Debt Balance"
            value={`${currency}${Math.round(portfolioMetrics.totalBalance).toLocaleString()}`}
            subtitle={`${debts.length} Active Accounts (${portfolioMetrics.weightedApr}% Wtd APR)`}
            icon={Wallet}
          />

          {/* Card 2: Current Monthly Commitments */}
          <MetricCard
            title="Monthly Commitments"
            value={`${currency}${Math.round(portfolioMetrics.currentMonthlySpend).toLocaleString()}/mo`}
            subtitle={`Min: ${currency}${Math.round(portfolioMetrics.totalMinPayment).toLocaleString()} + Extra: ${currency}${Math.round(portfolioMetrics.currentMonthlySpend - portfolioMetrics.totalMinPayment).toLocaleString()}`}
            icon={CreditCard}
          />

          {/* Card 3: Total Interest Saved */}
          <MetricCard
            title="Total Interest Saved"
            value={`${currency}${Math.round(avalanche.interestSavedVsBaseline).toLocaleString()}`}
            subtitle={`vs. paying baseline minimums`}
            badge="Avalanche"
            badgeColor="emerald"
          />

          {/* Card 4: Payoff Time Savings */}
          <MetricCard
            title="Payoff Time Saved"
            value={`${avalanche.monthsSavedVsBaseline} Mos`}
            subtitle={`Debt-free by ${avalanche.payoffDate} (${avalanche.yearsToPayoff} yrs)`}
            badge="Accelerated"
            badgeColor="emerald"
          />
        </div>
      </section>

      {/* Main Grid: Chart & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Summary Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Portfolio Payoff Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Projected balance depletion curve comparing waterfall vs minimums
              </p>
            </div>
            <Link
              to="/strategies"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              <span>Explore Strategies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PayoffChart
            chartData={chartData}
            currency={currency}
            selectedStrategy="avalanche"
            isCompact={true}
          />
        </div>

        {/* Right Column: Recent Debts Overview Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Active Debts ({debts.length})
              </h3>
              <p className="text-xs text-slate-400">
                Highest APR accounts prioritized
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openDebtModal(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <Link
                to="/debts"
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {debts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p>No active debts in your portfolio.</p>
              <button
                type="button"
                onClick={loadSampleData}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-emerald-400 hover:bg-slate-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Demo Portfolio
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {[...debts]
                .sort((a, b) => b.apr - a.apr)
                .slice(0, 4)
                .map((debt) => (
                  <DebtCardRow
                    key={debt.id}
                    debt={debt}
                    currency={currency}
                    onEdit={openDebtModal}
                    onRemove={removeDebt}
                  />
                ))}
            </div>
          )}

          {debts.length > 4 && (
            <div className="pt-2 text-center border-t border-slate-800/80">
              <Link
                to="/debts"
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                + {debts.length - 4} more accounts in workspace &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
