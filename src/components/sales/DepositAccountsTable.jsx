import React from "react";
import {
  Phone,
  AlertCircle,
  FileText,
  Edit,
  CreditCard,
  Archive,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Pagination from "../Pagination";

const DepositAccountsTable = ({
  paginatedAccounts,
  getDaysOutstanding,
  onViewLedger,
  onOpenSettings,
  onCollectPayment,
  onInitiateArchive,
  onInitiateDelete,
  onUnarchive,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  totalRecords,
  itemsPerPage,
  totalAccountsCount,
}) => {
  return (
    <div
      id="sales-deposit-accounts-table-card"
      className="bg-pos-card border border-pos-border rounded shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-pos-border text-white uppercase text-xs font-semibold tracking-wider bg-brand-primary">
              <th className="p-4 text-xs font-semibold uppercase">
                Customer Name & Info
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase">
                Credit Limit
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase">
                Credit Extended (Dr)
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase">
                Payments Made (Cr)
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase">
                Outstanding (Due)
              </th>
              <th className="p-4 text-xs font-semibold uppercase min-w-[185px]">
                Account Standing
              </th>
              <th className="p-4 text-center text-xs font-semibold uppercase w-44">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pos-border/50 text-sm font-medium text-text-secondary animate-fade-in">
            {paginatedAccounts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-20 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center p-6 max-w-sm mx-auto">
                    <div className="p-3.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 mb-2">
                      <AlertCircle size={28} />
                    </div>
                    <p className="font-bold text-slate-750 text-sm">
                      No Credit Accounts Found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Try refining your search terms or create a credit account
                      for a registered customer.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAccounts.map((acc) => {
                const usedPercentage =
                  acc.creditLimit > 0
                    ? Math.min(
                        100,
                        Math.max(0, (acc.outstanding / acc.creditLimit) * 100),
                      )
                    : 0;
                return (
                  <tr
                    key={acc.customerId}
                    className="hover:bg-slate-50/40 transition-colors text-sm font-medium text-text-secondary"
                  >
                    {/* Name & Contact */}
                    <td className="p-4 px-5">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">
                          {acc.customerName}
                        </div>
                        <div className="text-[14px] text-slate-400 font-semibold mt-1 flex items-center gap-1 font-mono uppercase">
                          <Phone size={10} className="text-brand-primary" />
                          {acc.customerMobile}
                        </div>
                      </div>
                    </td>

                    {/* Credit Limit */}
                    <td className="p-4 text-right font-bold text-slate-700 font-mono whitespace-nowrap">
                      ₹{acc.creditLimit.toFixed(2)}
                    </td>

                    {/* Cumulative Credit given */}
                    <td className="p-4 text-right text-slate-600 font-mono font-semibold whitespace-nowrap">
                      ₹{(acc.creditGiven || 0).toFixed(2)}
                    </td>

                    {/* Payments made */}
                    <td className="p-4 text-right text-emerald-750 font-mono font-semibold whitespace-nowrap">
                      ₹{(acc.paymentsReceived || 0).toFixed(2)}
                    </td>

                    {/* Outstanding */}
                    <td className="p-4 text-right font-mono font-semibold whitespace-nowrap">
                      <span
                        className={
                          acc.outstanding > 0
                            ? "text-brand-danger"
                            : "text-emerald-700"
                        }
                      >
                        ₹{acc.outstanding.toFixed(2)}
                      </span>
                    </td>

                    {/* Remaining Progress or bar */}
                    <td className="p-4 min-w-[185px]">
                      <div className="space-y-1.5">
                        {/* Limit used progress bar */}
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                            <span>Limit Used</span>
                            <span
                              className={
                                usedPercentage >= 80
                                  ? "text-rose-600 font-extrabold"
                                  : "text-slate-400"
                              }
                            >
                              {usedPercentage.toFixed(0)}%{" "}
                              {usedPercentage >= 80 && "⚠️"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-100 mt-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-300
                                ${
                                  usedPercentage >= 100
                                    ? "bg-red-600"
                                    : usedPercentage >= 80
                                      ? "bg-amber-500"
                                      : usedPercentage > 50
                                        ? "bg-amber-400"
                                        : "bg-emerald-500"
                                }`}
                              style={{ width: `${usedPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Status and period info */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          {/* Account Status */}
                          {(() => {
                            const st = acc.status || "Active";
                            if (st === "Active")
                              return (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-250">
                                  Active
                                </span>
                              );
                            if (st === "Suspended")
                              return (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-250">
                                  Suspended
                                </span>
                              );
                            if (st === "Blocked")
                              return (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-250">
                                  Blocked
                                </span>
                              );
                            return (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-300">
                                Closed
                              </span>
                            );
                          })()}
                          <span>
                            {acc.outstanding > 0 && (
                              <div className="text-[10px] font-black text-rose-600  flex items-center gap-0.5">
                                <AlertCircle size={8} />
                                <span>
                                  {getDaysOutstanding(acc)} Days Outstanding
                                </span>
                              </div>
                            )}
                          </span>
                        </div>

                        {/* Days outstanding warning */}
                      </div>
                    </td>

                    {/* Operations */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Ledger */}
                        <button
                          type="button"
                          onClick={() => onViewLedger(acc)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-pos-border bg-white rounded flex items-center justify-center cursor-pointer transition-all shadow-5xs"
                          title="View Transaction History"
                        >
                          <FileText size={13} strokeWidth={2.5} />
                        </button>

                        {/* Limit & Settings */}
                        <button
                          type="button"
                          onClick={() => onOpenSettings(acc)}
                          className="h-8 w-8 text-brand-warning hover:text-brand-warning/90 hover:bg-amber-50/50 border border-pos-border bg-white rounded flex items-center justify-center cursor-pointer transition-all shadow-5xs"
                          title="Account Settings"
                        >
                          <Edit size={13} strokeWidth={2.5} />
                        </button>

                        {/* Record Pay */}
                        <button
                          type="button"
                          onClick={() => onCollectPayment(acc)}
                          className="h-8 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors shadow-5xs"
                          title="Collect Cash Deposit"
                          disabled={
                            acc.status === "Closed" || acc.status === "Blocked"
                          }
                          style={{
                            opacity:
                              acc.status === "Closed" ||
                              acc.status === "Blocked"
                                ? 0.4
                                : 1,
                            cursor:
                              acc.status === "Closed" ||
                              acc.status === "Blocked"
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          
                          PAY
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onInitiateDelete(acc)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-pos-border bg-white rounded flex items-center justify-center cursor-pointer transition-all shadow-5xs"
                          title="Delete Account"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

     {/* Summary Footer on Filtered Amount with Reusable Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalRecords={totalRecords}
        itemsPerPage={itemsPerPage}
        totalCount={totalAccountsCount}
      />

    </div>
  );
};

export default DepositAccountsTable;
