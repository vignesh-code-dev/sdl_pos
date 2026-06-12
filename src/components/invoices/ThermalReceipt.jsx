import React from 'react';
import { calculateLineAfterDiscount } from '../../utils/invoiceCalculations';

export const ThermalReceipt = ({ invoice }) => {
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
      <div className="text-center">
        <div className="store-name">{invoice.shopName || "SDL BillMate POS Supermarket"}</div>
        <div className="meta-text">Retail Store, City, State</div>
        <div className="meta-text">Contact: +91-XXXXXXXXXX | GSTIN: 27AABCT1234A2Z0</div>
        <div style={{ borderTop: '1px dashed #000000', marginTop: '6px', paddingTop: '4px', fontWeight: 'bold' }} className="meta-text">
          TAX INVOICE / RETAIL RECEIPT
        </div>
      </div>

      <div className="section-border">
        <div className="flex-row">
          <span>Invoice No: <strong>{invoice.id}</strong></span>
          <span>Date: {invoice.date}</span>
        </div>
        <div className="flex-row">
          <span>Customer: <strong>{invoice.customerName || "Walk-in"}</strong></span>
          <span>Mode: <strong>{invoice.paymentMethod}</strong></span>
        </div>
        <div className="flex-row">
          <span>Cashier: {invoice.operator || "Admin"}</span>
          <span>
            Status: <strong style={{ textTransform: 'uppercase' }}>{invoice.status || "ACTIVE"}</strong>
          </span>
        </div>
      </div>

      <table className="items-table">
        <thead>
          <tr style={{ borderBottom: '1px solid #000000', fontWeight: 'bold', fontSize: '10px' }}>
            <th style={{ padding: '4px 1px', textAlign: 'center', width: '25px' }}>#</th>
            <th style={{ padding: '4px 1px', textAlign: 'left' }}>Particulars</th>
            <th style={{ padding: '4px 1px', textAlign: 'center', width: '30px' }}>Qty</th>
            <th style={{ padding: '4px 1px', textAlign: 'center', width: '30px' }}>Unit</th>
            <th style={{ padding: '4px 1px', textAlign: 'right', width: '45px' }}>Rate</th>
            <th style={{ padding: '4px 1px', textAlign: 'right', width: '55px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.map((line, idx) => {
            const finalLineAmt = calculateLineAfterDiscount(line);
            return (
              <tr key={idx} style={{ borderBottom: '1px dashed #000000' }}>
                <td style={{ padding: '5px 1px', textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ padding: '5px 1px', textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold' }}>{line.name}</div>
                  <div style={{ fontSize: '9px' }}>{line.sku}</div>
                  {line.discount > 0 && (
                    <div style={{ fontSize: '9px', fontWeight: 'bold' }}>
                      [SAVINGS: {line.discount}% OFF]
                    </div>
                  )}
                </td>
                <td style={{ padding: '5px 1px', textAlign: 'center', fontWeight: 'bold' }}>{Number(parseFloat(line.quantity).toFixed(3))}</td>
                <td style={{ padding: '5px 1px', textAlign: 'center' }}>{line.unit || "pcs"}</td>
                <td style={{ padding: '5px 1px', textAlign: 'right' }}>₹{line.rate.toFixed(2)}</td>
                <td style={{ padding: '5px 1px', textAlign: 'right', fontWeight: 'bold' }}>
                  ₹{finalLineAmt.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {invoice.returns && invoice.returns.length > 0 && (
        <div style={{ marginTop: '10px', border: '1px dashed #000000', padding: '8px', background: 'none' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
            Returned Items & Refund Logs
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000000', fontWeight: 'bold' }}>
                <th style={{ padding: '3px 1px', textAlign: 'left' }}>Item Sku / Name</th>
                <th style={{ padding: '3px 1px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '3px 1px', textAlign: 'right' }}>Refunded</th>
              </tr>
            </thead>
            <tbody>
              {invoice.returns.map((ret, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dashed #000000' }}>
                  <td style={{ padding: '4px 1px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold' }}>{ret.name}</div>
                    <div style={{ fontSize: '8px' }}>{ret.sku}</div>
                  </td>
                  <td style={{ padding: '4px 1px', textAlign: 'center', fontWeight: 'bold' }}>{ret.quantityReturned}</td>
                  <td style={{ padding: '4px 1px', textAlign: 'right', fontWeight: 'bold' }}>₹{ret.refundAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="summary-section">
        <div className="summary-row" style={{ borderBottom: '1px dashed #000000', paddingBottom: '4px', marginBottom: '4px' }}>
          <span>Total Items: <strong>{totalItems}</strong></span>
          {!hasMixedUnits && (
            <span>Total Qty: <strong>{Number(totalQty.toFixed(3))}</strong></span>
          )}
        </div>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {totalLineDiscount > 0 && (
          <div className="summary-row">
            <span>Line Discount:</span>
            <span>-₹{totalLineDiscount.toFixed(2)}</span>
          </div>
        )}
        {globalDiscount > 0 && (
          <div className="summary-row">
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
        <div className="summary-row" style={{ borderTop: '1px solid #000000', marginTop: '5px', paddingTop: '5px', fontWeight: 'bold', fontSize: '12px' }}>
          <span>Grand Total:</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row" style={{ fontWeight: 'bold' }}>
          <span>Paid Amount:</span>
          <span>₹{paidAmount.toFixed(2)}</span>
        </div>
        {balance > 0 && (
          <div className="summary-row" style={{ fontWeight: 'bold' }}>
            <span>Balance Due:</span>
            <span>₹{balance.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="thankyou-box">
        <p style={{ fontSize: '9px', marginBottom: '4px' }}>Goods once sold will not be taken back.</p>
        <div className="thankyou-msg">THANK YOU, VISIT US AGAIN!</div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
