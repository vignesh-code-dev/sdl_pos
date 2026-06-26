import React from "react";
import { X, CheckCircle } from "lucide-react";

const OpenAccountModal = ({
  show,
  onClose,
  customers,
  accounts,
  openAccountForm,
  setOpenAccountForm,
  onSubmit
}) => {
  if (!show) return null;

  const eligibleCustomers = customers.filter(c => !accounts.some(acc => acc.customerId === c.id));

  return (
    <div id="open-account-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Open Credit Account</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
              ENABLE CREDIT LINE FOR REGISTERED CUSTOMERS
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Choose Customer */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Select Customer *</label>
            <select
              id="open-account-customer-select"
              value={openAccountForm.customerId}
              onChange={(e) => {
                const cust = customers.find(c => c.id === e.target.value);
                setOpenAccountForm({
                  ...openAccountForm,
                  customerId: e.target.value,
                  customerPhone: cust ? cust.mobile : ""
                });
              }}
              required
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-pos-border rounded-xl px-2 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="">-- Choose Registered Contact --</option>
              {eligibleCustomers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile})
                </option>
              ))}
            </select>
            {eligibleCustomers.length === 0 && (
              <p className="text-[10px] text-brand-danger font-bold mt-1">
                * All currently registered clients have active credit layouts.
              </p>
            )}
          </div>

          {/* Read-Only Phone Number (derived) */}
          {openAccountForm.customerId && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Customer Phone Number</label>
              <input
                id="open-account-phone-input"
                type="text"
                readOnly
                value={openAccountForm.customerPhone || ""}
                className="w-full text-xs font-bold text-slate-500 bg-slate-100 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none font-mono cursor-not-allowed"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Set Limit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Credit Limit (₹) *</label>
              <input
                id="open-account-limit-input"
                type="number"
                min="1"
                step="1"
                value={openAccountForm.creditLimit}
                onChange={(e) => setOpenAccountForm({ ...openAccountForm, creditLimit: e.target.value })}
                placeholder="Eg: 10000"
                required
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>

            {/* Credit Period */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Credit Period (Days) *</label>
              <select
                id="open-account-period-select"
                value={openAccountForm.creditPeriod}
                onChange={(e) => setOpenAccountForm({ ...openAccountForm, creditPeriod: e.target.value })}
                required
                className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-pos-border rounded-xl px-2 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
                <option value="45">45 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Internal Notes</label>
            <input
              id="open-account-notes-input"
              type="text"
              value={openAccountForm.notes}
              onChange={(e) => setOpenAccountForm({ ...openAccountForm, notes: e.target.value })}
              placeholder="E.g., wholesale corporate order notes..."
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Approved By */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Approved By *</label>
            <input
              id="open-account-approved-input"
              type="text"
              value={openAccountForm.approvedBy}
              onChange={(e) => setOpenAccountForm({ ...openAccountForm, approvedBy: e.target.value })}
              required
              placeholder="E.g., System Administrator"
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2.5 pt-4 border-t border-pos-border flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
            >
              CANCEL
            </button>
            <button
              id="open-account-submit-btn"
              type="submit"
              disabled={eligibleCustomers.length === 0}
              className="flex-1 py-2.5 bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
            >
              <CheckCircle size={14} />
              ENABLE ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenAccountModal;
