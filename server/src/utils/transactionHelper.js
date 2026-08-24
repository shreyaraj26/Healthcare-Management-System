// ============================================================
// UTIL — MongoDB Transaction Helper (Supports Standalone & Replica Set)
// ============================================================
'use strict';

const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Executes an operation inside a MongoDB transaction if supported (replica set),
 * or gracefully runs sequentially without transaction on standalone MongoDB instances.
 *
 * @param {Function} operation - Async function receiving (session | null)
 * @returns {Promise<any>} Result of operation
 */
const withOptionalTransaction = async (operation) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (err) {
    if (
      err.message &&
      (err.message.includes('replica set') ||
        err.message.includes('Transaction numbers') ||
        err.message.includes('Transactions are not supported'))
    ) {
      logger.warn('[TransactionHelper] Standalone MongoDB detected — running operation without transaction session.');
      return await operation(null);
    }
    throw err;
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (_) {}
    }
  }
};

module.exports = { withOptionalTransaction };
