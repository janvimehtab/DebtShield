import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';

export function DebtInputModal({ isOpen, onClose, initialDebt = null, onSave, currency = '₹' }) {
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    apr: '',
    minPayment: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialDebt) {
      setFormData({
        name: initialDebt.name || '',
        balance: initialDebt.balance !== undefined ? String(initialDebt.balance) : '',
        apr: initialDebt.apr !== undefined ? String(initialDebt.apr) : '',
        minPayment: initialDebt.minPayment !== undefined ? String(initialDebt.minPayment) : ''
      });
    } else {
      setFormData({
        name: '',
        balance: '',
        apr: '',
        minPayment: ''
      });
    }
    setErrors({});
  }, [initialDebt, isOpen]);

  if (!isOpen) return null;

  const numBalance = parseFloat(formData.balance) || 0;
  const numApr = parseFloat(formData.apr) || 0;
  const numMinPayment = parseFloat(formData.minPayment) || 0;
  const monthlyInterestRate = numApr / 100 / 12;
  const monthlyInterest = numBalance * monthlyInterestRate;
  const isDebtTrap = numBalance > 0 && numMinPayment > 0 && numMinPayment <= monthlyInterest;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Debt name is required';
    }
    if (!formData.balance || numBalance <= 0) {
      errs.balance = 'Balance must be greater than 0';
    }
    if (formData.apr === '' || numApr < 0 || numApr > 150) {
      errs.apr = 'APR must be between 0% and 150%';
    }
    if (!formData.minPayment || numMinPayment <= 0) {
      errs.minPayment = 'Minimum payment must be greater than 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: initialDebt ? initialDebt.id : `debt-${Date.now()}`,
      name: formData.name.trim(),
      balance: numBalance,
      apr: numApr,
      minPayment: numMinPayment
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <h3 className="text-base font-bold text-white tracking-tight">
            {initialDebt ? `Edit ${initialDebt.name}` : 'Add Debt to Workspace'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Account / Debt Name
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Credit Card, Personal Loan, Car Loan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-slate-950 border ${
                errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
              } rounded-xl text-white placeholder-slate-500 text-sm outline-none transition`}
              autoFocus
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Balance ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="120000"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className={`w-full px-3 py-2.5 bg-slate-950 border ${
                  errors.balance ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl text-white font-mono text-sm outline-none transition`}
              />
              {errors.balance && <p className="text-xs text-rose-400 mt-1">{errors.balance}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                APR %
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="150"
                placeholder="36"
                value={formData.apr}
                onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                className={`w-full px-3 py-2.5 bg-slate-950 border ${
                  errors.apr ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl text-white font-mono text-sm outline-none transition`}
              />
              {errors.apr && <p className="text-xs text-rose-400 mt-1">{errors.apr}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Min Pay ({currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="4000"
                value={formData.minPayment}
                onChange={(e) => setFormData({ ...formData, minPayment: e.target.value })}
                className={`w-full px-3 py-2.5 bg-slate-950 border ${
                  errors.minPayment ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                } rounded-xl text-white font-mono text-sm outline-none transition`}
              />
              {errors.minPayment && <p className="text-xs text-rose-400 mt-1">{errors.minPayment}</p>}
            </div>
          </div>

          {numBalance > 0 && numApr > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Monthly Interest Accrual:</span>
                <span className="font-mono text-white font-semibold">
                  {currency}{Math.round(monthlyInterest).toLocaleString()}
                </span>
              </div>

              {isDebtTrap && (
                <div className="flex items-start gap-2 pt-1.5 text-rose-400 font-medium border-t border-rose-950/80">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Debt Trap Warning:</strong> Minimum payment does not cover monthly interest charge. Debt will grow without additional payment!
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-950/40"
            >
              {initialDebt ? 'Update Debt' : 'Add Debt to Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
