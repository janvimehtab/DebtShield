import axios from 'axios';
import { runFullSimulation, evaluateRefinance } from '../utils/debtEngine';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Checks system health
 */
export async function checkApiHealth() {
  try {
    const res = await apiClient.get('/health');
    return { online: true, data: res.data };
  } catch (error) {
    return { online: false, error: error.message };
  }
}

/**
 * Simulates debt payoff schedule using backend API with fallback to client math engine
 */
export async function simulateDebtPayoffApi(debts, extraPayment = 0, strategy = 'avalanche') {
  try {
    const response = await apiClient.post('/simulate', {
      debts,
      extraPayment: Number(extraPayment),
      strategy
    });
    if (response.data && response.data.success) {
      return {
        fromServer: true,
        data: response.data.data
      };
    }
    throw new Error('Server returned unsuccessful response');
  } catch (err) {
    // Client-side fallback computation
    const localResult = runFullSimulation(debts, extraPayment, new Date());
    return {
      fromServer: false,
      data: {
        selectedStrategy: strategy,
        extraPayment: Number(extraPayment),
        ...localResult,
        warnings: localResult.trappedDebts.length > 0 ? {
          code: 'DEBT_TRAP_DETECTED',
          message: `${localResult.trappedDebts.length} debt(s) have minimum payments that do not cover monthly interest accrual.`,
          trappedDebts: localResult.trappedDebts
        } : null
      }
    };
  }
}

/**
 * Calculates refinancing consolidation options using backend API with fallback
 */
export async function calculateRefinancingApi(params) {
  try {
    const response = await apiClient.post('/refinance', params);
    if (response.data && response.data.success) {
      return {
        fromServer: true,
        data: response.data.data
      };
    }
    throw new Error('Refinance API response unsuccessful');
  } catch (err) {
    // Client-side fallback computation
    const localResult = evaluateRefinance(
      params.debts,
      params.rate,
      params.durationMonths,
      params.feePct,
      params.currentStrategy,
      params.extraPayment
    );
    return {
      fromServer: false,
      data: localResult
    };
  }
}
