/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const CASH_TRANSACTION_KEYS = {
  NAME: 'name',
  TYPE: 'title',
  REASON: 'title',
};

export const CASH_TRANSACTION_CODES = {
  CASH_IN: 'cash_in',
  CASH_OUT: ' cash_out',
};

export const CASH_TRANSACTION_TYPES = [
  { [CASH_TRANSACTION_KEYS.TYPE]: 'Cash in', code: CASH_TRANSACTION_CODES.CASH_IN },
  { [CASH_TRANSACTION_KEYS.TYPE]: 'Cash out', code: CASH_TRANSACTION_CODES.CASH_OUT },
];
