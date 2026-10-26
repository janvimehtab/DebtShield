/**
 * DebtShield Express Routes
 */

const express = require('express');
const { body } = require('express-validator');
const debtController = require('../controllers/debtController');

const router = express.Router();

/**
 * Health check route
 */
router.get('/health', debtController.getHealth);

/**
 * Simulation validation rules
 */
const simulationValidation = [
  body('debts').isArray({ min: 1 }).withMessage('Debts must be an array with at least one item'),
  body('debts.*.name').isString().trim().notEmpty().withMessage('Debt name is required'),
  body('debts.*.balance').isFloat({ min: 0 }).withMessage('Debt balance must be a non-negative number'),
  body('debts.*.apr').isFloat({ min: 0, max: 150 }).withMessage('Debt APR must be between 0% and 150%'),
  body('debts.*.minPayment').isFloat({ min: 0 }).withMessage('Minimum payment must be a non-negative number'),
  body('extraPayment').optional().isFloat({ min: 0 }).withMessage('Extra payment must be a non-negative number'),
  body('strategy').optional().isIn(['avalanche', 'snowball']).withMessage('Strategy must be avalanche or snowball')
];

/**
 * Refinance validation rules
 */
const refinanceValidation = [
  body('debts').isArray({ min: 1 }).withMessage('Debts must be an array with at least one item'),
  body('rate').isFloat({ min: 0, max: 100 }).withMessage('Consolidation loan interest rate must be between 0 and 100%'),
  body('durationMonths').isInt({ min: 1, max: 360 }).withMessage('Duration must be between 1 and 360 months'),
  body('feePct').optional().isFloat({ min: 0, max: 20 }).withMessage('Origination fee must be between 0% and 20%'),
  body('currentStrategy').optional().isIn(['avalanche', 'snowball']),
  body('extraPayment').optional().isFloat({ min: 0 })
];

router.post('/simulate', simulationValidation, debtController.simulateDebts);
router.post('/refinance', refinanceValidation, debtController.refinanceDebts);

module.exports = router;
