import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  CreditCard,
  Trash2,
  Edit,
  AlertCircle,
  Filter,
  FileText,
  CheckCircle,
  DollarSign,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  User,
  Phone,
  BarChart2,
  Calendar,
  Lock,
  Unlock,
  Printer,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ArrowLeftRight
} from "lucide-react";

const DepositAccounts = () => {
  // 1. Core lists
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // 2. Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Outstanding", "Settled"

  // Pagination config
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page upon filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // 3. Modal Controls
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showOpenAccountModal, setShowOpenAccountModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // 4. Selected Items
  const [selectedAccount, setSelectedAccount] = useState(null);

  // 5. Form States
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    description: "Paid at checkdesk"
  });

  const [limitForm, setLimitForm] = useState({
    creditLimit: ""
  });

  const [openAccountForm, setOpenAccountForm] = useState({
    customerId: "",
    creditLimit: "10000"
  });

  // 6. UI Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // 7. Load data & seed defaults
  useEffect(() => {
    // Load existing customers
    let savedCustomers = JSON.parse(localStorage.getItem("billmate_customers") || "[]");
    if (savedCustomers.length === 0) {
      // Seed default customers to align with system presets
      savedCustomers = [
        { id: "C-1", name: "Rahul Sharma", mobile: "9876543210", email: "rahul@gmail.com", address: "Flat 402, Green Glen Layout, Bengaluru", createdAt: "2026-01-15" },
        { id: "C-2", name: "Priya Patel", mobile: "8765432109", email: "priya@gmail.com", address: "Sector 15, Vashi, Navi Mumbai", createdAt: "2026-02-18" },
        { id: "C-3", name: "Amit Kumar", mobile: "7654321098", email: "amit@gmail.com", address: "H-12, Lajpat Nagar, New Delhi", createdAt: "2026-03-05" }
      ];
      localStorage.setItem("billmate_customers", JSON.stringify(savedCustomers));
    }
    setCustomers(savedCustomers);

    // Load Invoices
    const savedInvoices = JSON.parse(localStorage.getItem("billmate_invoices") || "[]");
    setInvoices(savedInvoices);

    // Load credit accounts
    const savedAccounts = localStorage.getItem("billmate_deposit_accounts");
    if (!savedAccounts) {
      // Seed default deposit/credit history aligned to Rahul Sharma, Priya Patel, and Amit Kumar
      const defaultAccounts = [
        {
          customerId: "C-1",
          customerName: "Rahul Sharma",
          customerMobile: "9876543210",
          creditLimit: 10000,
          creditGiven: 3500,
          paymentsReceived: 2000,
          outstanding: 1500,
          transactions: [
            { id: "TX-1001", date: "Jun 8, 2026, 11:32 AM", type: "CREDIT", amount: 2500, description: "POS Purchase on Credit (INV-202606-1024)" },
            { id: "TX-1002", date: "Jun 8, 2026, 04:30 PM", type: "PAYMENT", amount: 2000, description: "Invoice part-payment settlement", method: "CASH" },
            { id: "TX-1003", date: "Jun 11, 2026, 10:15 AM", type: "CREDIT", amount: 1000, description: "Fresh POS store-credit buy" }
          ]
        },
        {
          customerId: "C-2",
          customerName: "Priya Patel",
          customerMobile: "8765432109",
          creditLimit: 15000,
          creditGiven: 5500,
          paymentsReceived: 1500,
          outstanding: 4000,
          transactions: [
            { id: "TX-1004", date: "Jun 7, 2026, 03:45 PM", type: "CREDIT", amount: 5500, description: "Credit billing checkout (INV-202606-2048)" },
            { id: "TX-1005", date: "Jun 9, 2026, 06:15 PM", type: "PAYMENT", amount: 1500, description: "Received via UPI bank account", method: "UPI" }
          ]
        },
        {
          customerId: "C-3",
          customerName: "Amit Kumar",
          customerMobile: "7654321098",
          creditLimit: 5000,
          creditGiven: 0,
          paymentsReceived: 0,
          outstanding: 0,
          transactions: []
        }
      ];
      localStorage.setItem("billmate_deposit_accounts", JSON.stringify(defaultAccounts));
      setAccounts(defaultAccounts);
    } else {
      setAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  // Save to LocalStorage whenever accounts update
  const saveAccounts = (updatedAccounts) => {
    setAccounts(updatedAccounts);
    localStorage.setItem("billmate_deposit_accounts", JSON.stringify(updatedAccounts));
  };

  // --- ACTIONS ---

  // 1. Open credit account for a customer
  const handleOpenAccount = (e) => {
    e.preventDefault();
    if (!openAccountForm.customerId) {
      showToast("Please choose a valid customer", "warning");
      return;
    }
    const targetCustomer = customers.find(c => c.id === openAccountForm.customerId);
    if (!targetCustomer) return;

    // Check if account already exists
    const duplicate = accounts.find(acc => acc.customerId === targetCustomer.id);
    if (duplicate) {
      showToast("This customer already has a credit account!", "warning");
      return;
    }

    const limit = parseFloat(openAccountForm.creditLimit) || 0;
    if (limit <= 0) {
      showToast("Credit limit must be a positive number", "warning");
      return;
    }

    const newAccObj = {
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerMobile: targetCustomer.mobile,
      creditLimit: limit,
      creditGiven: 0,
      paymentsReceived: 0,
      outstanding: 0,
      transactions: []
    };

    const newAccs = [...accounts, newAccObj];
    saveAccounts(newAccs);
    setShowOpenAccountModal(false);
    setOpenAccountForm({ customerId: "", creditLimit: "10000" });
    showToast(`Credit account enabled for ${targetCustomer.name}!`);
  };

  // 2. Record payment towards credit account
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) {
      showToast("Please enter a valid amount greater than ₹0", "warning");
      return;
    }

    if (amount > selectedAccount.outstanding) {
      // Allow extra deposit payment, which can create a negative outstanding (deposit balance!)
      // Simply warn or register it. We support this as a versatile "Deposit" aspect.
    }

    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      type: "PAYMENT",
      amount: amount,
      description: paymentForm.description || "Credit settlement pay",
      method: paymentForm.paymentMethod
    };

    const updated = accounts.map(acc => {
      if (acc.customerId === selectedAccount.customerId) {
        const nextPayments = acc.paymentsReceived + amount;
        const nextOutstanding = Math.max(-100000, acc.creditGiven - nextPayments);
        return {
          ...acc,
          paymentsReceived: parseFloat(nextPayments.toFixed(2)),
          outstanding: parseFloat(nextOutstanding.toFixed(2)),
          transactions: [newTx, ...acc.transactions]
        };
      }
      return acc;
    });

    saveAccounts(updated);
    setShowPaymentModal(false);
    setPaymentForm({ amount: "", paymentMethod: "CASH", description: "Paid at counter desk" });
    showToast(`Received payment of ₹${amount.toFixed(2)} from ${selectedAccount.customerName}!`);
  };

  // 3. Edit credit limit
  const handleUpdateLimit = (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const newLimit = parseFloat(limitForm.creditLimit) || 0;
    if (newLimit < 0) {
      showToast("Credit limit cannot be negative!", "warning");
      return;
    }

    const updated = accounts.map(acc => {
      if (acc.customerId === selectedAccount.customerId) {
        return {
          ...acc,
          creditLimit: newLimit
        };
      }
      return acc;
    });

    saveAccounts(updated);
    setShowLimitModal(false);
    showToast(`Credit limit updated to ₹${newLimit.toFixed(2)} for ${selectedAccount.customerName}`);
  };

  // --- STATS COMPUTATION ---
  const totalCreditGiven = accounts.reduce((sum, acc) => sum + (acc.creditGiven || 0), 0);
  const totalPayments = accounts.reduce((sum, acc) => sum + (acc.paymentsReceived || 0), 0);
  const totalOutstanding = accounts.reduce((sum, acc) => sum + (acc.outstanding || 0), 0);
  const activeAccountsCount = accounts.filter(acc => acc.outstanding > 0).length;

  // --- SEARCH AND FILTER LOGIC ---
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.customerMobile.includes(searchQuery);

    if (statusFilter === "All") return matchesSearch;
    if (statusFilter === "Outstanding") return matchesSearch && acc.outstanding > 0;
    if (statusFilter === "Settled") return matchesSearch && acc.outstanding <= 0;

    return matchesSearch;
  });

  // --- 8.5 PAGINATION CALCULATIONS ---
  const totalRecords = filteredAccounts.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6 bg-pos-bg overflow-x-hidden min-h-screen text-slate-800 font-sans">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-lg text-white font-semibold text-xs shadow-md transition-all duration-300 transform translate-y-0
          ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <CheckCircle size={15} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header section with page title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-pos-card border border-pos-border p-5 rounded shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-primary flex items-center gap-2">
           
            Deposit Accounts Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer credit accounts, track loans extended, deposits made, and active outstanding balances.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowOpenAccountModal(true)}
            className="flex items-center gap-1.5 text-sm font-extrabold bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded transition-colors shadow-sm cursor-pointer border-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            Open Credit Account
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Credit Given */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Credit Given</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight block font-mono">₹{totalCreditGiven.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-[13px] text-slate-400 font-medium block ">Cumulative credit extended</span>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
            <ArrowUpCircle size={20} />
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Payments</span>
            <span className="text-3xl font-black text-emerald-700 tracking-tight block font-mono">₹{totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-[13px] text-slate-400 font-medium block">Payments credited to accounts</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <ArrowDownCircle size={20} />
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Outstanding Balance</span>
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
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Active Accounts</span>
            <span className="text-3xl font-black text-blue-600 tracking-tight block font-mono">{activeAccountsCount}</span>
            <span className="text-[13px] text-slate-400 font-medium block">Customers with unpaid balances</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
        </div>

      </div>

      {/* FILTERS DOCK */}
      <div className="bg-pos-card border border-pos-border p-5 rounded shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        
        {/* Searching */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Search size={11} className="text-brand-primary" />
            <span>Search Customer Registry</span>
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credit customer by name or phone..."
            className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 border border-pos-border rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Filtering */}
        <div className="space-y-3">
          <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Filter size={11} className="text-brand-primary" />
            <span>Balance State Filter</span>
          </label>
          <div className="flex bg-slate-50 border border-pos-border rounded p-1 justify-between">
            <button
              type="button"
              onClick={() => setStatusFilter("All")}
              className={`flex-1 text-center py-1.5 text-[13px] font-extrabold rounded transition-colors cursor-pointer border-0 ${
                statusFilter === "All"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Outstanding")}
              className={`flex-1 text-center py-1.5 text-[13px] font-bold rounded transition-colors cursor-pointer border-0 ${
                statusFilter === "Outstanding"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              DUE ({accounts.filter(a => a.outstanding > 0).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Settled")}
              className={`flex-1 text-center py-1.5 text-[13px] font-bold rounded transition-colors cursor-pointer border-0 ${
                statusFilter === "Settled"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              SETTLED
            </button>
          </div>
        </div>

      </div>

      {/* DATA TABLE CARD */}
      <div className="bg-pos-card border border-pos-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-pos-border text-white uppercase text-xs font-semibold tracking-wider bg-emerald-600">
                <th className="p-4 text-xs font-semibold uppercase">Customer Name & Info</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Credit Limit</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Credit Extended (Dr)</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Payments Made (Cr)</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Outstanding (Due)</th>
                <th className="p-4 text-xs font-semibold uppercase">Account Standing</th>
                <th className="p-4 text-center text-xs font-semibold uppercase w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border/50 text-sm font-medium text-text-secondary">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center p-6 max-w-sm mx-auto">
                      <div className="p-3.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 mb-2">
                        <AlertCircle size={28} />
                      </div>
                      <p className="font-bold text-slate-750 text-sm">No Credit Accounts Found</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Try refining your search terms or create a credit account for a registered customer.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((acc) => {
                  const usedPercentage = acc.creditLimit > 0 ? Math.min(100, Math.max(0, (acc.outstanding / acc.creditLimit) * 100)) : 0;
                  return (
                    <tr key={acc.customerId} className="hover:bg-slate-50/40 transition-colors text-sm font-medium text-text-secondary">
                      {/* Name & Contact */}
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">
                            {acc.customerName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1 font-mono uppercase">
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
                        <span className={acc.outstanding > 0 ? "text-brand-danger" : "text-emerald-700"}>
                          ₹{acc.outstanding.toFixed(2)}
                        </span>
                      </td>

                      {/* Remaining Progress or bar */}
                      <td className="p-4 min-w-[150px]">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>Limit Used</span>
                            <span>{usedPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-100">
                            <div 
                              className={`h-full rounded-full transition-all duration-300
                                ${usedPercentage > 85 ? "bg-brand-danger" : usedPercentage > 50 ? "bg-brand-warning" : "bg-brand-success"}`}
                              style={{ width: `${usedPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Ledger */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAccount(acc);
                              setShowLedgerModal(true);
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-pos-border bg-white rounded flex items-center justify-center cursor-pointer transition-all shadow-5xs"
                            title="View Transaction History"
                          >
                            <FileText size={13} strokeWidth={2.5} />
                          </button>

                          {/* Limit */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAccount(acc);
                              setLimitForm({ creditLimit: acc.creditLimit.toString() });
                              setShowLimitModal(true);
                            }}
                            className="h-8 w-8 text-brand-warning hover:text-brand-warning/90 hover:bg-amber-50/50 border border-pos-border bg-white rounded flex items-center justify-center cursor-pointer transition-all shadow-5xs"
                            title="Adjust Limit"
                          >
                            <Edit size={13} strokeWidth={2.5} />
                          </button>

                          {/* Record Pay */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAccount(acc);
                              setShowPaymentModal(true);
                            }}
                            className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-5xs"
                            title="Collect Cash Deposit"
                          >
                            <CreditCard size={11} strokeWidth={2.5} />
                            PAY
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

        {/* Summary Footer on Filtered Amount with Pagination Controls */}
        <div className="bg-slate-50/50 p-4 border-t border-pos-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-600 gap-2 select-none border-0">
          {totalRecords > 0 ? (
            <span>
              Showing <span className="font-extrabold text-slate-700">{startIndex + 1}</span> to{" "}
              <span className="font-extrabold text-slate-700">
                {Math.min(totalRecords, startIndex + itemsPerPage)}
              </span>{" "}
              of <span className="font-extrabold text-slate-700">{totalRecords}</span> entries (Filtered from {accounts.length} total)
            </span>
          ) : (
            <span>Showing 0 of 0 entries</span>
          )}

          {totalRecords > 0 && (
            <div className="flex items-center gap-1">
              {/* Chevron Back control */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 border border-[#eee] bg-white text-slate-500 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/60 font-sans font-bold flex items-center justify-center cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={12} strokeWidth={3} />
              </button>

              {/* Page indexes */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => {
                const isFirst = page === 1;
                const isLast = page === totalPages;
                const isNearCurrent = Math.abs(page - currentPage) <= 1;

                if (totalPages > 5 && !isFirst && !isLast && !isNearCurrent) {
                  if (page === 2 && currentPage > 3) {
                    return (
                      <span key="ellipsis-start" className="px-1 text-slate-300 font-extrabold select-none">
                        ...
                      </span>
                    );
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 2) {
                    return (
                      <span key="ellipsis-end" className="px-1 text-slate-300 font-extrabold select-none">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 flex items-center justify-center rounded text-xs transition-all border cursor-pointer ${
                      isActive
                        ? "bg-brand-primary border-brand-primary text-white font-bold"
                        : "bg-white border-pos-border text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Chevron Next control */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 border border-[#eee] bg-white text-slate-500 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/60 font-sans font-bold flex items-center justify-center cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight size={12} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: RECORD CUSTOMER DEPOSIT PAYMENT / SETTLEMENT */}
      {showPaymentModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Collect Credit Payment</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">RECEIVE SETTLEMENT FOR {selectedAccount.customerName.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              
              <div className="bg-rose-50/50 border border-rose-150 rounded-xl p-3.5 text-xs flex justify-between items-center font-bold text-brand-danger mb-1">
                <span>Account Credit Due:</span>
                <span className="font-black text-sm font-mono">₹{selectedAccount.outstanding.toFixed(2)}</span>
              </div>

              {/* Amount to Pay */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Payment Amount (₹) *</label>
                <input
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

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Collect Via Method</label>
                <select
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Internal Reference / Note</label>
                <input
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
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
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
      )}

      {/* MODAL 2: ADJUST CUSTOMER CREDIT LIMIT */}
      {showLimitModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Adjust Credit Limit</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">SET ALLOWED LIMIT FOR {selectedAccount.customerName.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateLimit} className="p-5 space-y-4">
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs flex justify-between items-center font-bold text-blue-800 mb-1">
                <span>Current Outstanding Due:</span>
                <span className="font-extrabold font-mono">₹{selectedAccount.outstanding.toFixed(2)}</span>
              </div>

              {/* Limit input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">New Credit Limit Total (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={limitForm.creditLimit}
                  onChange={(e) => setLimitForm({ ...limitForm, creditLimit: e.target.value })}
                  placeholder="0"
                  required
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary font-mono placeholder:font-sans placeholder:text-slate-400 placeholder:font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                  The client will not be allowed to buy items on POS layout exceeding this numeric state limit.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-4 border-t border-pos-border flex-row">
                <button
                  type="button"
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
                >
                  <CheckCircle size={14} />
                  UPDATE LIMIT
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ENABLE/OPEN CREDIT FOR EXISTING CUSTOMER */}
      {showOpenAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Open Credit Account</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">ENABLE CREDIT LINE FOR IN-HOUSE CLIENTS</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenAccountModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleOpenAccount} className="p-5 space-y-4">
              
              {/* Choose Customer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Select Customer *</label>
                <select
                  value={openAccountForm.customerId}
                  onChange={(e) => setOpenAccountForm({ ...openAccountForm, customerId: e.target.value })}
                  required
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-pos-border rounded-xl px-2 py-2.5 focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="">-- Choose Registered Contact --</option>
                  {customers
                    .filter(c => !accounts.some(acc => acc.customerId === c.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile})
                      </option>
                    ))}
                </select>
                {customers.filter(c => !accounts.some(acc => acc.customerId === c.id)).length === 0 && (
                  <p className="text-[10px] text-brand-danger font-bold mt-1">
                    * All currently registered clients have active credit layouts.
                  </p>
                )}
              </div>

              {/* Set Limit */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Allowed Credit Ceiling (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={openAccountForm.creditLimit}
                  onChange={(e) => setOpenAccountForm({ ...openAccountForm, creditLimit: e.target.value })}
                  placeholder="Eg: 10000"
                  required
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary font-mono placeholder:font-sans placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-4 border-t border-pos-border flex-row">
                <button
                  type="button"
                  onClick={() => setShowOpenAccountModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={customers.filter(c => !accounts.some(acc => acc.customerId === c.id)).length === 0}
                  className="flex-1 py-2.5 bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
                >
                  <CheckCircle size={14} />
                  ENABLE ACCOUNT
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAILED LEDGER TRANSACTION LOG / AUDIT HISTORY */}
      {showLedgerModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-lg border border-pos-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-pos-border p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Debit & Credit Ledger</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">LEDGER LOGS OF {selectedAccount.customerName.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLedgerModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              
              {/* Account Quick Stats Box */}
              <div className="grid grid-cols-3 gap-3.5 bg-slate-50 p-4 border border-pos-border rounded-xl">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Allowed Limit</span>
                  <span className="text-sm font-bold text-slate-700 mt-0.5 block font-mono">₹{selectedAccount.creditLimit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Deposited Pay</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block font-mono">₹{selectedAccount.paymentsReceived.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Outstanding Due</span>
                  <span className={`text-sm font-black mt-0.5 block font-mono ${selectedAccount.outstanding > 0 ? "text-brand-danger" : "text-emerald-700"}`}>
                    ₹{selectedAccount.outstanding.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="border border-pos-border rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2 border-b border-pos-border">
                  <div className="col-span-2 text-center font-mono">ID</div>
                  <div className="col-span-3">Timestamp</div>
                  <div className="col-span-2 text-center">Type</div>
                  <div className="col-span-3 select-none">Notes / Ref</div>
                  <div className="col-span-2 text-right">Amount (₹)</div>
                </div>

                <div className="overflow-y-auto max-h-[250px] divide-y divide-pos-border text-[11px] font-semibold text-slate-600 bg-white">
                  {(!selectedAccount.transactions || selectedAccount.transactions.length === 0) ? (
                    <div className="p-10 text-center text-slate-400 font-medium">
                      No debit or credit transactions recorded yet.
                    </div>
                  ) : (
                    selectedAccount.transactions.map((tx) => (
                      <div key={tx.id} className="hover:bg-slate-50/50 px-4 py-3 grid grid-cols-12 gap-2 uppercase font-sans tracking-wide items-center">
                        <div className="col-span-2 text-center font-mono text-[10px] text-slate-400 font-bold">{tx.id}</div>
                        <div className="col-span-3 text-slate-500 text-[10px] font-semibold font-mono">{tx.date}</div>
                        <div className="col-span-2 text-center">
                          <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded
                            ${tx.type === "CREDIT" ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-emerald-50 text-emerald-700 border border-emerald-150"}`}>
                            {tx.type}
                          </span>
                        </div>
                        <div className="col-span-3 text-slate-700 font-sans truncate normal-case font-medium" title={tx.description}>{tx.description}</div>
                        <div className="col-span-2 text-right font-bold font-mono">
                          <span className={tx.type === "CREDIT" ? "text-brand-danger" : "text-emerald-700"}>
                            {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* print layout bottom */}
              <div className="pt-3 border-t border-pos-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-pos-border text-slate-600 rounded-xl text-xs font-extrabold cursor-pointer transition-all"
                >
                  CLOSE LEDGER
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepositAccounts;
