import React from 'react';
import { calculateLineAfterDiscount } from '../../utils/invoiceCalculations';

export const FullInvoice = ({ invoice }) => {
  const totalItems = invoice.items ? invoice.items.length : 0;
  const totalQty = invoice.items ? invoice.items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) : 0;
  
  const hasMixedUnits = (() => {
    if (!invoice.items || invoice.items.length === 0) return false;
    const firstUnit = (invoice.items[0].unit || "pcs").toLowerCase().trim();
    return invoice.items.some(item => {
      const u = (item.unit || "pcs").toLowerCase().trim();
      return u !== firstUnit;
    });
  })();

  const subtotal = invoice.subtotal || 0;
  const totalLineDiscount = invoice.totalLineDiscount || 0;
  const globalDiscount = invoice.globalDiscount || 0;
  const totalTax = invoice.totalTax || 0;
  const grandTotal = invoice.grandTotal || 0;
  const paidAmount = parseFloat(invoice.paidAmount !== undefined ? invoice.paidAmount : invoice.grandTotal);
  const balance = parseFloat(invoice.balance !== undefined ? invoice.balance : 0);

  return (
    <div className="wrapper">
      <div className="header">
        <div className="store-name">{invoice.shopName || "SDL BillMate POS Supermarket"}</div>
        <div className="meta-text">Address: Retail Store, City, State</div>
        <div className="meta-text">Contact: +91-XXXXXXXXXX | GSTIN: 27AABCT1234A2Z0</div>
        <div style={{ borderTop: '1px dashed #d1d5db', marginTop: '8px', paddingTop: '4px' }} className="meta-text">
          Tax Invoice / Retail Receipt
        </div>
      </div>

      <div className="section-border">
        <div className="flex-row">
          <span>Invoice Number: <strong>{invoice.id}</strong></span>
          <span>Date / Time: {invoice.date}</span>
        </div>
        <div className="flex-row">
          <span>Customer Name: {invoice.customerName || "Walk-in"}</span>
          <span>Payment Mode: <strong>{invoice.paymentMethod}</strong></span>
        </div>
        <div className="flex-row">
          <span>Cashier: {invoice.operator || "Admin"}</span>
          <span>
            Status:{" "}
            <strong style={{ color: invoice.status === 'Cancelled' ? '#dc2626' : '#10b981', textTransform: 'uppercase' }}>
              {invoice.status || "Active"}
            </strong>
          </span>
        </div>
      </div>

      <table className="items-table">
        <thead>
          <tr style={{ borderBottom: '1px solid #374151', fontWeight: 'bold', color: '#4b5563' }}>
            <th style={{ padding: '6px 4px', textAlign: 'center', width: '32px' }}>#</th>
            <th style={{ padding: '6px 4px', textAlign: 'left' }}>Particulars</th>
            <th style={{ padding: '6px 4px', textAlign: 'center', width: '40px' }}>Qty</th>
            <th style={{ padding: '6px 4px', textAlign: 'center', width: '40px' }}>Unit</th>
            <th style={{ padding: '6px 4px', textAlign: 'right', width: '48px' }}>Rate</th>
            <th style={{ padding: '6px 4px', textAlign: 'right', width: '56px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.map((line, idx) => {
            const finalLineAmt = calculateLineAfterDiscount(line);
            return (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 4px', textAlign: 'center', fontFamily: 'monospace' }}>{idx + 1}</td>
                <td style={{ padding: '8px 4px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>{line.name}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>{line.sku}</div>
                  {line.discount > 0 && (
                    <span style={{ fontSize: '10px', background: '#fef2f2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px' }}>
                      {line.discount}% Discount
                    </span>
                  )}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'center', color: '#374151' }}>{Number(parseFloat(line.quantity).toFixed(3))}</td>
                <td style={{ padding: '8px 4px', textAlign: 'center', color: '#4b5563' }}>{line.unit || "pcs"}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', color: '#4b5563' }}>₹{line.rate.toFixed(1)}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>₹{finalLineAmt.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {invoice.returns && invoice.returns.length > 0 && (
        <div style={{ marginTop: '16px', border: '1px dashed #f43f5e', borderRadius: '8px', padding: '12px', background: '#fff1f2' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e11d48', textTransform: 'uppercase', marginBottom: '8px' }}>
            Returned Items & Refund Logs
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #fecdd3', color: '#9f1239', fontWeight: 'bold' }}>
                <th style={{ padding: '4px', textAlign: 'left' }}>Item Sku / Name</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '4px', textAlign: 'right' }}>Refunded</th>
              </tr>
            </thead>
            <tbody>
              {invoice.returns.map((ret, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dashed #ffe4e6', color: '#be123c' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'left' }}>
                    <div>{ret.name}</div>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>{ret.sku}</div>
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{ret.quantityReturned}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>₹{ret.refundAmount.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="summary-section">
        <div className="summary-row" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '4px' }}>
          <span>Total Items: <strong>{totalItems}</strong></span>
          {!hasMixedUnits && (
            <span>Total Quantity: <strong>{Number(totalQty.toFixed(3))}</strong></span>
          )}
        </div>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {totalLineDiscount > 0 && (
          <div className="summary-row" style={{ color: '#dc2626' }}>
            <span>Item Discount:</span>
            <span>-₹{totalLineDiscount.toFixed(2)}</span>
          </div>
        )}
        {globalDiscount > 0 && (
          <div className="summary-row" style={{ color: '#dc2626' }}>
            <span>Invoice Discount:</span>
            <span>-₹{globalDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row">
          <span>CGST (9%):</span>
          <span>₹{(totalTax / 2).toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>SGST (9%):</span>
          <span>₹{(totalTax / 2).toFixed(2)}</span>
        </div>
        <div className="summary-row" style={{ borderTop: '1px solid #d1d5db', marginTop: '6px', paddingTop: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          <span>Grand Total Due:</span>
          <span>₹{Number(grandTotal || 0).toFixed(2)}</span>
        </div>
        <div className="summary-row" style={{ fontWeight: 'bold', color: '#047857' }}>
          <span>Amount Tendered Paid:</span>
          <span>₹{Number(paidAmount || 0).toFixed(2)}</span>
        </div>
        
        {paidAmount > grandTotal && (
          <div className="summary-row" style={{ color: '#1f2937' }}>
            <span>Change Returned:</span>
            <span>₹{Number(paidAmount - grandTotal).toFixed(2)}</span>
          </div>
        )}
        
        <div className="summary-row" style={{ fontWeight: 'bold', color: balance > 0 ? '#b91c1c' : '#4b5563' }}>
          <span>Outstanding Balance:</span>
          <span>₹{Number(balance || 0).toFixed(2)}</span>
        </div>
        </div>
      <div className="thankyou-box">
        <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px' }}>Goods once sold will not be taken back unless defective.</p>
        <div className="thankyou-msg">THANK YOU, VISIT US AGAIN!</div>
        <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>*** SDL BillMate POS Automated Invoice ***</p>
      </div>
    </div>
  );
};

export default FullInvoice;
