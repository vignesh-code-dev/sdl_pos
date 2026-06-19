import React, { useMemo } from "react";
import {
  X,
  User,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  IndianRupee,
  Clock,
  Briefcase
} from "lucide-react";

const PurchaseModel = ({ isOpen, customer, onClose }) => {
  if (!isOpen || !customer) return null;

  const stats = useMemo(() => {
    // 1. Fetch invoices from localStorage
    let invoices = [];
    try {
      const savedInvoices = localStorage.getItem("billmate_invoices");
      if (savedInvoices) {
        invoices = JSON.parse(savedInvoices);
      }
    } catch (e) {
      console.error("Error reading billmate_invoices", e);
    }

    // 2. Fetch credit accounts/balances from localStorage
    let creditAccounts = [];
    try {
      const savedAccounts = localStorage.getItem("billmate_deposit_accounts");
      if (savedAccounts) {
        creditAccounts = JSON.parse(savedAccounts);
      }
    } catch (e) {
      console.error("Error reading billmate_deposit_accounts", e);
    }

    // Link customer to invoices based on mobile (if valid, e.g. 10 digits) OR exact name
    const hasMobile = customer.mobile && customer.mobile !== "-";
    const linkedInvoices = invoices.filter((inv) => {
      const mobileMatch = hasMobile && inv.customerMobile === customer.mobile;
      const nameMatch = inv.customerName && inv.customerName.toLowerCase().trim() === customer.name.toLowerCase().trim();
      return mobileMatch || nameMatch;
    });

    // Calculate total orders and total amount spent
    const totalOrders = linkedInvoices.length;
    const totalSpent = linkedInvoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

    // Get last purchase date
    let lastPurchaseDate = "No purchases yet";
    if (linkedInvoices.length > 0) {
      const sorted = [...linkedInvoices].sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateB - dateA;
      });
      lastPurchaseDate = sorted[0].date || sorted[0].createdAt || "-";
    }

    // Outstanding Credit Balance across accounts
    const matchedAccount = creditAccounts.find(
      (acc) =>
        acc.customerId === customer.id ||
        (hasMobile && acc.customerMobile === customer.mobile)
    );
    const outstandingCredit = matchedAccount ? parseFloat(matchedAccount.outstanding) || 0 : 0;

    return {
      totalOrders,
      totalSpent,
      lastPurchaseDate,
      outstandingCredit
    };
  }, [customer]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 text-slate-850 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold">
              <ShoppingBag size={17} />
            </div>
            <div>
              <h3 className="font-extrabold text-[14px] text-slate-900 uppercase tracking-wider">
                Purchase Summary
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                Key Customer Value Metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border-0 outline-none"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main profile section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-slate-50/50 rounded-xl border border-slate-100/80">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-lg font-black tracking-tight shrink-0 border border-brand-primary/10">
              {customer.name ? customer.name.substring(0, 2).toUpperCase() : "?"}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">{customer.name}</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold font-sans">
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone size={12} className="text-slate-400" />
                  {customer.mobile || "-"}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar size={12} className="text-slate-400" />
                  Since: {customer.createdAt || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics Bento Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Total Orders Card */}
            <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between group hover:border-slate-200 transition-all">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                Total Orders
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-800 font-mono">
                  {stats.totalOrders}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase select-none">sales</span>
              </div>
            </div>

            {/* Total Amount Spent Card */}
            <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between group hover:border-slate-200 transition-all">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                Total Spent
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-[#8000FF] mr-0.5 font-sans">₹</span>
                <span className="text-xl font-black text-[#8000FF] font-mono">
                  {stats.totalSpent.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Last Purchase Date Card */}
            <div className="col-span-2 bg-white border border-slate-100 p-4.5 rounded-2xl shadow-3xs hover:border-slate-200 transition-all">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2 font-sans">
                Last Purchase Date
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} className="text-[#0066FF]" />
                <span className="text-[12.5px] font-black text-slate-705 font-mono">
                  {stats.lastPurchaseDate}
                </span>
              </div>
            </div>

            {/* Outstanding Credit Card */}
            <div className="col-span-2 bg-rose-50/20 border border-rose-100/60 p-4.5 rounded-2xl hover:border-rose-200/50 transition-all">
              <span className="text-[10px] font-extrabold text-rose-500/80 uppercase tracking-widest block mb-1">
                Outstanding Credit Balance
              </span>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-rose-600 mr-0.5 font-sans">₹</span>
                  <span className="text-xl font-black text-rose-600 font-mono">
                    {stats.outstandingCredit.toLocaleString("en-IN")}
                  </span>
                </div>
                {stats.outstandingCredit > 0 ? (
                  <span className="text-[10px] font-extrabold bg-rose-50 border border-rose-200 text-rose-650 px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                    Unpaid Balance
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                    Clear Balance
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              Close Summary
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PurchaseModel;
