import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  CreditCard,
  Trash2,
  Edit,
  AlertCircle,
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

  return (
    <div className="p-6 bg-[#f8fafc] min-h-[calc(100vh-60px)] font-sans">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-lg text-white font-semibold text-xs shadow-md transition-all duration-300 transform translate-y-0
          ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          <CheckCircle size={15} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header section with page title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wallet className="text-emerald-600" size={24} />
            DEPOSIT ACCOUNTS
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Manage customer credit accounts, track loans extended, deposits made, and active outstanding balances.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOpenAccountModal(true)}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs border-0 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            OPEN CREDIT ACCOUNT
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Credit Given */}
        <div className="bg-white rounded-xl p-4.5 border border-slate-100 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Credit Given</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">₹{totalCreditGiven.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">Cumulative credit extended</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <ArrowUpCircle size={24} />
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-white rounded-xl p-4.5 border border-slate-100 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Payments</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">Payments credited to accounts</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownCircle size={24} />
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white rounded-xl p-4.5 border border-slate-100 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Outstanding Balance</span>
            <span className={`text-2xl font-black mt-1 block ${totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              ₹{totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">Net receivable amount</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white rounded-xl p-4.5 border border-slate-100 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Accounts</span>
            <span className="text-2xl font-black text-blue-600 mt-block">{activeAccountsCount}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">Customers with unpaid balances</span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <User size={24} />
          </div>
        </div>

      </div>

      {/* FILTER & TABLE PANEL */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-3xs overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          
          {/* Searching */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search credit customer by name or phone..."
              className="w-full h-10 bg-white border border-slate-200 hover:border-slate-300 rounded-lg pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 transition-colors shadow-5xs"
            />
          </div>

          {/* Filtering */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Balance State:</span>
            <div className="flex bg-slate-100 p-0.5.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter("All")}
                className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold cursor-pointer transition-all border-0
                  ${statusFilter === "All" ? "bg-white text-slate-700 shadow-3xs" : "text-slate-400 hover:text-slate-700"}`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Outstanding")}
                className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold cursor-pointer transition-all border-0
                  ${statusFilter === "Outstanding" ? "bg-white text-rose-600 shadow-3xs" : "text-slate-400 hover:text-rose-600"}`}
              >
                OUTSTANDING ({accounts.filter(a => a.outstanding > 0).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Settled")}
                className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold cursor-pointer transition-all border-0
                  ${statusFilter === "Settled" ? "bg-white text-emerald-600 shadow-3xs" : "text-slate-400 hover:text-slate-700"}`}
              >
                CLEAR / DEPOSITED
              </button>
            </div>
          </div>

        </div>

        {/* Core Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                <th className="px-6 py-4">Customer Name & Info</th>
                <th className="px-6 py-4 text-right">Credit Limit</th>
                <th className="px-6 py-4 text-right">Credit Extended (Dr)</th>
                <th className="px-6 py-4 text-right">Payments Made (Cr)</th>
                <th className="px-6 py-4 text-right">Outstanding (Due)</th>
                <th className="px-6 py-4">Account Standing</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center p-6">
                      <AlertCircle className="text-slate-300 mb-2" size={32} />
                      <p className="font-bold text-sm text-slate-500">No Credit Accounts Found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try refining your search terms or create a credit account for a registered customer.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, index) => {
                  const usedPercentage = acc.creditLimit > 0 ? Math.min(100, Math.max(0, (acc.outstanding / acc.creditLimit) * 100)) : 0;
                  return (
                    <tr key={acc.customerId} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-6 py-4.5">
                        <div>
                          <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                            {acc.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1 font-mono uppercase">
                            <Phone size={10} />
                            {acc.customerMobile}
                          </div>
                        </div>
                      </td>

                      {/* Credit Limit */}
                      <td className="px-6 py-4.5 text-right font-extrabold text-slate-700 font-mono">
                        ₹{acc.creditLimit.toFixed(2)}
                      </td>

                      {/* Cumulative Credit given */}
                      <td className="px-6 py-4.5 text-right text-slate-600 font-mono font-semibold">
                        ₹{(acc.creditGiven || 0).toFixed(2)}
                      </td>

                      {/* Payments made */}
                      <td className="px-6 py-4.5 text-right text-emerald-600 font-mono font-semibold">
                        ₹{(acc.paymentsReceived || 0).toFixed(2)}
                      </td>

                      {/* Outstanding */}
                      <td className="px-6 py-4.5 text-right font-mono font-black">
                        <span className={acc.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}>
                          ₹{acc.outstanding.toFixed(2)}
                        </span>
                      </td>

                      {/* Remaining Progress or bar */}
                      <td className="px-6 py-4.5 min-w-[150px]">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>Limit Used</span>
                            <span>{usedPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300
                                ${usedPercentage > 85 ? "bg-rose-505 bg-rose-500" : usedPercentage > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${usedPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Ledger */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAccount(acc);
                              setShowLedgerModal(true);
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-150 border border-slate-200 bg-white rounded-md flex items-center justify-center cursor-pointer transition-all shadow-5xs"
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
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 bg-white rounded-md flex items-center justify-center cursor-pointer transition-all shadow-5xs"
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
                            className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-5xs"
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

      </div>

      {/* MODAL 1: RECORD CUSTOMER DEPOSIT PAYMENT / SETTLEMENT */}
      {showPaymentModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-slack border-slate-100 p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Collect Credit Payment</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">RECEIVE SETTLEMENT FOR {selectedAccount.customerName.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-450 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              
              <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 text-xs flex justify-between items-center font-bold text-rose-800 mb-1">
                <span>Account Credit Due:</span>
                <span className="font-black text-sm">₹{selectedAccount.outstanding.toFixed(2)}</span>
              </div>

              {/* Amount to Pay */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-sm font-extrabold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Collect Via Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI / PAYTM / PHONEPE</option>
                  <option value="BANK">BANK TRANSFER / NEFT</option>
                  <option value="CARD">CREDIT & DEBIT CARD</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Internal Reference / Note</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Eg: Handed cash on register desk"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-100 flex-row">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-600 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
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
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-slate-100 p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Adjust Credit Limit</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">SET ALLOWED LIMIT FOR {selectedAccount.customerName.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="text-slate-450 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateLimit} className="p-5 space-y-4">
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs flex justify-between items-center font-bold text-blue-800 mb-1">
                <span>Current Outstanding Due:</span>
                <span className="font-black">₹{selectedAccount.outstanding.toFixed(2)}</span>
              </div>

              {/* Limit input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">New Credit Limit Total (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={limitForm.creditLimit}
                  onChange={(e) => setLimitForm({ ...limitForm, creditLimit: e.target.value })}
                  placeholder="0"
                  required
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-sm font-extrabold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all font-mono"
                />
                <p className="text-[9.5px] text-slate-450 mt-1.5 leading-relaxed font-medium">
                  The client will not be allowed to buy items on POS layout exceeding this numeric state limit.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-100 flex-row">
                <button
                  type="button"
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-600 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
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
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-slate-100 p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Open Credit account</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">ENABLE CREDIT LINE FOR IN-HOUSE CLIENTS</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenAccountModal(false)}
                className="text-slate-450 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleOpenAccount} className="p-5 space-y-4">
              
              {/* Choose Customer */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-sans">Select Customer *</label>
                <select
                  value={openAccountForm.customerId}
                  onChange={(e) => setOpenAccountForm({ ...openAccountForm, customerId: e.target.value })}
                  required
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
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
                  <p className="text-[9.5px] text-rose-500 font-semibold mt-1">
                    * All currently registered clients have active credit layouts.
                  </p>
                )}
              </div>

              {/* Set Limit */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Allowed Credit Ceiling (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={openAccountForm.creditLimit}
                  onChange={(e) => setOpenAccountForm({ ...openAccountForm, creditLimit: e.target.value })}
                  placeholder="Eg: 10000"
                  required
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3.5 text-sm font-extrabold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-100 flex-row">
                <button
                  type="button"
                  onClick={() => setShowOpenAccountModal(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-600 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={customers.filter(c => !accounts.some(acc => acc.customerId === c.id)).length === 0}
                  className="flex-1 h-10 bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all border-0 shadow-xs"
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
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-slate-100 p-4.5 px-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Debit & Credit Ledger</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">LEDGER LOGS OF {selectedAccount.customerName.toUpperCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLedgerModal(false)}
                className="text-slate-450 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full border-0 cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-5">
              
              {/* Account Quick Stats Box */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 border border-slate-100 rounded-xl mb-4.5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Allowed Limit</span>
                  <span className="text-sm font-extrabold text-slate-700 mt-0.5 font-mono">₹{selectedAccount.creditLimit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Deposited Pay</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-0.5 font-mono">₹{selectedAccount.paymentsReceived.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Outstanding Due</span>
                  <span className={`text-sm font-black mt-0.5 font-mono ${selectedAccount.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ₹{selectedAccount.outstanding.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
                  <div className="col-span-1 text-center">ID</div>
                  <div className="col-span-3">Timestamp</div>
                  <div className="col-span-2 text-center">Type</div>
                  <div className="col-span-4 select-none">Notes / Ref</div>
                  <div className="col-span-2 text-right">Amount (₹)</div>
                </div>

                <div className="overflow-y-auto max-h-[250px] divide-y divide-slate-100 text-[11px] font-semibold text-slate-600">
                  {(!selectedAccount.transactions || selectedAccount.transactions.length === 0) ? (
                    <div className="p-8 text-center text-slate-400">
                      No transactions recorded yet.
                    </div>
                  ) : (
                    selectedAccount.transactions.map((tx) => (
                      <div key={tx.id} className="hover:bg-slate-50/50 px-4 py-3.5 grid grid-cols-12 gap-2 uppercase font-sans tracking-wide">
                        <div className="col-span-1 text-center font-mono text-[10px] text-slate-400 font-bold">{tx.id}</div>
                        <div className="col-span-3 text-slate-500 text-[10px]">{tx.date}</div>
                        <div className="col-span-2 text-center">
                          <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded
                            ${tx.type === "CREDIT" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
                            {tx.type}
                          </span>
                        </div>
                        <div className="col-span-4 text-slate-700 font-sans truncate normal-case" title={tx.description}>{tx.description}</div>
                        <div className="col-span-2 text-right font-bold font-mono">
                          <span className={tx.type === "CREDIT" ? "text-rose-600" : "text-emerald-600"}>
                            {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* print layout bottom */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg text-xs font-extrabold cursor-pointer transition-all"
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
