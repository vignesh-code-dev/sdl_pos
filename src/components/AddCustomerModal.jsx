import React, { useState } from "react";
import { UserPlus, X } from "lucide-react";

export default function AddCustomerModal({
  isOpen,
  onClose,
  initialMobile = "",
  existingCustomers = [],
  onSaveCustomer,
}) {
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState(initialMobile);
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustError, setNewCustError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setNewCustError("");

    const trimmedName = newCustName.trim();
    const trimmedMobile = newCustPhone.replace(/\D/g, "");
    const trimmedEmail = newCustEmail.trim();
    const trimmedAddress = newCustAddress.trim();

    if (!trimmedName) {
      setNewCustError("Customer Name is required.");
      return;
    }
    if (!trimmedMobile || trimmedMobile.length !== 10) {
      setNewCustError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Check for duplicate phone
    const duplicate = existingCustomers.find(c => c.mobile === trimmedMobile);
    if (duplicate) {
      setNewCustError(`Customer with mobile ${trimmedMobile} already exists (${duplicate.name}).`);
      return;
    }

    const newCustomerObj = {
      id: `C-${Date.now()}`,
      name: trimmedName,
      mobile: trimmedMobile,
      email: trimmedEmail || "-",
      address: trimmedAddress || "-",
      createdAt: new Date().toISOString().split("T")[0]
    };

    onSaveCustomer(newCustomerObj);
  };

  return (
    <div className="no-print fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[120] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded shadow-xl w-full max-w-sm border border-slate-100 overflow-hidden text-slate-800 font-sans">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center">
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Register New Customer
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold tracking-normal">Directly save customer record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-650 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {newCustError && (
            <div className="bg-red-50 border border-red-200 text-red-700 py-2.5 px-3 rounded text-xs leading-relaxed font-semibold">
              {newCustError}
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="Enter Full Name"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-gray-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Phone / Mobile Number *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="10-digit mobile number"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full h-9 bg-slate-50 border border-gray-200 rounded px-3 text-xs font-semibold text-slate-850 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
            />
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={newCustEmail}
              onChange={(e) => setNewCustEmail(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-gray-200 rounded px-3 text-xs font-medium text-slate-850 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Address (Optional) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
              Physical Address (Optional)
            </label>
            <textarea
              placeholder="Home or Business Address"
              rows={2}
              value={newCustAddress}
              onChange={(e) => setNewCustAddress(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded px-3 py-2 text-xs font-medium text-slate-850 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none transition-all"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 border border-gray-250 hover:bg-slate-100 text-gray-650 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              Save & Select
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
