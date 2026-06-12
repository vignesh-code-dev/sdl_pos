import React from 'react';
import { renderToString } from 'react-dom/server';
import ThermalReceipt from '../components/invoices/ThermalReceipt';

/**
 * Utility to print receipts via the browser's printing popup.
 */
export const printInvoice = (invoice) => {
  if (!invoice) return;

  const htmlBody = renderToString(<ThermalReceipt invoice={invoice} />);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invoice.id}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    
    html, body {
      width: 80mm;
      margin: 0;
      padding: 0;
      background-color: white;
      color: #000000;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      padding: 6mm 4mm 10mm 4mm;
      box-sizing: border-box;
    }

    .wrapper {
      width: 100%;
      box-sizing: border-box;
    }

    @media screen {
      html {
        background-color: #f3f4f6;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px 10px;
        height: auto;
      }
      body {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
        padding: 8mm 6mm;
      }
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    
    .store-name {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    
    .meta-text {
      font-size: 10px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    
    .section-border {
      border-top: 1px dashed #000000;
      border-bottom: 1px dashed #000000;
      padding: 6px 0;
      margin: 8px 0;
      font-size: 10px;
    }
    
    .flex-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2.5px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 8px 0;
    }

    .items-table th {
      border-bottom: 1px solid #000000;
      padding: 4px 1px;
      text-transform: uppercase;
      font-weight: bold;
    }

    .items-table td {
      padding: 4px 1px;
      vertical-align: top;
    }
    
    .summary-section {
      padding: 6px 0;
      font-size: 11px;
      margin-bottom: 8px;
      border-top: 1px dashed #000000;
      background-color: transparent !important;
      border-radius: 0;
      border-bottom: none;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    
    .thankyou-box {
      text-align: center;
      margin-top: 12px;
      border-top: 1px dashed #000000;
      padding-top: 8px;
    }
    
    .thankyou-msg {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      background-color: transparent !important;
      border: none !important;
      padding: 0;
      margin-top: 4px;
    }
  </style>
</head>
<body onload="window.print()">
  ${htmlBody}
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  try {
    const printWindow = window.open(url, "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked or failed to load");
    }
  } catch (err) {
    // Elegant fallback: create a link and click it to open in a new tab
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
export default printInvoice;
