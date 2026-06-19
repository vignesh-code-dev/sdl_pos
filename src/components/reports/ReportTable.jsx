import React from "react";
import { ChevronLeft, ChevronRight, Eye, Printer, Download } from "lucide-react";

export default function ReportTable({
  activeTab,
  rows,
  paginatedRows,
  currentPage,
  totalPages,
  onPageChange,
  onViewInvoice,
  onPrintInvoice,
  onExportInvoice
}) {
  if (activeTab === "backups") return null;

  if (rows.length === 0) {
    return (
      <div className="bg-pos-card border border-pos-border rounded p-16 text-center text-slate-400 font-semibold text-xs shadow-sm">
        No records found matching current date criteria or search term in local database state.
      </div>
    );
  }

  // Check if a row has a raw invoice associated with it (either a direct invoice object or stored inside rawInvoice)
  const getRawInvoice = (row) => {
    return row.rawInvoice || row;
  };

  return (
    <div id="report-table-wrapper" className="bg-pos-card border border-pos-border rounded shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          
          {/* Table Headers */}
          <thead>
            <tr className="border-b  border-pos-border text-white uppercase text-xs font-semibold tracking-wider bg-emerald-600">
              {activeTab === "sales" && (
                <>
                  <th className="p-4 text-xs font-semibold uppercase">Transaction ID</th>
                  <th className="p-3 text-xs font-semibold uppercase">Date & Time</th>
                  <th className="p-4 text-xs font-semibold uppercase">Cashier</th>
                  <th className="p-4 text-xs font-semibold uppercase">Customer</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Items Count</th>
                  <th className="p-4 text-xs font-semibold uppercase">Method</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase">Paid Amount</th>
                </>
              )}
              {activeTab === "invoice" && (
                <>
                  <th className="p-4 text-xs font-semibold uppercase">Invoice No</th>
                  <th className="p-4 text-xs font-semibold uppercase">Date & Time</th>
                  <th className="p-4 text-xs font-semibold uppercase">Customer Name</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Items</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Invoiced Total</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Amount Paid</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Balance Due</th>
                  <th className="p-4 text-xs font-semibold uppercase">Cashier</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase w-40">Actions</th>
                </>
              )}
              {activeTab === "revenue" && (
                <>
                  <th className="p-4 text-xs font-semibold uppercase">Date Period</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Orders Gross</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">CASH Settlement</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">UPI Clearing</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">CARD Transactions</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">CREDIT Ledger</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">BANK Transfer</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Daily Sum Total</th>
                </>
              )}
              {activeTab === "deposit" && (
                <>
                  <th className="p-4 text-xs font-semibold uppercase">Customer Name</th>
                  <th className="p-4 text-xs font-semibold uppercase">Contact Mobile</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Credit Limit</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Extended (Dr)</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Settled (Cr)</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Outstanding Due</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Usage Ratio</th>
                </>
              )}
              {activeTab === "bank_transfer" && (
                <>
                  <th className="p-4 text-xs font-semibold uppercase">Invoice No</th>
                  <th className="p-4 text-xs font-semibold uppercase">Transfer Date</th>
                  <th className="p-4 text-xs font-semibold uppercase">Customer Name</th>
                  <th className="p-4 text-xs font-semibold uppercase">Contact Phone</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Invoice Total</th>
                  <th className="p-4 text-right text-xs font-semibold uppercase">Cleared Amount</th>
                  <th className="p-4 text-xs font-semibold uppercase">Operator</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase w-40">Actions</th>
                </>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-pos-border/50 text-sm font-medium text-text-secondary">
            {paginatedRows.map((r, i) => {
              const rowKey = r.id || `${r.date}-${i}` || i;
              
              if (activeTab === "sales") {
                return (
                  <tr key={rowKey} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800 select-all font-mono">{r.id}</td>
                    <td className="p-4 text-slate-750 font-medium">{r.date}</td>
                    <td className="p-4 text-slate-755 capitalize">{r.operator}</td>
                    <td className="p-4 text-slate-800 font-semibold">{r.customerName || "Walk-in Buyer"}</td>
                    <td className="p-4 text-center text-slate-600 font-medium">{r.itemsCount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-bold leading-normal text-center text-slate-700 rounded select-none">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-left font-bold text-emerald-700 font-mono">₹{Number(r.amount || 0).toFixed(2)}</td>
                  </tr>
                );
              }

              if (activeTab === "invoice") {
                return (
                  <tr key={rowKey} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800 select-all font-mono">{r.id}</td>
                    <td className="p-4 text-slate-750 font-medium">{r.date}</td>
                    <td className="p-4 text-slate-800 font-semibold">{r.customerName}</td>
                    <td className="p-4 text-center text-slate-600 font-medium">{r.itemsCount}</td>
                    <td className="p-4 text-right font-bold text-slate-800 font-mono">₹{Number(r.grandTotal || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-emerald-700 font-mono font-bold">₹{Number(r.paidAmount || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-brand-danger font-mono font-bold">₹{Number(r.balance || 0).toFixed(2)}</td>
                    <td className="p-4 text-slate-755 capitalize">{r.operator}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`hover:bg-emerald-50 px-2.5 py-1 text-xs font-bold tracking-wide uppercase select-none transition-colors border rounded ${
                          r.status === "Active"
                            ? "bg-teal-50 text-emerald-700 border-teal-150"
                            : "bg-red-50 text-red-650 border-red-150"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewInvoice && onViewInvoice(getRawInvoice(r))}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-teal-50 rounded-xl transition-all border-0 bg-transparent flex items-center justify-center cursor-pointer"
                          title="View Invoice"
                        >
                          <Eye size={14.5} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintInvoice && onPrintInvoice(getRawInvoice(r))}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-0 bg-transparent flex items-center justify-center cursor-pointer"
                          title="Print Thermal Receipt"
                        >  
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportInvoice && onExportInvoice(getRawInvoice(r))}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-0 bg-transparent flex items-center justify-center cursor-pointer"
                          title="Export HTML Document"
                        >
                          <Download size={14.5} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              if (activeTab === "revenue") {
                return (
                  <tr key={rowKey} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800 font-mono">{r.date}</td>
                    <td className="p-4 text-center font-bold text-slate-655 font-mono">{r.count} sales</td>
                    <td className="p-4 text-right text-slate-700 font-mono">₹{Number(r.cash || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-700 font-mono">₹{Number(r.upi || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-700 font-mono">₹{Number(r.card || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-700 font-mono">₹{Number(r.credit || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-700 font-mono">₹{Number(r.bank || 0).toFixed(2)}</td>
                    <td className="p-4 text-right font-black text-emerald-800 font-mono">₹{Number(r.total || 0).toFixed(2)}</td>
                  </tr>
                );
              }

              if (activeTab === "deposit") {
                return (
                  <tr key={rowKey} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{r.customerName}</td>
                    <td className="p-4 text-slate-500 font-mono">{r.customerMobile}</td>
                    <td className="p-4 text-right font-semibold text-slate-700 font-mono">₹{Number(r.creditLimit || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-brand-danger font-mono font-semibold">₹{Number(r.creditGiven || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-emerald-700 font-mono font-semibold">₹{Number(r.paymentsReceived || 0).toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-brand-danger font-mono">₹{Number(r.outstanding || 0).toFixed(2)}</td>
                    <td className="p-4 text-center font-bold">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`text-xs font-bold leading-none font-mono ${
                            Number(r.utilization || 0) > 85
                              ? "text-brand-danger"
                              : Number(r.utilization || 0) > 50
                              ? "text-brand-warning"
                              : "text-emerald-700"
                          }`}
                        >
                          {Number(r.utilization || 0).toFixed(0)}%
                        </span>
                        <div className="w-14 bg-slate-100 h-2 rounded border border-pos-border/40 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Number(r.utilization || 0))}%` }}
                            className={`h-full transition-all duration-300 ${
                              Number(r.utilization || 0) > 85
                                ? "bg-red-500"
                                : Number(r.utilization || 0) > 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              if (activeTab === "bank_transfer") {
                return (
                  <tr key={rowKey} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-800 select-all font-mono">{r.id}</td>
                    <td className="p-4 text-slate-750 font-medium">{r.date}</td>
                    <td className="p-4 text-slate-805 font-semibold">{r.customerName}</td>
                    <td className="p-4 text-slate-500 font-mono">{r.customerMobile}</td>
                    <td className="p-4 text-right font-bold text-slate-800 font-mono">₹{Number(r.grandTotal || 0).toFixed(2)}</td>
                    <td className="p-4 text-right text-emerald-750 font-bold font-mono">₹{Number(r.paidAmount || 0).toFixed(2)}</td>
                    <td className="p-4 text-slate-755 capitalize">{r.operator}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`hover:bg-emerald-50 px-2.5 py-1 text-xs font-bold tracking-wide uppercase select-none transition-colors border rounded ${
                          r.status === "Active"
                            ? "bg-teal-50 text-emerald-700 border-teal-150"
                            : "bg-red-50 text-red-650 border-red-150"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewInvoice && onViewInvoice(getRawInvoice(r))}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-teal-50 rounded-xl transition-all border-0 bg-transparent flex items-center justify-center cursor-pointer"
                          title="View Invoice"
                        >
                          <Eye size={14.5} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintInvoice && onPrintInvoice(getRawInvoice(r))}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-0 bg-transparent flex items-center justify-center cursor-pointer"
                          title="Print Thermal Receipt"
                        >
                          <Printer size={14.5} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportInvoice && onExportInvoice(getRawInvoice(r))}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border-0 bg-transparent flex items-center justify-center cursor-pointer"
                          title="Export HTML Document"
                        >
                          <Download size={14.5} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return null;
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div id="table-pagination-bar" className="bg-slate-50 border-t border-pos-border/50 px-4 py-3 flex items-center justify-between no-print select-none">
        <span className="text-xs text-slate-400 font-semibold font-sans">
          Showing rows {rows.length === 0 ? 0 : (currentPage - 1) * 8 + 1} to {Math.min(currentPage * 8, rows.length)} of {rows.length} records
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 text-slate-500 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:hover:bg-transparent rounded cursor-pointer transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-slate-600 px-2 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 text-slate-500 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:hover:bg-transparent rounded cursor-pointer transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
