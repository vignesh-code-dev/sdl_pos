import React, { useState, useEffect } from "react";
import { Edit2, X, Save } from "lucide-react";

export default function EditInvoiceModal({
  isOpen,
  invoice,
  onClose,
  onSave,
}) {
  const [editedInvoice, setEditedInvoice] = useState(null);

  useEffect(() => {
    if (invoice) {
      setEditedInvoice({ ...invoice });
    } else {
      setEditedInvoice(null);
    }
  }, [invoice]);

  if (!isOpen || !editedInvoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedInvoice);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 no-print animate-in fade-in duration-150">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-500">
            <Edit2 size={16} />
            <span className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Edit Order Metadata</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Invoice Hash Key:</span>
              <span className="font-bold text-slate-800">{editedInvoice.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Grand Total Sale (₹):</span>
              <span className="font-bold text-slate-800">₹{editedInvoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black uppercase text-slate-400">Customer Name</label>
            <input
              type="text"
              required
              value={editedInvoice.customerName}
              onChange={(e) => setEditedInvoice({ ...editedInvoice, customerName: e.target.value })}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Customer Mobile */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black uppercase text-slate-400">Customer Mobile</label>
            <input
              type="text"
              required
              value={editedInvoice.customerMobile}
              onChange={(e) => setEditedInvoice({ ...editedInvoice, customerMobile: e.target.value })}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black uppercase text-slate-400">Payment Method</label>
            <select
              value={editedInvoice.paymentMethod || "CASH"}
              onChange={(e) => setEditedInvoice({ ...editedInvoice, paymentMethod: e.target.value })}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="CASH">Cash Payment</option>
              <option value="CARD">Card Swipe</option>
              <option value="UPI">Bank Mobile Transfer (UPI)</option>
            </select>
          </div>

          {/* Amount Paid */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black uppercase text-slate-400">Amount Tendered Paid (₹)</label>
            <input
              type="number"
              min="0"
              max={editedInvoice.grandTotal}
              step="0.01"
              required
              value={editedInvoice.paidAmount}
              onChange={(e) => setEditedInvoice({ ...editedInvoice, paidAmount: parseFloat(e.target.value) || 0 })}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Status Selector */}
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black uppercase text-slate-400">Transaction Status</label>
            <select
              value={editedInvoice.status || "Active"}
              onChange={(e) => setEditedInvoice({ ...editedInvoice, status: e.target.value })}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Active">Active / Approved</option>
              <option value="Cancelled">Cancelled / Voided Order</option>
            </select>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 border-t border-gray-200 p-4 flex gap-3 font-sans">
          <button
            type="submit"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors border-0"
          >
            <Save size={14} />
            <span>Save Registry Changes</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 text-xs font-bold rounded-xl cursor-pointer border-0"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
