import React from 'react';
import { Receipt, X, Printer, RotateCcw, Download } from 'lucide-react';
import { calculateLineTotal } from '../utils/invoiceCalculations';
import { downloadInvoiceHTML } from '../utils/invoiceDownload';
import { printInvoice } from '../utils/invoicePrinter';

export default function InvoiceModal({
  isOpen,
  invoice,
  onClose,
  title = "Sale Invoice Details",
  closeActionText = "Close View",
  onCloseAction,
  showToast,
  showDownload = false
}) {
  if (!isOpen || !invoice) return null;

  const hasMixedUnits = (() => {
    if (!invoice || !invoice.items || invoice.items.length === 0) return false;
    const firstUnit = (invoice.items[0].unit || "pcs").toLowerCase().trim();
    return invoice.items.some(item => {
      const u = (item.unit || "pcs").toLowerCase().trim();
      return u !== firstUnit;
    });
  })();

  const handlePrint = () => {
    printInvoice(invoice);
  };

  const handleDownload = () => {
    downloadInvoiceHTML(invoice, showToast);
  };

  const handleFinalClose = () => {
    if (onCloseAction) {
      onCloseAction();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm font-mono flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center flex-shrink-0 no-print">
          <div className="flex items-center gap-2 text-emerald-500">
            <Receipt size={17} />
            <span className="font-bold text-sm uppercase tracking-wide text-gray-800">{title}</span>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 border-0 cursor-pointer flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Modal Body / Scroll Content */}
        <div className="flex-1 overflow-y-auto pos-scroll p-5">
          <div id="thermal-print-area" className="bg-gray-50 border border-gray-200 p-5 text-xs" style={{ fontFamily: "monospace" }}>
            
            {/* Shop & Customer Information */}
            <div className="text-center mb-4">
              <div className="text-sm font-bold text-gray-800 uppercase">{invoice.shopName || "SDL BillMate POS Supermarket"}</div>
              <div className="text-[10px] text-gray-400 uppercase font-medium">Address: Retail Store, City, State</div>
              <div className="text-[10px] text-gray-400 uppercase font-medium">Contact: +91-XXXXXXXXXX | GSTIN: 27AABCT1234A2Z0</div>
              <div className="text-[10px] text-gray-500 border-t border-dashed border-gray-300 pt-2 mt-2">Tax Invoice / Retail Receipt</div>
            </div>

            {/* Invoice Details - Reorganized */}
            <div className="border-y border-dashed border-gray-300 py-2.5 mb-3 space-y-1">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Invoice Number: <span className="text-gray-800 font-semibold">{invoice.id}</span></span>
                <span>Date / Time: <span className="text-gray-800 font-semibold">{invoice.date}</span></span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Customer Name: <span className="text-gray-800 font-semibold">{invoice.customerName || "Walk-in"}</span></span>
                <span>Payment Mode: <span className="text-gray-800 font-semibold">{invoice.paymentMethod}</span></span>
              </div>
              <div className="text-[10px] text-gray-500 flex justify-between">
                <span>Cashier: <span className="text-gray-850 font-semibold">{invoice.operator || "Admin"}</span></span>
                {invoice.status && (
                  <span>Status: <span className={`font-bold uppercase ${invoice.status === "Cancelled" ? "text-red-650" : "text-emerald-700"}`}>{invoice.status}</span></span>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full border-collapse text-[14px] mb-3">
              <thead>
                <tr className="border-b border-dashed border-gray-300 text-gray-400 font-medium">
                  <th className="py-2 text-center text-xs" style={{ width: "45px", minWidth: "45px" }}>S.No</th>
                  <th className="py-2 text-left text-xs uppercase tracking-wider">Item Description</th>
                  <th className="py-2 text-center text-xs" style={{ width: "50px" }}>Qty</th>
                  <th className="py-2 text-center text-xs" style={{ width: "50px" }}>Unit</th>
                  <th className="py-2 text-right text-xs" style={{ width: "65px" }}>Rate</th>
                  <th className="py-2 text-right text-xs" style={{ width: "75px" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((line, idx) => {
                  const finalLineAmt = calculateLineTotal(line);
                  return (
                    <tr key={`${line.sku}-${idx}`}   className="border-b border-gray-100 text-gray-800 hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 text-center text-xs text-gray-450 font-semibold font-mono" style={{ width: "45px" }}>{idx + 1}</td>
                      <td className="py-3 text-left">
                        <div className="text-[14px] font-semibold text-gray-800 leading-tight">{line.name}</div>
                        <div className="text-[12px] text-gray-500 mt-1 font-mono uppercase tracking-wider">{line.sku}</div>
                        {line.discount > 0 && <span className="text-[10px] mt-1 inline-block bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-medium">{line.discount}% Discount</span>}
                      </td>
                      <td className="text-center text-[14px] font-semibold text-gray-800" style={{ width: "50px" }}>{line.quantity}</td>
                      <td className="text-center text-[14px] text-gray-600" style={{ width: "50px" }}>{line.unit || "pcs"}</td>
                      <td className="text-right text-[14px] font-medium text-gray-700" style={{ width: "65px" }}>₹{line.rate.toFixed(1)}</td>
                      <td className="text-right text-[14px] font-bold text-gray-900" style={{ width: "75px" }}>₹{finalLineAmt.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Return breakdown log if returned */}
            {invoice.returns && invoice.returns.length > 0 && (
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 mb-3 border-dashed">
                <div className="text-[9px] font-extrabold text-[#c62828] uppercase flex items-center gap-1 mb-1.5">
                  <RotateCcw size={10} />
                  <span>Returned Items Log Credits</span>
                </div>
                <div className="divide-y divide-rose-100 font-sans text-[10px] text-[#c62828]">
                  {invoice.returns.map((ret, rIdx) => (
                    <div key={rIdx} className="py-1.5 flex justify-between">
                      <div>
                        <span className="font-extrabold">{ret.name}</span>
                        <span className="opacity-90"> (Qty Returned: {ret.quantityReturned})</span>
                      </div>
                      <span className="font-bold font-mono">-₹{ret.refundAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="p-3 space-y-1 mb-2 font-mono">
              <div className="flex justify-between text-[10px] text-gray-500 border-b border-gray-200 pb-1 mb-1">
                <span>
                  Total Items: <span className="text-gray-800">{invoice.items ? invoice.items.length : 0}</span>
                </span>
                {!hasMixedUnits && (
                  <span>
                    Total Quantity:{" "}
                    <span className="text-gray-800">
                      {Number((invoice.items ? invoice.items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) : 0).toFixed(3))}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Subtotal:</span>
                <span className="text-gray-800">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.totalLineDiscount > 0 && (
                <div className="flex justify-between text-[10px] text-red-650">
                  <span>Item Discount:</span>
                  <span className="font-medium">-₹{invoice.totalLineDiscount.toFixed(2)}</span>
                </div>
              )}
              {invoice.globalDiscount > 0 && (
                <div className="flex justify-between text-[10px] text-red-650">
                  <span>Invoice Discount:</span>
                  <span className="font-medium">-₹{invoice.globalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-gray-500 border-t border-gray-200 pt-1 mt-1">
                <span>CGST (9%):</span>
                <span className="text-gray-800">₹{(invoice.totalTax / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 border-b border-gray-200 pb-1 mb-1">
                <span>SGST (9%):</span>
                <span className="text-gray-800">₹{(invoice.totalTax / 2).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500">Grand Total Due:</span>
                <span className="text-[11px] font-bold text-gray-800">₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500">Amount Tendered Paid:</span>
                <span className="text-[11px] font-extrabold text-emerald-700">
                  ₹{parseFloat(invoice.paidAmount !== undefined ? invoice.paidAmount : invoice.grandTotal).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500">Outstanding Balance:</span>
                <span className={`text-[11px] font-bold ${parseFloat(invoice.balance !== undefined ? invoice.balance : 0) > 0 ? "text-red-650" : "text-gray-800"}`}>
                  ₹{parseFloat(invoice.balance !== undefined ? invoice.balance : 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                <span className="text-[10px] font-bold text-gray-700 uppercase">Grand Total Paid</span>
                <span className="text-sm font-bold text-emerald-600">
                  ₹{parseFloat(invoice.paidAmount !== undefined ? invoice.paidAmount : invoice.grandTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-[9px] text-gray-400">Goods once sold will not be taken back unless defective.</p>
              <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-dashed border-emerald-200 p-2">
                THANK YOU, VISIT US AGAIN!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex gap-2.5 flex-shrink-0 no-print flex-col sm:flex-row">
          <button type="button" onClick={handlePrint}
            className="flex-1 h-11 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors">
            <Printer size={14} /> Print Receipt
          </button>
          {showDownload && (
            <button type="button" onClick={handleDownload}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors">
              <Download size={14} /> Download Invoice
            </button>
          )}
          <button type="button" onClick={handleFinalClose}
            className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-colors">
            {closeActionText}
          </button>
        </div>

      </div>
    </div>
  );
}
