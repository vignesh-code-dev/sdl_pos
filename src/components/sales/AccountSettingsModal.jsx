import React from "react";
import { X, CheckCircle } from "lucide-react";

const AccountSettingsModal = ({ show, onClose, selectedAccount, limitForm, setLimitForm, onSubmit }) => {
  if (!show || !selectedAccount) return null;

  return (
    <div id="settings-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Account Settings & Limit</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
              MANAGE CREDIT BOUNDARIES FOR {selectedAccount.customerName.toUpperCase()}
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
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs flex justify-between items-center font-bold text-blue-800 mb-1">
            <span>Current Outstanding Due:</span>
            <span className="font-extrabold font-mono text-sm">₹{selectedAccount.outstanding.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Limit input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Credit Limit (₹) *</label>
              <input
                id="limit-input"
                type="number"
                min="0"
                step="1"
                value={limitForm.creditLimit}
                onChange={(e) => setLimitForm({ ...limitForm, creditLimit: e.target.value })}
                placeholder="0"
                required
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>

            {/* Status select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Account Status *</label>
              <select
                id="status-select"
                value={limitForm.status}
                onChange={(e) => setLimitForm({ ...limitForm, status: e.target.value })}
                required
                className="w-full text-xs font-bold text-slate-750 bg-slate-50 border border-pos-border rounded-xl px-2 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Blocked">Blocked</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Credit Period */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Credit Period *</label>
              <select
                id="credit-period-select"
                value={limitForm.creditPeriod}
                onChange={(e) => setLimitForm({ ...limitForm, creditPeriod: e.target.value })}
                required
                className="w-full text-xs font-bold text-slate-755 bg-slate-50 border border-pos-border rounded-xl px-2 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
                <option value="45">45 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>

            {/* Approved By */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Approved By *</label>
              <input
                id="approved-by-input"
                type="text"
                value={limitForm.approvedBy}
                onChange={(e) => setLimitForm({ ...limitForm, approvedBy: e.target.value })}
                required
                placeholder="Approving Officer"
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Internal Notes</label>
            <input
              id="notes-input"
              type="text"
              value={limitForm.notes}
              onChange={(e) => setLimitForm({ ...limitForm, notes: e.target.value })}
              placeholder="E.g., Special corporate credit line approval details..."
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
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
              id="settings-submit-btn"
              type="submit"
              className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
            >
              <CheckCircle size={14} />
              UPDATE SETTINGS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
