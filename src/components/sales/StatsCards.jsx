import React from "react";
import { ArrowUpCircle, ArrowDownCircle, DollarSign, User } from "lucide-react";

const StatsCards = ({ totalCreditGiven, totalPayments, totalOutstanding, activeAccountsCount }) => {
  return (
    <div id="sales-stats-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Credit Given */}
      <div id="stat-credit-given" className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-slate-400 uppercase block">Total Credit Given</span>
          <span className="text-3xl font-black text-slate-800 tracking-tight block font-mono">
            ₹{totalCreditGiven.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[13px] text-slate-400 font-medium block">Cumulative credit extended</span>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
          <ArrowUpCircle size={20} />
        </div>
      </div>

      {/* Total Payments */}
      <div id="stat-payments" className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-slate-400 uppercase block">Total Payments</span>
          <span className="text-3xl font-black text-emerald-700 tracking-tight block font-mono">
            ₹{totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[13px] text-slate-400 font-medium block">Payments credited to accounts</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
          <ArrowDownCircle size={20} />
        </div>
      </div>

      {/* Total Outstanding */}
      <div id="stat-outstanding" className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-slate-400 uppercase block">Total Outstanding Balance</span>
          <span className={`text-3xl font-black tracking-tight block font-mono ${totalOutstanding > 0 ? "text-brand-danger" : "text-emerald-700"}`}>
            ₹{totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[13px] text-slate-400 font-medium block">Net receivable amount</span>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 text-brand-danger border border-rose-100 flex items-center justify-center shrink-0">
          <DollarSign size={20} />
        </div>
      </div>

      {/* Active Accounts */}
      <div id="stat-active-accounts" className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[13px] font-bold text-slate-400 uppercase block">Active Accounts</span>
          <span className="text-3xl font-black text-blue-600 tracking-tight block font-mono">
            {activeAccountsCount}
          </span>
          <span className="text-[13px] text-slate-400 font-medium block">Customers with unpaid balances</span>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
          <User size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
