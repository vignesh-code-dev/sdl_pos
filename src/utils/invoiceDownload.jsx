import React from 'react';
import { renderToString } from 'react-dom/server';
import FullInvoice from '../components/invoices/FullInvoice';

/**
 * Utility to generate HTML invoice document and trigger browser download.
 */
export const downloadInvoiceHTML = (invoice, showToast) => {
  if (!invoice) return;

  const htmlBody = renderToString(<FullInvoice invoice={invoice} />);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invoice.id}</title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
      padding: 20px;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .wrapper {
      max-width: 440px;
      margin: 0 auto;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }
    .header {
      text-align: center;
      margin-bottom: 16px;
    }
    .store-name {
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      color: #111827;
      margin-bottom: 4px;
    }
    .meta-text {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .section-border {
      border-top: 1px dashed #d1d5db;
      border-bottom: 1px dashed #d1d5db;
      padding: 10px 0;
      margin: 12px 0;
      font-size: 11px;
      color: #4b5563;
      line-height: 1.5;
    }
    .flex-row {
      display: flex;
      justify-content: space-between;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin: 12px 0;
    }
    .summary-section {
      padding: 12px;
      background-color: #f9fafb;
      border-radius: 6px;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .thankyou-box {
      text-align: center;
      margin-top: 16px;
    }
    .thankyou-msg {
      font-size: 12px;
      color: #047857;
      background: #ecfdf5;
      border: 1px dashed #a7f3d0;
      padding: 8px;
      font-weight: bold;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .no-print-action {
      text-align: center;
      margin-bottom: 15px;
    }
    .btn {
      background-color: #10b981;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
    }
    .btn:hover {
      background-color: #059669;
    }
    @media print {
      .no-print-action {
        display: none !important;
      }
      body {
        background-color: white !important;
        padding: 0 !important;
      }
      .wrapper {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body onload="window.print()">
  <div class="no-print-action">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${htmlBody}
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Invoice_Receipt_${invoice.id}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (showToast) {
    showToast("Official Invoice HTML downloaded successfully!", "success");
  }
};
