import React from "react";
import { X, ShieldAlert, CheckCircle } from "lucide-react";

const ConfirmModal = ({ show, onClose, confirmConfig, onConfirm }) => {
  if (!show || !confirmConfig) return null;

  return (
    <div id="confirm-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{confirmConfig.title}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-bold">LEDGER SYSTEM SECURITY COMPLIANCE</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <div
              className={`p-3 rounded-full shrink-0 h-11 w-11 flex items-center justify-center border
              ${
                confirmConfig.type === "archive_required"
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              <ShieldAlert size={20} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700 leading-relaxed">{confirmConfig.message}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-4 border-t border-pos-border flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
            >
              CANCEL
            </button>
            <button
              id="confirm-action-btn"
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs
                ${
                  confirmConfig.type === "archive_required" || confirmConfig.type === "archive"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
            >
              <CheckCircle size={14} />
              {confirmConfig.actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
