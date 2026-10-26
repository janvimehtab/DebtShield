import React, { useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export function ScheduleTable({
  schedule = [],
  currency = '₹',
  title = 'Monthly Amortization Schedule',
  debts = [],
  isRefinanceSchedule = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 12; // 1 year per page

  const filteredSchedule = schedule.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(row.month).includes(term) ||
      (row.date && row.date.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredSchedule.length / rowsPerPage));
  const currentPageRows = filteredSchedule.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExport = () => {
    if (isRefinanceSchedule) {
      const rows = schedule.map((r) => ({
        Month: r.month,
        Payment: r.payment,
        Principal: r.principal,
        Interest: r.interest,
        RemainingBalance: r.balance,
        CumulativeInterest: r.cumulativeInterest
      }));
      exportToCSV('debtshield_refinance_amortization.csv', rows);
    } else {
      const rows = schedule.map((r) => ({
        Month: r.month,
        Date: r.date,
        TotalRemainingBalance: r.totalBalance,
        MonthlyPayment: r.monthlyPayment,
        MonthlyInterest: r.monthlyInterest,
        MonthlyPrincipal: r.monthlyPrincipal,
        CumulativeInterest: r.cumulativeInterest
      }));
      exportToCSV('debtshield_waterfall_schedule.csv', rows);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search month or year..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Table to CSV</span>
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Month</th>
              {!isRefinanceSchedule && <th className="py-2.5 px-3">Date</th>}
              <th className="py-2.5 px-3 text-right">Payment</th>
              <th className="py-2.5 px-3 text-right">Principal</th>
              <th className="py-2.5 px-3 text-right">Interest</th>
              <th className="py-2.5 px-3 text-right">Remaining Balance</th>
              <th className="py-2.5 px-3 text-right">Cum. Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {currentPageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No records matching &ldquo;{searchTerm}&rdquo;
                </td>
              </tr>
            ) : (
              currentPageRows.map((row) => (
                <tr key={row.month} className="hover:bg-slate-900/60 transition">
                  <td className="py-2.5 px-3 text-white font-semibold">
                    #{row.month}
                  </td>
                  {!isRefinanceSchedule && (
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      {row.date}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">
                    {currency}
                    {Number(row.monthlyPayment ?? row.payment ?? 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {currency}
                    {Number(row.monthlyPrincipal ?? row.principal ?? 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-400">
                    {currency}
                    {Number(row.monthlyInterest ?? row.interest ?? 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">
                    {currency}
                    {Number(row.totalBalance ?? row.balance ?? 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {currency}
                    {Number(row.cumulativeInterest ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Showing {(page - 1) * rowsPerPage + 1} to{' '}
            {Math.min(page * rowsPerPage, filteredSchedule.length)} of{' '}
            {filteredSchedule.length} months
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-semibold text-white">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
