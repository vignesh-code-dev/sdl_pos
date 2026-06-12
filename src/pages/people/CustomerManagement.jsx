import React, { useState, useEffect } from "react";
import {
  UserPlus,
  User,
  Trash2,
  Users,
  Search,
  Download,
  Edit2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  X,
  AlertCircle
} from "lucide-react";

const CustomerManagement = () => {
  // Load customers from localStorage
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("billmate_customers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Error reading billmate_customers", err);
      }
    }
    // Default fallback seed if none exists
    const initialSeededCustomers = [
      { id: "C-1", name: "Rahul Sharma", mobile: "9876543210", email: "rahul@gmail.com", address: "Flat 402, Green Glen Layout, Bengaluru", createdAt: "2026-01-15" },
      { id: "C-2", name: "Priya Patel", mobile: "8765432109", email: "priya@gmail.com", address: "Sector 15, Vashi, Navi Mumbai", createdAt: "2026-02-18" },
      { id: "C-3", name: "Amit Kumar", mobile: "7654321098", email: "amit@gmail.com", address: "H-12, Lajpat Nagar, New Delhi", createdAt: "2026-03-05" }
    ];
    localStorage.setItem("billmate_customers", JSON.stringify(initialSeededCustomers));
    return initialSeededCustomers;
  });

  // Keep localStorage sync when customers change
  useEffect(() => {
    localStorage.setItem("billmate_customers", JSON.stringify(customers));
  }, [customers]);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  
  // Form fields state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: ""
  });
  const [validationError, setValidationError] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const [customConfirm, setCustomConfirm] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDanger: false,
    confirmText: "Yes, Proceed",
    cancelText: "Cancel"
  });

  // Handle delete
  const handleDeleteCustomer = (id, name) => {
    setCustomConfirm({
      isOpen: true,
      title: "Delete Customer",
      message: `Are you sure you want to permanently delete customer "${name}" from your records? This action cannot be undone.`,
      isDanger: true,
      confirmText: "Delete Customer",
      cancelText: "Cancel",
      onConfirm: () => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
        showToast(`Customer "${name}" was permanently deleted.`, "success");
      }
    });
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingCustomerId(null);
    setFormData({ name: "", mobile: "", email: "", address: "" });
    setValidationError("");
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (cust) => {
    setModalMode("edit");
    setEditingCustomerId(cust.id);
    setFormData({
      name: cust.name || "",
      mobile: cust.mobile || "",
      email: cust.email || "",
      address: cust.address || ""
    });
    setValidationError("");
    setShowModal(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    const trimmedName = formData.name.trim();
    const trimmedMobile = formData.mobile.replace(/\s+/g, "");
    const trimmedEmail = formData.email.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) {
      setValidationError("Customer Name is required.");
      return;
    }

    if (!trimmedMobile) {
      setValidationError("Contact Phone / Mobile number is required.");
      return;
    }

    // Basic Mobile validations (digits only and at least 10 digits for pos compatibility)
    if (!/^\d{10}$/.test(trimmedMobile)) {
      setValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Check for duplicate mobile
    const duplicate = customers.find(c => c.mobile === trimmedMobile && c.id !== editingCustomerId);
    if (duplicate) {
      setValidationError(`Another customer with mobile ${trimmedMobile} already exists (${duplicate.name}).`);
      return;
    }

    if (modalMode === "add") {
      const newCustomer = {
        id: `C-${Date.now()}`,
        name: trimmedName,
        mobile: trimmedMobile,
        email: trimmedEmail || "-",
        address: trimmedAddress || "-",
        createdAt: new Date().toISOString().split("T")[0]
      };
      setCustomers(prev => [newCustomer, ...prev]);
    } else {
      setCustomers(prev => prev.map(c => {
        if (c.id === editingCustomerId) {
          return {
            ...c,
            name: trimmedName,
            mobile: trimmedMobile,
            email: trimmedEmail || "-",
            address: trimmedAddress || "-"
          };
        }
        return c;
      }));
    }

    setShowModal(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvHeader = "ID,Name,Phone,Email,Address,Added On\n";
    const csvRows = customers.map(c => 
      `"${c.id}","${(c.name || "").replace(/"/g, '""')}","${c.mobile || ""}","${(c.email || "").replace(/"/g, '""')}","${(c.address || "").replace(/"/g, '""')}","${c.createdAt || ""}"`
    ).join("\n");
    
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `billmate_customers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search customers
  const filteredCustomers = customers.filter(c => {
    const searchVal = searchQuery.toLowerCase().trim();
    if (!searchVal) return true;
    return (
      (c.name || "").toLowerCase().includes(searchVal) ||
      (c.mobile || "").toLowerCase().includes(searchVal) ||
      (c.email || "").toLowerCase().includes(searchVal)
    );
  });

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900">
      {/* Search and Utility Panel */}
      <div className="bg-white border border-pos-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search custom database by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>

        <div className="flex gap-2">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Add Customer Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Main Customers Table list */}
      <div className="flex-1 overflow-y-auto scrollbar-light">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-pos-border rounded-2xl p-20 text-center text-slate-450">
            <Users size={44} className="mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-sm text-slate-700">No Customers Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No customer records matched your query or have been registered yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-pos-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-550 text-[10px] font-bold uppercase tracking-wider border-b border-pos-border">
                  <tr>
                    <th className="py-3.5 px-5 w-12">User</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-500">Name</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-500">Phone</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-500">Email Address</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-500">Physical Address</th>
                    <th className="py-3.5 px-4 font-extrabold text-slate-500">Added On</th>
                    <th className="py-3.5 px-5 text-center w-28 font-extrabold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border text-xs text-slate-700 font-sans">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center font-bold">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {c.mobile}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-650">
                        {c.email && c.email !== "-" ? (
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />
                            {c.email}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={c.address}>
                        {c.address && c.address !== "-" ? (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{c.address}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {c.createdAt}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="Edit Customer Profile"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Customer Profile"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Elegant Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-pos-border px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {modalMode === "add" ? "Register New Customer" : "Edit Customer Profile"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Keep customer lookup synced across POS lanes</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer font-sans"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {validationError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs leading-relaxed">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Customer Name *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-9 bg-slate-50 border border-pos-border rounded-xl pl-9 pr-3 text-xs font-semibold text-slate-850 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Phone / Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, "") }))}
                    className="w-full h-9 bg-slate-50 border border-pos-border rounded-xl pl-9 pr-3 text-xs font-semibold text-slate-850 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-mono"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full h-9 bg-slate-50 border border-pos-border rounded-xl pl-9 pr-3 text-xs font-medium text-slate-850 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Address (Optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  Physical Address (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">
                    <MapPin size={14} />
                  </span>
                  <textarea
                    placeholder="Home or Business Address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-slate-50 border border-pos-border rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-850 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-pos-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-9 border border-slate-250 hover:bg-slate-100 text-slate-650 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {modalMode === "add" ? "Save Customer" : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[250] max-w-sm bg-slate-900 border border-slate-800 text-white px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            toast.type === "success" ? "bg-emerald-500" :
            toast.type === "warning" ? "bg-amber-500" :
            toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
          }`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Custom React Confirm Dialog Box */}
      {customConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4 font-sans text-slate-800">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-tight flex items-center gap-1.5">
              {customConfirm.isDanger ? (
                <span className="text-rose-500 font-extrabold flex items-center gap-1">⚠️ Error / Danger</span>
              ) : (
                <span className="text-emerald-500 font-extrabold flex items-center gap-1">💡 Action Required</span>
              )}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              {customConfirm.message}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCustomConfirm(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer border-0 transition-colors"
              >
                {customConfirm.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={customConfirm.onConfirm}
                className={`flex-1 h-10 text-white rounded-xl text-xs font-bold cursor-pointer border-0 transition-colors ${
                  customConfirm.isDanger
                    ? "bg-rose-600 hover:bg-rose-700 shadow-sm"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-sm"
                }`}
              >
                {customConfirm.confirmText || "Yes, Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerManagement;
