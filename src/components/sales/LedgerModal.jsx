import React from "react";
import { X } from "lucide-react";

const LedgerModal = ({ show, onClose, selectedAccount }) => {
  if (!show || !selectedAccount) return null;

  // Helper to parse dates for chronological sorting
  const parseTxDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // Helper to resolve cashier-friendly category names in uppercase
  const getDisplayCategory = (tx) => {
    const type = (tx.type || "").toUpperCase();
    const category = (tx.category || "").toUpperCase();

    if (category === "ACCOUNT CREATED" || type === "SETUP" || category === "SETUP") {
      return "ACCOUNT CREATED";
    }
    if (category === "LIMIT CHANGE" || category === "ADJUSTMENT" || type === "ADJUSTMENT") {
      return "LIMIT CHANGE";
    }
    if (category === "REFUND" || type === "REFUND") {
      return "REFUND";
    }
    if (category === "ADVANCE" || type === "ADVANCE") {
      return "ADVANCE";
    }
    if (category === "PAYMENT" || type === "PAYMENT") {
      return "PAYMENT";
    }
    if (category === "SALE" || type === "CREDIT" || category === "CREDIT") {
      return "SALE";
    }
    return category || type || "SALE";
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "SALE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PAYMENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ADVANCE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "REFUND":
        return "bg-purple-50 text-purple-700 border-purple-250";
      case "LIMIT CHANGE":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "ACCOUNT CREATED":
        return "bg-indigo-50 text-indigo-700 border-indigo-250";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getAmountDisplay = (category, amount) => {
    if (category === "ACCOUNT CREATED" || category === "LIMIT CHANGE") {
      return <span className="text-slate-400 font-mono">—</span>;
    }
    const isAddition = category === "SALE";
    return (
      <span className={isAddition ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
        {isAddition ? "+" : "-"}₹{amount.toFixed(2)}
      </span>
    );
  };

  const transactions = selectedAccount.transactions || [];

  // Sort and compute running balances chronologically (oldest first)
  const sortedTxs = [...transactions].sort((a, b) => {
    const timeA = parseTxDate(a.date);
    const timeB = parseTxDate(b.date);
    if (timeA !== timeB) return timeA - timeB;
    
    // Fallback if timestamps are identical: sort by numeric part of ID or preserve order
    const idA = parseInt((a.id || "").replace(/\D/g, "")) || 0;
    const idB = parseInt((b.id || "").replace(/\D/g, "")) || 0;
    return idA - idB;
  });

  let runningOutstanding = 0;
  const processedTxs = sortedTxs.map((tx) => {
    const category = getDisplayCategory(tx);
    if (category === "SALE") {
      runningOutstanding += tx.amount;
    } else if (category === "PAYMENT" || category === "ADVANCE" || category === "REFUND") {
      runningOutstanding -= tx.amount;
    }
    return {
      ...tx,
      displayCategory: category,
      runningBalance: runningOutstanding
    };
  });

  // Display newest first
  const displayTransactions = [...processedTxs].reverse();

  return (
    <div id="ledger-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider">Debit & Credit Ledger</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
              LEDGER LOGS OF {selectedAccount.customerName.toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded border-0 cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer Credit Summary */}
          <div>
            <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-2">
              Customer Credit Profile Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-pos-border rounded p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Credit Limit</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  ₹{(selectedAccount.creditLimit || 0).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-50 border border-pos-border rounded p-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Available Credit</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  ₹{Math.max(0, selectedAccount.creditLimit - selectedAccount.outstanding).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-50 border border-pos-border rounded p-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Outstanding Due</span>
                <span className={`text-sm font-black font-mono ${selectedAccount.outstanding > 0 ? "text-brand-danger" : "text-emerald-700"}`}>
                  ₹{(selectedAccount.outstanding || 0).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-50 border border-pos-border rounded p-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Sales (Dr)</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  ₹{(selectedAccount.creditGiven || 0).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-50 border border-pos-border rounded p-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Settled (Cr)</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  ₹{(selectedAccount.paymentsReceived || 0).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-50 border border-pos-border rounded p-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Advance Balance</span>
                <span className="text-sm font-extrabold text-blue-700 font-mono">
                  ₹{(selectedAccount.advanceBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-evenly gap-2 mt-2 text-[10px] bg-slate-50 border border-pos-border rounded p-2.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-bold uppercase">Account Status : </span>
                {(() => {
                  const st = selectedAccount.status || "Active";
                  if (st === "Active")
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase  text-emerald-700">
                        Active
                      </span>
                    );
                  if (st === "Suspended")
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase  text-amber-700  ">
                        Suspended
                      </span>
                    );
                  if (st === "Blocked")
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase  text-rose-700 ">
                        Blocked
                      </span>
                    );
                  return (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase  text-slate-500 ">
                      Closed
                    </span>
                  );
                })()}
              </div>
              <div>
                <span className="text-slate-600 font-bold uppercase">Credit Period : </span>
                <span className="font-bold text-[12px] text-slate-700">{selectedAccount.creditPeriod || 30} Days</span>
              </div>
            
            </div>
          </div>

          {/* Transactions List */}
          <div className="border border-pos-border rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto max-h-[280px]">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50 border-b border-pos-border text-xs font-bold text-slate-600 uppercase tracking-wider select-none">
                    <th className="p-3 pl-5 text-center font-mono w-20">ID</th>
                    <th className="p-3 w-44 text-center">Timestamp</th>
                    <th className="p-3 w-32 text-center">Category</th>
                    <th className="p-3 min-w-[180px]">Notes / Ref / Operator</th>
                    <th className="p-3 text-right w-28">Amount</th>
                    <th className="p-3 text-right pr-5 w-28">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border text-xs font-semibold text-slate-700">
                  {displayTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 font-medium bg-white">
                        No debit or credit transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    displayTransactions.map((tx) => {
                      const badgeClass = getCategoryBadgeClass(tx.displayCategory);
                      
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-50/50 transition-colors align-middle"
                        >
                          {/* ID */}
                          <td className="p-3 pl-3 text-center font-mono text-xs text-slate-600 font-black">
                            {tx.id}
                          </td>
                          {/* Timestamp */}
                          <td className="p-3 pl-2 text-slate-600 font-mono text-xs tracking-tight text-center">
                            {tx.date}
                          </td>
                          {/* Category Badge */}
                          <td className="p-3 text-center">
                            <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase border ${badgeClass}`}>
                              {tx.displayCategory}
                            </span>
                          </td>
                          {/* Notes & Operator */}
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-bold text-xs max-w-xs break-words" title={tx.description}>
                                {tx.description}
                              </span>
                              {tx.operator && (
                                <span className="text-[10px] text-slate-400 font-medium lowercase mt-0.5">
                                  by {tx.operator}
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Amount */}
                          <td className="p-3 text-right font-black font-mono text-xs whitespace-nowrap">
                            {getAmountDisplay(tx.displayCategory, tx.amount)}
                          </td>
                          {/* Running Balance */}
                          <td className="p-3 text-right pr-5 font-black font-mono text-xs text-slate-700 whitespace-nowrap">
                            {tx.runningBalance >= 0 ? (
                              <span>₹{tx.runningBalance.toFixed(2)}</span>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span>₹0.00</span>
                                <span className="text-[10px] text-blue-600 font-bold">
                                  (Adv ₹{Math.abs(tx.runningBalance).toFixed(2)})
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* print layout bottom */}
          <div className="pt-3 border-t border-pos-border flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
            >
              CLOSE LEDGER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerModal;
