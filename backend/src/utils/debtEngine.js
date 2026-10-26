/**
 * DebtShield Mathematical Engine
 * Core calculations for Avalanche, Snowball, Baseline waterfall payoff, and Refinancing amortization.
 */

const MAX_SIMULATION_MONTHS = 600; // 50 years safety guard

/**
 * Format month index to a human-readable calendar label (e.g., "Nov 2026")
 */
function getMonthLabel(monthIndex, start = new Date()) {
  const date = new Date(start.getFullYear(), start.getMonth() + monthIndex, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Validates active debts and identifies negative amortization (debt trap risks).
 */
function analyzeDebtTraps(debts) {
  return debts.map((d) => {
    const balance = Number(d.balance) || 0;
    const apr = Number(d.apr) || 0;
    const minPayment = Number(d.minPayment) || 0;
    const monthlyRate = apr / 100 / 12;
    const monthlyInterestAccrual = balance * monthlyRate;
    const isTrapped = balance > 0 && minPayment <= monthlyInterestAccrual;
    const minPaymentNeededToAmortize = monthlyInterestAccrual + 1;

    return {
      id: d.id,
      name: d.name,
      balance,
      apr,
      minPayment,
      monthlyInterestAccrual: Number(monthlyInterestAccrual.toFixed(2)),
      isTrapped,
      shortfall: isTrapped ? Number((monthlyInterestAccrual - minPayment).toFixed(2)) : 0,
      minPaymentNeededToAmortize: Number(minPaymentNeededToAmortize.toFixed(2))
    };
  });
}

/**
 * Clone debt objects for deterministic simulation
 */
function cloneDebts(debts) {
  return debts.map((d, index) => ({
    id: d.id || `debt-${index + 1}`,
    name: d.name || `Debt ${index + 1}`,
    originalBalance: Number(d.balance) || 0,
    balance: Number(d.balance) || 0,
    apr: Number(d.apr) || 0,
    minPayment: Number(d.minPayment) || 0,
    paidOffMonth: null,
    totalInterestPaid: 0,
    totalPrincipalPaid: 0
  }));
}

/**
 * Sorts debts according to chosen strategy
 * Avalanche: Highest APR first. Tie-break: lowest balance.
 * Snowball: Lowest balance first. Tie-break: highest APR.
 */
function sortDebtsByStrategy(debts, strategy = 'avalanche') {
  const sorted = [...debts];
  if (strategy === 'avalanche') {
    sorted.sort((a, b) => {
      if (b.apr !== a.apr) return b.apr - a.apr;
      return a.balance - b.balance;
    });
  } else if (strategy === 'snowball') {
    sorted.sort((a, b) => {
      if (a.balance !== b.balance) return a.balance - b.balance;
      return b.apr - a.apr;
    });
  }
  return sorted;
}

/**
 * Simulates debt payoff schedule.
 * @param {Array} rawDebts - list of debts { id, name, balance, apr, minPayment }
 * @param {number} extraMonthlyPayment - extra cash allocated monthly
 * @param {'avalanche' | 'snowball' | 'baseline'} strategy - strategy name
 * @param {Date} startDate - starting date for calendar display
 */
function simulateDebtPayoff(rawDebts, extraMonthlyPayment = 0, strategy = 'avalanche', startDate = new Date()) {
  const activeDebts = cloneDebts(rawDebts).filter((d) => d.balance > 0);
  const extraCash = Math.max(0, Number(extraMonthlyPayment) || 0);

  if (activeDebts.length === 0) {
    return {
      strategy,
      totalMonths: 0,
      yearsToPayoff: '0.0',
      payoffDate: getMonthLabel(0, startDate),
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalPaid: 0,
      isCapped: false,
      monthlySchedule: [],
      debtSummary: []
    };
  }

  // Baseline initial total monthly commitment
  const initialBaseMonthlyCommitment = activeDebts.reduce((sum, d) => sum + d.minPayment, 0);
  const totalMonthlyBudget = initialBaseMonthlyCommitment + extraCash;

  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  const monthlySchedule = [];
  let month = 0;
  let isCapped = false;

  // Initial Month 0 snapshot
  const initialTotalBalance = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  monthlySchedule.push({
    month: 0,
    date: getMonthLabel(0, startDate),
    totalBalance: Number(initialTotalBalance.toFixed(2)),
    monthlyPayment: 0,
    monthlyInterest: 0,
    monthlyPrincipal: 0,
    cumulativeInterest: 0,
    cumulativePrincipal: 0,
    debtBalances: activeDebts.reduce((acc, d) => {
      acc[d.id] = Number(d.balance.toFixed(2));
      return acc;
    }, {})
  });

  while (month < MAX_SIMULATION_MONTHS) {
    // Check if all debts are zero
    const currentRemainingDebts = activeDebts.filter((d) => d.balance > 0.009);
    if (currentRemainingDebts.length === 0) {
      break;
    }

    month++;
    let monthTotalInterest = 0;
    let monthTotalPayment = 0;

    // 1. Accrue monthly interest across all active debts
    for (const debt of currentRemainingDebts) {
      const monthlyRate = debt.apr / 100 / 12;
      const interest = debt.balance * monthlyRate;
      debt.balance += interest;
      debt.totalInterestPaid += interest;
      monthTotalInterest += interest;
      cumulativeInterest += interest;
    }

    // 2. Pay required minimum payments first
    let paidThisMonth = 0;
    for (const debt of currentRemainingDebts) {
      const payment = Math.min(debt.balance, debt.minPayment);
      debt.balance -= payment;
      paidThisMonth += payment;
      debt.totalPrincipalPaid += payment;
    }

    // 3. Calculate remaining available budget for waterfall
    let remainingBudget = 0;
    if (strategy !== 'baseline') {
      remainingBudget = Math.max(0, totalMonthlyBudget - paidThisMonth);

      // Prioritize remaining active debts based on strategy
      const prioritized = sortDebtsByStrategy(
        currentRemainingDebts.filter((d) => d.balance > 0.009),
        strategy
      );

      for (const targetDebt of prioritized) {
        if (remainingBudget <= 0.001) break;
        if (targetDebt.balance <= 0.009) continue;

        const extraToTarget = Math.min(targetDebt.balance, remainingBudget);
        targetDebt.balance -= extraToTarget;
        remainingBudget -= extraToTarget;
        paidThisMonth += extraToTarget;
        targetDebt.totalPrincipalPaid += extraToTarget;

        if (targetDebt.balance <= 0.009 && targetDebt.paidOffMonth === null) {
          targetDebt.balance = 0;
          targetDebt.paidOffMonth = month;
        }
      }
    }

    // Check newly cleared debts
    for (const d of activeDebts) {
      if (d.balance <= 0.009 && d.paidOffMonth === null) {
        d.balance = 0;
        d.paidOffMonth = month;
      }
    }

    monthTotalPayment = paidThisMonth;
    const monthPrincipal = Math.max(0, monthTotalPayment - monthTotalInterest);
    cumulativePrincipal += monthPrincipal;

    const remainingTotalBalance = activeDebts.reduce((sum, d) => sum + Math.max(0, d.balance), 0);

    // Save snapshot
    monthlySchedule.push({
      month,
      date: getMonthLabel(month, startDate),
      totalBalance: Number(Math.max(0, remainingTotalBalance).toFixed(2)),
      monthlyPayment: Number(monthTotalPayment.toFixed(2)),
      monthlyInterest: Number(monthTotalInterest.toFixed(2)),
      monthlyPrincipal: Number(monthPrincipal.toFixed(2)),
      cumulativeInterest: Number(cumulativeInterest.toFixed(2)),
      cumulativePrincipal: Number(cumulativePrincipal.toFixed(2)),
      debtBalances: activeDebts.reduce((acc, d) => {
        acc[d.id] = Number(Math.max(0, d.balance).toFixed(2));
        return acc;
      }, {})
    });

    if (remainingTotalBalance <= 0.009) {
      break;
    }
  }

  if (month >= MAX_SIMULATION_MONTHS) {
    isCapped = true;
  }

  const finalTotalInterest = Number(cumulativeInterest.toFixed(2));
  const finalTotalPrincipal = Number(initialTotalBalance.toFixed(2));
  const totalPaid = Number((finalTotalInterest + finalTotalPrincipal).toFixed(2));
  const yearsToPayoff = (month / 12).toFixed(1);

  const debtSummary = activeDebts.map((d) => ({
    id: d.id,
    name: d.name,
    originalBalance: d.originalBalance,
    apr: d.apr,
    minPayment: d.minPayment,
    paidOffMonth: d.paidOffMonth || (isCapped ? MAX_SIMULATION_MONTHS : month),
    paidOffDate: getMonthLabel(d.paidOffMonth || (isCapped ? MAX_SIMULATION_MONTHS : month), startDate),
    totalInterestPaid: Number(d.totalInterestPaid.toFixed(2))
  }));

  return {
    strategy,
    totalMonths: month,
    yearsToPayoff,
    payoffDate: getMonthLabel(month, startDate),
    totalInterestPaid: finalTotalInterest,
    totalPrincipalPaid: finalTotalPrincipal,
    totalPaid,
    isCapped,
    monthlySchedule,
    debtSummary
  };
}

/**
 * Compare Avalanche, Snowball, and Baseline strategies head-to-head.
 */
function runFullSimulation(rawDebts, extraMonthlyPayment = 0, startDate = new Date()) {
  const avalanche = simulateDebtPayoff(rawDebts, extraMonthlyPayment, 'avalanche', startDate);
  const snowball = simulateDebtPayoff(rawDebts, extraMonthlyPayment, 'snowball', startDate);
  const baseline = simulateDebtPayoff(rawDebts, 0, 'baseline', startDate);
  const traps = analyzeDebtTraps(rawDebts);

  const avalancheInterestSaved = Math.max(0, baseline.totalInterestPaid - avalanche.totalInterestPaid);
  const avalancheMonthsSaved = Math.max(0, baseline.totalMonths - avalanche.totalMonths);

  const snowballInterestSaved = Math.max(0, baseline.totalInterestPaid - snowball.totalInterestPaid);
  const snowballMonthsSaved = Math.max(0, baseline.totalMonths - snowball.totalMonths);

  const avalancheAdvantageOverSnowball = Number((snowball.totalInterestPaid - avalanche.totalInterestPaid).toFixed(2));

  const maxTimelineMonths = Math.min(
    Math.max(avalanche.totalMonths, snowball.totalMonths, baseline.totalMonths),
    360
  );

  const chartData = [];
  const avalancheMap = new Map(avalanche.monthlySchedule.map((s) => [s.month, s.totalBalance]));
  const snowballMap = new Map(snowball.monthlySchedule.map((s) => [s.month, s.totalBalance]));
  const baselineMap = new Map(baseline.monthlySchedule.map((s) => [s.month, s.totalBalance]));

  const step = maxTimelineMonths > 60 ? Math.ceil(maxTimelineMonths / 60) : 1;

  for (let m = 0; m <= maxTimelineMonths; m += step) {
    chartData.push({
      month: m,
      date: getMonthLabel(m, startDate),
      avalanche: avalancheMap.has(m) ? avalancheMap.get(m) : 0,
      snowball: snowballMap.has(m) ? snowballMap.get(m) : 0,
      baseline: baselineMap.has(m) ? baselineMap.get(m) : 0
    });
  }

  if (chartData.length > 0 && chartData[chartData.length - 1].month !== maxTimelineMonths && maxTimelineMonths > 0) {
    chartData.push({
      month: maxTimelineMonths,
      date: getMonthLabel(maxTimelineMonths, startDate),
      avalanche: avalancheMap.get(maxTimelineMonths) || 0,
      snowball: snowballMap.get(maxTimelineMonths) || 0,
      baseline: baselineMap.get(maxTimelineMonths) || 0
    });
  }

  const totalBalance = rawDebts.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
  const totalMinPayment = rawDebts.reduce((sum, d) => sum + (Number(d.minPayment) || 0), 0);
  const weightedApr =
    totalBalance > 0
      ? rawDebts.reduce((sum, d) => sum + (Number(d.balance) || 0) * (Number(d.apr) || 0), 0) / totalBalance
      : 0;

  return {
    portfolioMetrics: {
      totalBalance: Number(totalBalance.toFixed(2)),
      totalMinPayment: Number(totalMinPayment.toFixed(2)),
      currentMonthlySpend: Number((totalMinPayment + (Number(extraMonthlyPayment) || 0)).toFixed(2)),
      weightedApr: Number(weightedApr.toFixed(2)),
      debtCount: rawDebts.length,
      hasTrappedDebts: traps.some((t) => t.isTrapped)
    },
    trappedDebts: traps.filter((t) => t.isTrapped),
    allDebtsAnalysis: traps,
    avalanche: {
      ...avalanche,
      interestSavedVsBaseline: Number(avalancheInterestSaved.toFixed(2)),
      monthsSavedVsBaseline: avalancheMonthsSaved
    },
    snowball: {
      ...snowball,
      interestSavedVsBaseline: Number(snowballInterestSaved.toFixed(2)),
      monthsSavedVsBaseline: snowballMonthsSaved
    },
    baseline,
    comparison: {
      avalancheAdvantageOverSnowball,
      recommended: avalanche.totalInterestPaid <= snowball.totalInterestPaid ? 'avalanche' : 'snowball'
    },
    chartData
  };
}

/**
 * Refinancing Amortization Calculator
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Calculates loan consolidation metrics and compares against current waterfall plan.
 */
function evaluateRefinance(debts = [], newApr = 10.5, durationMonths = 36, feePct = 1.5, currentStrategy = 'avalanche', extraPayment = 0) {
  const totalPrincipal = debts.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
  const feePercentage = Math.max(0, Number(feePct) || 0);
  const originationFee = totalPrincipal * (feePercentage / 100);
  const totalLoanAmount = totalPrincipal + originationFee; // Financed principal with fee

  const annualRate = Math.max(0, Number(newApr) || 0);
  const n = Math.max(1, parseInt(durationMonths, 10) || 36);
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment = 0;
  if (totalLoanAmount <= 0) {
    monthlyPayment = 0;
  } else if (monthlyRate === 0) {
    monthlyPayment = totalLoanAmount / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    monthlyPayment = totalLoanAmount * ((monthlyRate * factor) / (factor - 1));
  }

  const totalAmountPaid = monthlyPayment * n;
  const totalInterestPaid = Math.max(0, totalAmountPaid - totalLoanAmount);
  const totalCost = totalInterestPaid + originationFee;

  // Baseline current plan comparison
  const currentPlan = simulateDebtPayoff(debts, extraPayment, currentStrategy);
  const netSavings = currentPlan.totalInterestPaid - totalCost;
  const currentMonthlyMin = debts.reduce((sum, d) => sum + (Number(d.minPayment) || 0), 0);
  const monthlySavings = currentMonthlyMin - monthlyPayment;

  // Monthly breakdown amortization table
  const amortizationSchedule = [];
  let remainingBalance = totalLoanAmount;
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let m = 1; m <= n; m++) {
    const interestCharge = remainingBalance * monthlyRate;
    const principalCharge = Math.min(remainingBalance, monthlyPayment - interestCharge);
    remainingBalance = Math.max(0, remainingBalance - principalCharge);
    cumInterest += interestCharge;
    cumPrincipal += principalCharge;

    amortizationSchedule.push({
      month: m,
      payment: Number(monthlyPayment.toFixed(2)),
      principal: Number(principalCharge.toFixed(2)),
      interest: Number(interestCharge.toFixed(2)),
      balance: Number(remainingBalance.toFixed(2)),
      cumulativeInterest: Number(cumInterest.toFixed(2))
    });
  }

  // Break-even calculation in months
  const monthlyInterestSavingsEstimate =
    debts.length > 0
      ? (debts.reduce((sum, d) => sum + (d.balance * (d.apr / 100 / 12)), 0)) - (totalLoanAmount * monthlyRate)
      : 0;

  const breakEvenMonths =
    originationFee > 0 && monthlyInterestSavingsEstimate > 0
      ? Math.ceil(originationFee / monthlyInterestSavingsEstimate)
      : 0;

  return {
    refinanceMetrics: {
      totalPrincipal: Number(totalPrincipal.toFixed(2)),
      originationFee: Number(originationFee.toFixed(2)),
      feePct: feePercentage,
      totalLoanAmount: Number(totalLoanAmount.toFixed(2)),
      rate: annualRate,
      durationMonths: n,
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalInterestPaid: Number(totalInterestPaid.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalAmountPaid: Number(totalAmountPaid.toFixed(2)),
      breakEvenMonths
    },
    comparisonWithCurrent: {
      currentStrategy,
      currentTotalInterest: currentPlan.totalInterestPaid,
      currentPayoffMonths: currentPlan.totalMonths,
      currentMonthlyMin: Number(currentMonthlyMin.toFixed(2)),
      netSavings: Number(netSavings.toFixed(2)),
      monthlySavings: Number(monthlySavings.toFixed(2)),
      isWorthwhile: netSavings > 0
    },
    amortizationSchedule
  };
}

module.exports = {
  simulateDebtPayoff,
  simulatePayoff: simulateDebtPayoff,
  runFullSimulation,
  evaluateRefinance,
  calculateRefinance: evaluateRefinance,
  analyzeDebtTraps,
  getMonthLabel,
  MAX_SIMULATION_MONTHS
};
