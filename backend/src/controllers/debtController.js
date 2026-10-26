/**
 * DebtShield Controller
 * Orchestrates simulation requests, input validation checks, and refinancing math.
 */

const { validationResult } = require('express-validator');
const debtEngine = require('../utils/debtEngine');

/**
 * Health check endpoint
 */
function getHealth(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'DebtShield Waterfall Engine API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
}

/**
 * Run Avalanche & Snowball Waterfall simulation
 */
function simulateDebts(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid debt simulation parameters provided',
          details: errors.array()
        }
      });
    }

    const { debts, extraPayment = 0, strategy = 'avalanche' } = req.body;

    if (!Array.isArray(debts) || debts.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_DEBTS_PAYLOAD',
          message: 'At least one active debt is required to simulate a payoff schedule.'
        }
      });
    }

    // Sanitize & parse numeric fields
    const sanitizedDebts = debts.map((d, index) => {
      const balance = Math.max(0, parseFloat(d.balance) || 0);
      const apr = Math.max(0, parseFloat(d.apr) || 0);
      const minPayment = Math.max(0, parseFloat(d.minPayment) || 0);

      return {
        id: d.id || `debt-${index + 1}`,
        name: (d.name || `Debt ${index + 1}`).trim(),
        balance,
        apr,
        minPayment
      };
    });

    const parsedExtraPayment = Math.max(0, parseFloat(extraPayment) || 0);
    const chosenStrategy = ['avalanche', 'snowball'].includes(strategy) ? strategy : 'avalanche';

    // Check for negative amortization / debt trap issues
    const trapAnalysis = debtEngine.analyzeDebtTraps(sanitizedDebts);
    const trappedDebts = trapAnalysis.filter((t) => t.isTrapped);

    // Run full simulation
    const simulationResults = debtEngine.runFullSimulation(sanitizedDebts, parsedExtraPayment, new Date());

    return res.status(200).json({
      success: true,
      data: {
        selectedStrategy: chosenStrategy,
        extraPayment: parsedExtraPayment,
        ...simulationResults,
        warnings: trappedDebts.length > 0 ? {
          code: 'DEBT_TRAP_DETECTED',
          message: `${trappedDebts.length} debt(s) have minimum payments that do not cover monthly interest accrual.`,
          trappedDebts
        } : null
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Calculate Debt Refinancing & Loan Consolidation Trade-Offs
 */
function refinanceDebts(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid refinance parameters provided',
          details: errors.array()
        }
      });
    }

    const {
      debts = [],
      rate = 10.5,
      durationMonths = 36,
      feePct = 1.5,
      currentStrategy = 'avalanche',
      extraPayment = 0
    } = req.body;

    if (!Array.isArray(debts) || debts.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_DEBTS_PAYLOAD',
          message: 'At least one debt is required for loan consolidation analysis.'
        }
      });
    }

    const sanitizedDebts = debts.map((d, index) => ({
      id: d.id || `debt-${index + 1}`,
      name: (d.name || `Debt ${index + 1}`).trim(),
      balance: Math.max(0, parseFloat(d.balance) || 0),
      apr: Math.max(0, parseFloat(d.apr) || 0),
      minPayment: Math.max(0, parseFloat(d.minPayment) || 0)
    }));

    const parsedRate = Math.max(0, parseFloat(rate) || 0);
    const parsedDuration = Math.max(1, parseInt(durationMonths, 10) || 36);
    const parsedFeePct = Math.max(0, parseFloat(feePct) || 0);

    const refinanceAnalysis = debtEngine.calculateRefinance({
      debts: sanitizedDebts,
      rate: parsedRate,
      durationMonths: parsedDuration,
      feePct: parsedFeePct,
      currentStrategy: ['avalanche', 'snowball'].includes(currentStrategy) ? currentStrategy : 'avalanche',
      extraPayment: Math.max(0, parseFloat(extraPayment) || 0)
    });

    return res.status(200).json({
      success: true,
      data: refinanceAnalysis
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHealth,
  simulateDebts,
  refinanceDebts
};
