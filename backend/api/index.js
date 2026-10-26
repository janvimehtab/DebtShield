/**
 * Vercel Serverless Function Entry Point & Local Dev Server
 */

require('dotenv').config();
const app = require('../src/app');

const PORT = process.env.PORT || 5000;

// If executed directly (e.g. node api/index.js), start listening
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`DebtShield API running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless functions
module.exports = app;
