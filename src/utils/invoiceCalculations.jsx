import React from 'react';

/**
 * Centered invoice calculations for lines and summaries.
 */

// Calculate complete line total (including tax and after discount)
export const calculateLineTotal = (item) => {
  const base = item.rate * item.quantity;
  const afterDiscount = base - (base * (item.discount / 100));
  const taxAmount = afterDiscount * (item.tax / 100);
  return afterDiscount + taxAmount;
};

// Calculate line total amount (excluding tax, after discount)
export const calculateLineAfterDiscount = (item) => {
  const base = item.rate * item.quantity;
  return base - (base * (item.discount / 100));
};

// Calculate the tax portion of the line amount
export const calculateLineTaxAmount = (item) => {
  return calculateLineAfterDiscount(item) * (item.tax / 100);
};

// Calculate line base (rate * quantity)
export const calculateLineBase = (item) => {
  return item.rate * item.quantity;
};
