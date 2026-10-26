import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { runFullSimulation } from '../utils/debtEngine';
import { exportToCSV, formatScheduleForCSV } from '../utils/exportUtils';

export const SAMPLE_DEBTS_INR = [
  { id: 'sample-1', name: 'HDFC Regalia Credit Card', balance: 120000, apr: 36, minPayment: 4000 },
  { id: 'sample-2', name: 'SBI SimplyCLICK Card', balance: 220000, apr: 42, minPayment: 8500 },
  { id: 'sample-3', name: 'ICICI Personal Loan', balance: 400000, apr: 15, minPayment: 12000 },
  { id: 'sample-4', name: 'SBI Auto Car Loan', balance: 500000, apr: 9.5, minPayment: 14000 }
];

export const SAMPLE_DEBTS_USD = [
  { id: 'sample-1', name: 'Sapphire Preferred Card', balance: 3500, apr: 28.5, minPayment: 120 },
  { id: 'sample-2', name: 'Amex Gold Card', balance: 5800, apr: 24.9, minPayment: 180 },
  { id: 'sample-3', name: 'Peer Personal Loan', balance: 12000, apr: 12.5, minPayment: 360 },
  { id: 'sample-4', name: 'Automobile Financing', balance: 18000, apr: 6.8, minPayment: 450 }
];

const DebtContext = createContext(null);

export function DebtProvider({ children }) {
  // Currency state
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('debtshield_currency') || '₹';
  });

  // Debts state
  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('debtshield_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse cached portfolio', e);
      }
    }
    return SAMPLE_DEBTS_INR;
  });

  // Extra monthly payment
  const [extraPayment, setExtraPayment] = useState(() => {
    const saved = localStorage.getItem('debtshield_extra');
    return saved !== null ? Number(saved) : 5000;
  });

  // Active strategy selection ('avalanche' | 'snowball')
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');

  // Modal & Toast states
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('debtshield_portfolio', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('debtshield_extra', String(extraPayment));
  }, [extraPayment]);

  useEffect(() => {
    localStorage.setItem('debtshield_currency', currency);
  }, [currency]);

  // Real-time calculation engine evaluation
  const simulationResults = useMemo(() => {
    return runFullSimulation(debts, extraPayment, new Date());
  }, [debts, extraPayment]);

  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  const hideToast = () => {
    setToast(null);
  };

  const openDebtModal = (debt = null) => {
    setEditingDebt(debt);
    setIsDebtModalOpen(true);
  };

  const closeDebtModal = () => {
    setEditingDebt(null);
    setIsDebtModalOpen(false);
  };

  const addDebt = (newDebt) => {
    setDebts((prev) => [...prev, newDebt]);
    showToast({
      type: 'success',
      title: 'Debt Added',
      message: `Added "${newDebt.name}" to your portfolio.`
    });
    closeDebtModal();
  };

  const updateDebt = (updatedDebt) => {
    setDebts((prev) => prev.map((d) => (d.id === updatedDebt.id ? updatedDebt : d)));
    showToast({
      type: 'success',
      title: 'Debt Updated',
      message: `Updated "${updatedDebt.name}" successfully.`
    });
    closeDebtModal();
  };

  const removeDebt = (id) => {
    const debtToRemove = debts.find((d) => d.id === id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
    showToast({
      type: 'info',
      title: 'Debt Removed',
      message: `Removed ${debtToRemove?.name || 'debt'} from portfolio.`
    });
  };

  const loadSampleData = () => {
    const sample = currency === '₹' ? SAMPLE_DEBTS_INR : SAMPLE_DEBTS_USD;
    setDebts(sample);
    setExtraPayment(currency === '₹' ? 5000 : 150);
    showToast({
      type: 'success',
      title: 'Demo Data Loaded',
      message: `Loaded realistic ${currency === '₹' ? 'Indian (₹)' : 'US ($)'} debt portfolio.`
    });
  };

  const clearAllDebts = () => {
    setDebts([]);
    setExtraPayment(0);
    showToast({
      type: 'info',
      title: 'Workspace Reset',
      message: 'All debts cleared from portfolio.'
    });
  };

  const exportCurrentScheduleCSV = () => {
    if (debts.length === 0) {
      showToast({
        type: 'warning',
        title: 'Export Failed',
        message: 'No active debts found to export.'
      });
      return;
    }

    const currentSchedule =
      selectedStrategy === 'avalanche'
        ? simulationResults.avalanche.monthlySchedule
        : simulationResults.snowball.monthlySchedule;

    const formatted = formatScheduleForCSV(currentSchedule, debts);
    exportToCSV(`DebtShield_${selectedStrategy}_Schedule.csv`, formatted);
    showToast({
      type: 'success',
      title: 'Schedule Exported',
      message: `Exported ${selectedStrategy} waterfall timeline to CSV.`
    });
  };

  const value = {
    currency,
    setCurrency,
    debts,
    extraPayment,
    setExtraPayment,
    selectedStrategy,
    setSelectedStrategy,
    simulationResults,
    isDebtModalOpen,
    editingDebt,
    openDebtModal,
    closeDebtModal,
    addDebt,
    updateDebt,
    removeDebt,
    loadSampleData,
    clearAllDebts,
    exportCurrentScheduleCSV,
    toast,
    showToast,
    hideToast
  };

  return <DebtContext.Provider value={value}>{children}</DebtContext.Provider>;
}

export function useDebt() {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebt must be used within a DebtProvider');
  }
  return context;
}
