import React from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";

const CollectPaymentModal = ({
  show,
  onClose,
  selectedAccount,
  paymentForm,
  setPaymentForm,
  convertExcessToAdvance,
  setConvertExcessToAdvance,
  onSubmit
}) => {
  if (!show || !selectedAccount) return null;

  return (
    <div id="payment-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Collect Credit Payment</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
              RECEIVE SETTLEMENT FOR {selectedAccount.customerName.toUpperCase()}
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
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div className="bg-rose-50/50 border border-rose-150 rounded-xl p-3 text-xs flex flex-col justify-center font-bold text-brand-danger">
              <span className="text-[10px] uppercase text-rose-500 tracking-wider">Outstanding Due:</span>
              <span className="font-black text-sm font-mono mt-0.5">₹{selectedAccount.outstanding.toFixed(2)}</span>
            </div>
            <div className="bg-blue-50/50 border border-blue-150 rounded-xl p-3 text-xs flex flex-col justify-center font-bold text-blue-700">
              <span className="text-[10px] uppercase text-blue-500 tracking-wider">Advance Balance:</span>
              <span className="font-black text-sm font-mono mt-0.5">₹{(selectedAccount.advanceBalance || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-pos-border rounded-xl p-3 text-xs flex justify-between items-center font-bold text-slate-600">
            <span>Account Status:</span>
            {(() => {
              const st = selectedAccount.status || "Active";
              if (st === "Active")
                return (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                );
              if (st === "Suspended")
                return (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    Suspended
                  </span>
                );
              if (st === "Blocked")
                return (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-250">
                    Blocked
                  </span>
                );
              return (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-300">
                  Closed
                </span>
              );
            })()}
          </div>

          {/* Amount to Pay */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Payment Amount (₹) *</label>
            <input
              id="payment-amount-input"
              type="number"
              min="0.01"
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              placeholder="0.00"
              required
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary font-mono placeholder:font-sans placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          {/* Excess overpayment Handler Option */}
          {parseFloat(paymentForm.amount) > selectedAccount.outstanding && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 animate-fade-in">
              <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                <span>Notice: Amount exceeds outstanding balance.</span>
              </div>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                The customer will have an excess payment of{" "}
                <strong>₹{(parseFloat(paymentForm.amount) - selectedAccount.outstanding).toFixed(2)}</strong>. Please
                select how to handle this excess below:
              </p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="convert-excess-checkbox"
                  type="checkbox"
                  checked={convertExcessToAdvance}
                  onChange={(e) => setConvertExcessToAdvance(e.target.checked)}
                  className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary h-3.5 w-3.5 cursor-pointer"
                />
                <span className="text-[11px] text-slate-700 font-extrabold">
                  Convert excess to Customer Advance Balance
                </span>
              </label>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Collect Via Method</label>
            <select
              id="payment-method-select"
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-pos-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="CASH">CASH</option>
              <option value="UPI">UPI / PAYTM / PHONEPE</option>
              <option value="BANK">BANK TRANSFER / NEFT</option>
              <option value="CARD">CREDIT & DEBIT CARD</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
              Internal Reference / Note
            </label>
            <input
              id="payment-ref-note-input"
              type="text"
              value={paymentForm.description}
              onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
              placeholder="Eg: Handed cash on register desk"
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex gap-2.5 pt-4 border-t border-pos-border flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
            >
              CANCEL
            </button>
            <button
              id="payment-submit-btn"
              type="submit"
              className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
            >
              <CheckCircle size={14} />
              CONFIRM RECEIPT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectPaymentModal;
