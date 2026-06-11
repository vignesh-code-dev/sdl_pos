/**
 * Utility service to handle HTML invoice generation and download.
 */

export const calculateLineTotal = (item) => {
  const base = item.rate * item.quantity;
  const afterDiscount = base - (base * (item.discount / 100));
  const taxAmount = afterDiscount * (item.tax / 100);
  return afterDiscount + taxAmount;
};

export const downloadInvoiceHTML = (invoice, showToast) => {
  if (!invoice) return;
  
  // Calculate returns refund and items
  const returnsRefund = invoice.returns ? invoice.returns.reduce((sum, r) => sum + r.refundAmount, 0) : 0;
  const totalItems = invoice.items ? invoice.items.length : 0;
  const totalQty = invoice.items ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = invoice.subtotal || 0;
  const totalLineDiscount = invoice.totalLineDiscount || 0;
  const globalDiscount = invoice.globalDiscount || 0;
  const totalTax = invoice.totalTax || 0;
  const grandTotal = invoice.grandTotal || 0;
  const paidAmount = parseFloat(invoice.paidAmount !== undefined ? invoice.paidAmount : invoice.grandTotal);
  const balance = parseFloat(invoice.balance !== undefined ? invoice.balance : 0);

  let itemsRowsHTML = "";
  invoice.items.forEach((line, idx) => {
    const finalLineAmt = (line.rate * line.quantity) - ((line.rate * line.quantity) * (line.discount / 100));
    itemsRowsHTML += `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px 4px; text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 8px 4px; text-align: left;">
          <div style="font-weight: 500; color: #1f2937;">${line.name}</div>
          <div style="font-size: 11px; color: #9ca3af; font-family: monospace;">${line.sku}</div>
          ${line.discount > 0 ? `<span style="font-size: 10px; background: #fef2f2; color: #ef4444; padding: 1px 4px; border-radius: 4px;">${line.discount}% Discount</span>` : ''}
        </td>
        <td style="padding: 8px 4px; text-align: center; color: #374151;">${line.quantity}</td>
        <td style="padding: 8px 4px; text-align: center; color: #4b5563;">${line.unit || "pcs"}</td>
        <td style="padding: 8px 4px; text-align: right; color: #4b5563;">₹${line.rate.toFixed(1)}</td>
        <td style="padding: 8px 4px; text-align: right; font-weight: bold; color: #111827;">₹${finalLineAmt.toFixed(1)}</td>
      </tr>
    `;
  });

  let returnsHTML = "";
  if (invoice.returns && invoice.returns.length > 0) {
    returnsHTML += `
      <div style="margin-top: 16px; border: 1px dashed #f43f5e; border-radius: 8px; padding: 12px; background: #fff1f2;">
        <div style="font-size: 12px; font-weight: bold; color: #e11d48; text-transform: uppercase; margin-bottom: 8px;">Returned Items & Refund Logs</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid #fecdd3; color: #9f1239; font-weight: bold;">
              <th style="padding: 4px; text-align: left;">Item Sku / Name</th>
              <th style="padding: 4px; text-align: center;">Qty</th>
              <th style="padding: 4px; text-align: right;">Refunded</th>
            </tr>
          </thead>
          <tbody>
    `;
    invoice.returns.forEach((ret) => {
      returnsHTML += `
        <tr style="border-bottom: 1px dashed #ffe4e6; color: #be123c;">
          <td style="padding: 6px 4px; text-align: left;">
            <div>${ret.name}</div>
            <div style="font-size: 9px; opacity: 0.8;">${ret.sku}</div>
          </td>
          <td style="padding: 6px 4px; text-align: center;">${ret.quantityReturned}</td>
          <td style="padding: 6px 4px; text-align: right; font-weight: bold;">₹${ret.refundAmount.toFixed(1)}</td>
        </tr>
      `;
    });
    returnsHTML += `
          </tbody>
        </table>
      </div>
    `;
  }

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
  <div class="wrapper">
    <div class="header">
      <div class="store-name">${invoice.shopName || "SDL BillMate POS Supermarket"}</div>
      <div class="meta-text">Address: Retail Store, City, State</div>
      <div class="meta-text">Contact: +91-XXXXXXXXXX | GSTIN: 27AABCT1234A2Z0</div>
      <div style="border-top:1px dashed #d1d5db; margin-top:8px; padding-top:4px;" class="meta-text">Tax Invoice / Retail Receipt</div>
    </div>

    <div class="section-border">
      <div class="flex-row">
        <span>Invoice Number: <strong>${invoice.id}</strong></span>
        <span>Date / Time: ${invoice.date}</span>
      </div>
      <div class="flex-row">
        <span>Customer Name: ${invoice.customerName || "Walk-in"}</span>
        <span>Payment Mode: <strong>${invoice.paymentMethod}</strong></span>
      </div>
      <div class="flex-row">
        <span>Cashier: ${invoice.operator || "Admin"}</span>
        <span>Status: <strong style="color: ${invoice.status === 'Cancelled' ? '#dc2626' : '#10b981'}; text-transform: uppercase;">${invoice.status || "Active"}</strong></span>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr style="border-bottom: 2px solid #374151; font-weight: bold; color: #4b5563;">
          <th style="padding: 6px 4px; text-align: center; width: 32px;">#</th>
          <th style="padding: 6px 4px; text-align: left;">Particulars</th>
          <th style="padding: 6px 4px; text-align: center; width: 40px;">Qty</th>
          <th style="padding: 6px 4px; text-align: center; width: 40px;">Unit</th>
          <th style="padding: 6px 4px; text-align: right; width: 48px;">Rate</th>
          <th style="padding: 6px 4px; text-align: right; width: 56px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHTML}
      </tbody>
    </table>

    ${returnsHTML}

    <div class="summary-section">
      <div class="summary-row" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 4px;">
        <span>Total Items: <strong>${totalItems}</strong></span>
        <span>Total Quantity: <strong>${totalQty}</strong></span>
      </div>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      ${totalLineDiscount > 0 ? `
      <div class="summary-row" style="color: #dc2626;">
        <span>Item Discount:</span>
        <span>-₹${totalLineDiscount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${globalDiscount > 0 ? `
      <div class="summary-row" style="color: #dc2626;">
        <span>Invoice Discount:</span>
        <span>-₹${globalDiscount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="summary-row">
        <span>CGST (9%):</span>
        <span>₹${(totalTax / 2).toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>SGST (9%):</span>
        <span>₹${(totalTax / 2).toFixed(2)}</span>
      </div>
      <div class="summary-row" style="border-top: 1px solid #d1d5db; margin-top: 6px; padding-top: 6px; font-weight: bold; font-size: 13px;">
        <span>Grand Total:</span>
        <span>₹${grandTotal.toFixed(2)}</span>
      </div>
      <div class="summary-row" style="font-weight: bold; color: #047857;">
        <span>Amount Paid:</span>
        <span>₹${paidAmount.toFixed(2)}</span>
      </div>
      ${balance > 0 ? `
      <div class="summary-row" style="font-weight: bold; color: #b91c1c;">
        <span>Outstanding Balance:</span>
        <span>₹${balance.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>

    <div class="thankyou-box">
      <p style="font-size: 10px; color: #6b7280; margin-bottom: 6px;">Goods once sold will not be taken back unless defective.</p>
      <div class="thankyou-msg">THANK YOU, VISIT US AGAIN!</div>
      <p style="font-size: 10px; color: #9ca3af; margin-top: 8px;">*** SDL BillMate POS Automated Invoice ***</p>
    </div>
  </div>
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

export const printInvoice = (invoice) => {
  if (!invoice) return;
  
  const totalItems = invoice.items ? invoice.items.length : 0;
  const totalQty = invoice.items ? invoice.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = invoice.subtotal || 0;
  const totalLineDiscount = invoice.totalLineDiscount || 0;
  const globalDiscount = invoice.globalDiscount || 0;
  const totalTax = invoice.totalTax || 0;
  const grandTotal = invoice.grandTotal || 0;
  const paidAmount = parseFloat(invoice.paidAmount !== undefined ? invoice.paidAmount : invoice.grandTotal);
  const balance = parseFloat(invoice.balance !== undefined ? invoice.balance : 0);

  let itemsRowsHTML = "";
  invoice.items.forEach((line, idx) => {
    const finalLineAmt = (line.rate * line.quantity) - ((line.rate * line.quantity) * (line.discount / 100));
    itemsRowsHTML += `
      <tr style="border-bottom: 1px dashed #e5e7eb;">
        <td style="padding: 6px 4px; text-align: center; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 6px 4px; text-align: left;">
          <div style="font-weight: bold; color: #111827;">${line.name}</div>
          <div style="font-size: 10px; color: #6b7280; font-family: monospace;">${line.sku}</div>
          ${line.discount > 0 ? `<span style="font-size: 9px; background: #fee2e2; color: #ef4444; padding: 1px 4px; border-radius: 4px; font-weight: bold;">${line.discount}% OFF</span>` : ''}
        </td>
        <td style="padding: 6px 4px; text-align: center; font-weight: bold; color: #1f2937;">${line.quantity}</td>
        <td style="padding: 6px 4px; text-align: center; color: #4b5563;">${line.unit || "pcs"}</td>
        <td style="padding: 6px 4px; text-align: right; color: #4b5563; font-family: monospace;">₹${line.rate.toFixed(2)}</td>
        <td style="padding: 6px 4px; text-align: right; font-weight: bold; color: #111827; font-family: monospace;">₹${finalLineAmt.toFixed(2)}</td>
      </tr>
    `;
  });

  let returnsHTML = "";
  if (invoice.returns && invoice.returns.length > 0) {
    returnsHTML += `
      <div style="margin-top: 12px; border: 1px dashed #ef4444; border-radius: 8px; padding: 10px; background: #fef2f2;">
        <div style="font-size: 11px; font-weight: bold; color: #dc2626; text-transform: uppercase; margin-bottom: 6px;">Returned Items & Refund Logs</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="border-bottom: 1px solid #fecdd3; color: #9f1239; font-weight: bold;">
              <th style="padding: 4px; text-align: left;">Item Sku / Name</th>
              <th style="padding: 4px; text-align: center;">Qty</th>
              <th style="padding: 4px; text-align: right;">Refunded</th>
            </tr>
          </thead>
          <tbody>
    `;
    invoice.returns.forEach((ret) => {
      returnsHTML += `
        <tr style="border-bottom: 1px dashed #fecdd3; color: #9f1239;">
          <td style="padding: 4px; text-align: left;">
            <div style="font-weight: bold;">${ret.name}</div>
            <div style="font-size: 8px; opacity: 0.8; font-family: monospace;">${ret.sku}</div>
          </td>
          <td style="padding: 4px; text-align: center; font-weight: bold;">${ret.quantityReturned}</td>
          <td style="padding: 4px; text-align: right; font-weight: bold; font-family: monospace;">₹${ret.refundAmount.toFixed(2)}</td>
        </tr>
      `;
    });
    returnsHTML += `
          </tbody>
        </table>
      </div>
    `;
  }

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
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 15px;
      background-color: white;
      color: #1f2937;
      font-size: 11px;
      line-height: 1.4;
    }
    .wrapper {
      max-width: 100%;
      margin: 0 auto;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .store-name {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      color: #111827;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .meta-text {
      font-size: 10px;
      color: #4b5563;
      margin-bottom: 2px;
    }
    .section-border {
      padding: 8px 0;
      margin: 10px 0;
      font-size: 10px;
      color: #374151;
    }
    .flex-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 10px 0;
    }
    .summary-section {
      padding: 10px;
      background-color: #f9fafb;
      border-radius: 6px;
      font-size: 10px;
      margin-bottom: 10px;
      border: 1px solid #f3f4f6;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .thankyou-box {
      text-align: center;
      margin-top: 15px;
    }
    .thankyou-msg {
      font-size: 11px;
      color: #065f46;
      background: #ecfdf5;
      padding: 6px;
      font-weight: bold;
      border-radius: 6px;
      text-transform: uppercase;
    }
  </style>
</head>
<body onload="window.print()">
  <div class="wrapper">
    <div class="text-center">
      <div class="store-name">${invoice.shopName || "SDL BillMate POS Supermarket"}</div>
      <div class="meta-text">Address: Retail Store, City, State</div>
      <div class="meta-text">Contact: +91-XXXXXXXXXX | GSTIN: 27AABCT1234A2Z0</div>
      <div style="border-top:1px dashed #d1d5db; margin-top:6px; padding-top:4px; font-weight: bold;" class="meta-text">TAX INVOICE / RETAIL RECEIPT</div>
    </div>

    <div class="section-border">
      <div class="flex-row">
        <span>Invoice No: <strong>${invoice.id}</strong></span>
        <span>Date: ${invoice.date}</span>
      </div>
      <div class="flex-row">
        <span>Customer: <strong>${invoice.customerName || "Walk-in"}</strong></span>
        <span>Mode: <strong>${invoice.paymentMethod}</strong></span>
      </div>
      <div class="flex-row">
        <span>Cashier: ${invoice.operator || "Admin"}</span>
        <span>Status: <strong style="color: ${invoice.status === 'Cancelled' ? '#ef4444' : '#10b981'};">${invoice.status || "ACTIVE"}</strong></span>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr style="border-bottom: 1px solid #111827; font-weight: bold; color: #111827; font-size: 10px;">
          <th style="padding: 4px; text-align: center; width: 25px;">#</th>
          <th style="padding: 4px; text-align: left;">Particulars</th>
          <th style="padding: 4px; text-align: center; width: 30px;">Qty</th>
          <th style="padding: 4px; text-align: center; width: 30px;">Unit</th>
          <th style="padding: 4px; text-align: right; width: 45px;">Rate</th>
          <th style="padding: 4px; text-align: right; width: 55px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHTML}
      </tbody>
    </table>

    ${returnsHTML}

    <div class="summary-section">
      <div class="summary-row" style="border-bottom: 1px dashed #d1d5db; padding-bottom: 4px; margin-bottom: 4px;">
        <span>Total Items: <strong>${totalItems}</strong></span>
        <span>Total Qty: <strong>${totalQty}</strong></span>
      </div>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span class="font-bold">₹${subtotal.toFixed(2)}</span>
      </div>
      ${totalLineDiscount > 0 ? `
      <div class="summary-row" style="color: #ef4444;">
        <span>Line Discount:</span>
        <span class="font-bold">-₹${totalLineDiscount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${globalDiscount > 0 ? `
      <div class="summary-row" style="color: #ef4444;">
        <span>Invoice Discount:</span>
        <span class="font-bold">-₹${globalDiscount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="summary-row">
        <span>CGST (9%):</span>
        <span>₹${(totalTax / 2).toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>SGST (9%):</span>
        <span>₹${(totalTax / 2).toFixed(2)}</span>
      </div>
      <div class="summary-row" style="border-top: 1px solid #111827; margin-top: 5px; padding-top: 5px; font-weight: bold; font-size: 12px; color: #111827;">
        <span>Grand Total:</span>
        <span>₹${grandTotal.toFixed(2)}</span>
      </div>
      <div class="summary-row" style="font-weight: bold; color: #065f46;">
        <span>Paid Amount:</span>
        <span>₹${paidAmount.toFixed(2)}</span>
      </div>
      ${balance > 0 ? `
      <div class="summary-row" style="font-weight: bold; color: #b91c1c;">
        <span>Balance Due:</span>
        <span>₹${balance.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>

    <div class="thankyou-box">
      <p style="font-size: 9px; color: #4b5563; margin-bottom: 4px;">Goods once sold will not be taken back.</p>
      <div class="thankyou-msg">THANK YOU, VISIT US AGAIN!</div>
    </div>
  </div>
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

