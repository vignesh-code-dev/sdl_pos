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
  const change = parseFloat(invoice.change !== undefined ? invoice.change : (paidAmount > grandTotal ? paidAmount - grandTotal : 0));

  return (
    <div className="wrapper" style={{ fontSize: '9px', fontFamily: '"Courier New", Courier, monospace' }}>
      <div className="text-center">
        <div className="store-name" style={{ fontSize: '12px', fontWeight: 'bold' }}>{invoice.shopName || "SDL BillMate POS Supermarket"}</div>
        <div className="meta-text" style={{ fontSize: '8px' }}>Retail Store, City, State</div>
        <div className="meta-text" style={{ fontSize: '8px' }}>Contact: +91-XXXXXXXXXX | GSTIN: 27AABCT1234A2Z0</div>
        <div style={{ borderTop: '1.5px dashed #000000', marginTop: '4px', paddingTop: '3px', fontWeight: 'bold', fontSize: '8px' }} className="meta-text">
          TAX INVOICE / RETAIL RECEIPT
        </div>
      </div>

      <div className="section-border" style={{ borderTop: '1px dashed #000000', borderBottom: '1px dashed #000000', padding: '4px 0', margin: '4px 0', fontSize: '8px' }}>
        <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.2px' }}>
          <span style={{ whiteSpace: 'nowrap' }}>Invoice No: {invoice.id}</span>
          <span style={{ fontSize: '6.5px', whiteSpace: 'nowrap' }}>Date: {invoice.date}</span>
        </div>
        <div className="flex-row">
          <span>Customer: {invoice.customerName || "Walk-in"}</span>
          <span>Mode: {invoice.paymentMethod}</span>
        </div>
        <div className="flex-row">
          <span>Cashier: {invoice.operator || "Admin"}</span>
          <span>Bill Status: {(!invoice.status || invoice.status.toLowerCase() === 'active') ? 'Paid' : invoice.status}</span>
        </div>
      </div>

      <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', margin: '4px 0' }}>
        <thead>
          <tr style={{ fontSize: '8px' }}>
            <th style={{ padding: '2px 1px', textAlign: 'center', width: '20px', fontWeight: 'normal', borderBottom: '1px dashed #cbd5e1' }}>#</th>
            <th style={{ padding: '2px 1px', textAlign: 'left', fontWeight: 'normal', borderBottom: '1px dashed #cbd5e1' }}>Particulars</th>
            <th style={{ padding: '2px 1px', textAlign: 'center', width: '26px', fontWeight: 'normal', borderBottom: '1px dashed #cbd5e1' }}>Qty</th>
            <th style={{ padding: '2px 1px', textAlign: 'center', width: '26px', fontWeight: 'normal', borderBottom: '1px dashed #cbd5e1' }}>Unit</th>
            <th style={{ padding: '2px 1px', textAlign: 'right', width: '40px', fontWeight: 'normal', borderBottom: '1px dashed #cbd5e1' }}>Rate</th>
            <th style={{ padding: '2px 1px', textAlign: 'right', width: '50px', fontWeight: 'normal', borderBottom: '1px dashed #cbd5e1' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.map((line, idx) => {
            const finalLineAmt = calculateLineAfterDiscount(line);
            return (
              <tr key={idx} style={{marginBottom:'3px' }}>
                <td style={{ padding: '3px 1px', textAlign: 'center', fontSize: '8px' }}>{idx + 1}</td>
                <td style={{ padding: '3px 1px', textAlign: 'left', fontSize: '8px' }}>
                  <div style={{ fontSize: '8px', fontWeight: 'normal' }}>{line.name}</div>
                  {line.discount > 0 && (
                    <div style={{ fontSize: '6.5px' }}>
                      [SAVINGS: {line.discount}% OFF]
                    </div>
                  )}
                </td>
                <td style={{ padding: '3px 1px', textAlign: 'center', fontSize: '8px' }}>{Number(parseFloat(line.quantity || 0).toFixed(3))}</td>
                <td style={{ padding: '3px 1px', textAlign: 'center', fontSize: '8px' }}>{line.unit || "pcs"}</td>
                <td style={{ padding: '3px 1px', textAlign: 'right', fontSize: '8px' }}>₹{Number(line.rate || 0).toFixed(2)}</td>
                <td style={{ padding: '3px 1px', textAlign: 'right', fontSize: '8px' }}>
                  ₹{Number(finalLineAmt || 0).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {invoice.returns && invoice.returns.length > 0 && (
        <div style={{ marginTop: '8px', border: '1px dashed #000000', padding: '6px', fontSize: '8px' }}>
          <div style={{ fontSize: '8px', fontWeight: 'normal', textTransform: 'uppercase', marginBottom: '3px' }}>
            Returned Items & Refund Logs
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000000' }}>
                <th style={{ padding: '2px 1px', textAlign: 'left', fontWeight: 'normal' }}>Item Name</th>
                <th style={{ padding: '2px 1px', textAlign: 'center', fontWeight: 'normal' }}>Qty</th>
                <th style={{ padding: '2px 1px', textAlign: 'right', fontWeight: 'normal' }}>Refunded</th>
              </tr>
            </thead>
            <tbody>
              {invoice.returns.map((ret, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '3px 1px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'normal' }}>{ret.name}</div>
                  </td>
                  <td style={{ padding: '3px 1px', textAlign: 'center' }}>{ret.quantityReturned}</td>
                  <td style={{ padding: '3px 1px', textAlign: 'right' }}>₹{Number(ret.refundAmount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ borderTop: '1px dashed #000000', margin: '4px 0',fontWeight:'normal' }}></div>
      <div className="summary-section" style={{ borderTop: 'none', paddingTop: '2px', fontSize: '8.5px', marginTop: '4px', marginBottom: '0px' }}>
        <div className="summary-row" style={{ paddingBottom: '3px', marginBottom: '3px' }}>
          <span>Total Items: {totalItems}</span>
          {!hasMixedUnits && (
            <span>Total Qty: {Number(Number(totalQty || 0).toFixed(3))}</span>
          )}
        </div>
        <div style={{ borderTop: '1px dashed #000000', margin: '4px 0' }}></div>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{Number(subtotal || 0).toFixed(2)}</span>
        </div>
        {(totalLineDiscount > 0 || globalDiscount > 0) && (
          <div className="summary-row">
            <span>Discount</span>
            <span>-₹{Number((totalLineDiscount || 0) + (globalDiscount || 0)).toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Tax</span>
          <span>₹{Number(totalTax || 0).toFixed(2)}</span>
        </div>
        
        <div style={{ borderTop: '1px dashed #000000', margin: '4px 0' }}></div>
        
        <div className="summary-row" style={{ fontSize: '9px', fontWeight: 'bold' }}>
          <span>Grand Total Due</span>
          <span>₹{Number(grandTotal || 0).toFixed(2)}</span>
        </div>
        <div className="summary-row" style={{ marginBottom: '0px' }}>
          <span>Amount Tendered Paid:</span>
          <span>₹{Number(paidAmount || 0).toFixed(2)}</span>
        </div>
        
        {change > 0 && (
          <div className="summary-row">
            <span>Change Returned:</span>
            <span>₹{Number(change).toFixed(2)}</span>
          </div>
        )}
        
        <div className="summary-row" style={{ marginTop: '3px' }}>
          <span>Outstanding Balance:</span>
          <span>₹{Number(balance || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="thankyou-box" style={{ borderTop: '1px dashed #000000', marginTop: '4px', paddingTop: '4px', textAlign: 'center' }}>
        <p style={{ fontSize: '7.5px', margin: '2px 0 3px 0' }}>Goods once sold will not be taken back.</p>
        <div className="thankyou-msg" style={{ fontSize: '9px', fontWeight: 'normal', margin: 0, padding: 0 }}>THANK YOU, VISIT US AGAIN!</div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
