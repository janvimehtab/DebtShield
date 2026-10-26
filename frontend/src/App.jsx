import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DebtProvider, useDebt } from './context/DebtContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { DebtsPage } from './pages/DebtsPage';
import { StrategiesPage } from './pages/StrategiesPage';
import { RefinancePage } from './pages/RefinancePage';
import { DebtInputModal } from './components/DebtInputModal';
import { Toast } from './components/UI/Toast';

function AppContent() {
  const {
    isDebtModalOpen,
    closeDebtModal,
    editingDebt,
    addDebt,
    updateDebt,
    currency,
    toast,
    hideToast
  } = useDebt();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Routed Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/refinance" element={<RefinancePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Minimalist Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>DebtShield &bull; Ultra-Clean Multi-Debt Waterfall Simulator &bull; Vercel Ready</p>
      </footer>

      {/* Global Debt Input / Edit Modal */}
      <DebtInputModal
        isOpen={isDebtModalOpen}
        onClose={closeDebtModal}
        initialDebt={editingDebt}
        onSave={(data) => {
          if (editingDebt) {
            updateDebt(data);
          } else {
            addDebt(data);
          }
        }}
        currency={currency}
      />

      {/* Global Toast Alerts */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DebtProvider>
        <AppContent />
      </DebtProvider>
    </BrowserRouter>
  );
}
