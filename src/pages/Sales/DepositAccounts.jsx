import React, { useState, useEffect } from "react";
import { Wallet, Plus, CheckCircle } from "lucide-react";
import StatsCards from "../../components/sales/StatsCards";
import FiltersDock from "../../components/sales/FiltersDock";
import DepositAccountsTable from "../../components/sales/DepositAccountsTable";
import CollectPaymentModal from "../../components/sales/CollectPaymentModal";
import AccountSettingsModal from "../../components/sales/AccountSettingsModal";
import OpenAccountModal from "../../components/sales/OpenAccountModal";
import LedgerModal from "../../components/sales/LedgerModal";
import ConfirmModal from "../../components/sales/ConfirmModal";

const DepositAccounts = () => {
  // 1. Core lists
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // 2. Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Outstanding", "Settled", "Archived"

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 4. Selected Items
  const [selectedAccount, setSelectedAccount] = useState(null);

  // 5. Form States
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    description: "Paid at cashier desk"
  });

  const [convertExcessToAdvance, setConvertExcessToAdvance] = useState(true);

  const [limitForm, setLimitForm] = useState({
    creditLimit: "",
    status: "Active",
    creditPeriod: "30",
    notes: "",
    approvedBy: "Admin"
  });

  const [openAccountForm, setOpenAccountForm] = useState({
    customerId: "",
    creditLimit: "10000",
    creditPeriod: "30",
    notes: "",
    approvedBy: "System Administrator",
    customerPhone: ""
  });

  const [confirmConfig, setConfirmConfig] = useState({
    type: "archive", // "archive" or "delete" or "archive_required"
    account: null,
    title: "",
    message: "",
    actionText: ""
  });

  // 6. UI Toast notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // 7. Load data & seed defaults
  useEffect(() => {
    // Load existing customers
    let savedCustomers = JSON.parse(
      localStorage.getItem("billmate_customers") || "[]",
    );
    if (savedCustomers.length === 0) {
      // Seed default customers to align with system presets
      savedCustomers = [
        {
          id: "C-1",
          name: "Rahul Sharma",
          mobile: "9876543210",
          email: "rahul@gmail.com",
          address: "Flat 402, Green Glen Layout, Bengaluru",
          createdAt: "2026-01-15",
        },
        {
          id: "C-2",
          name: "Priya Patel",
          mobile: "8765432109",
          email: "priya@gmail.com",
          address: "Sector 15, Vashi, Navi Mumbai",
          createdAt: "2026-02-18",
        },
        {
          id: "C-3",
          name: "Amit Kumar",
          mobile: "7654321098",
          email: "amit@gmail.com",
          address: "H-12, Lajpat Nagar, New Delhi",
          createdAt: "2026-03-05",
        },
      ];
      localStorage.setItem(
        "billmate_customers",
        JSON.stringify(savedCustomers),
      );
    }
    setCustomers(savedCustomers);

    // Load Invoices
    const savedInvoices = JSON.parse(
      localStorage.getItem("billmate_invoices") || "[]",
    );
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
          status: "Active",
          creditPeriod: 30,
          notes: "Regular grocery buyer",
          approvedBy: "System Administrator",
          createdBy: "System Administrator",
          createdDate: "Jun 1, 2026, 10:00 AM",
          updatedBy: "System Administrator",
          updatedDate: "Jun 1, 2026, 10:00 AM",
          advanceBalance: 0,
          isArchived: false,
          transactions: [
            { id: "TX-1001", date: "Jun 8, 2026, 11:32 AM", type: "CREDIT", category: "Sale", amount: 2500, description: "POS Purchase on Credit (INV-202606-1024)", operator: "System Administrator", runningBalance: 2500 },
            { id: "TX-1002", date: "Jun 8, 2026, 04:30 PM", type: "PAYMENT", category: "Payment", amount: 2000, description: "Invoice part-payment settlement", method: "CASH", operator: "System Administrator", runningBalance: 500 },
            { id: "TX-1003", date: "Jun 11, 2026, 10:15 AM", type: "CREDIT", category: "Sale", amount: 1000, description: "Fresh POS store-credit buy", operator: "System Administrator", runningBalance: 1500 }
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
          status: "Active",
          creditPeriod: 15,
          notes: "Wholesale corporate orders",
          approvedBy: "System Administrator",
          createdBy: "System Administrator",
          createdDate: "Jun 2, 2026, 11:00 AM",
          updatedBy: "System Administrator",
          updatedDate: "Jun 2, 2026, 11:00 AM",
          advanceBalance: 0,
          isArchived: false,
          transactions: [
            { id: "TX-1004", date: "Jun 7, 2026, 03:45 PM", type: "CREDIT", category: "Sale", amount: 5500, description: "Credit billing checkout (INV-202606-2048)", operator: "System Administrator", runningBalance: 5500 },
            { id: "TX-1005", date: "Jun 9, 2026, 06:15 PM", type: "PAYMENT", category: "Payment", amount: 1500, description: "Received via UPI bank account", method: "UPI", operator: "System Administrator", runningBalance: 4000 }
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
          status: "Active",
          creditPeriod: 45,
          notes: "Monthly settlement client",
          approvedBy: "System Administrator",
          createdBy: "System Administrator",
          createdDate: "Jun 3, 2026, 02:30 PM",
          updatedBy: "System Administrator",
          updatedDate: "Jun 3, 2026, 02:30 PM",
          advanceBalance: 0,
          isArchived: false,
          transactions: []
        }
      ];
      localStorage.setItem(
        "billmate_deposit_accounts",
        JSON.stringify(defaultAccounts),
      );
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

  // --- HELPERS FOR DUE DATE & OUTSTANDING DAYS ---
  const getDaysOutstanding = (acc) => {
    if (acc.outstanding <= 0 || !acc.transactions || acc.transactions.length === 0) return 0;
    const creditTxs = acc.transactions.filter(t => t.type === "CREDIT" || t.category === "Sale");
    if (creditTxs.length === 0) return 0;
    const oldestTx = creditTxs[creditTxs.length - 1];
    const txDate = new Date(oldestTx.date);
    if (isNaN(txDate.getTime())) return 0;
    const diffTime = Math.max(0, new Date() - txDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // --- ACTIONS ---

  // 1. Open credit account for a customer
  const handleOpenAccount = (e) => {
    e.preventDefault();
    if (!openAccountForm.customerId) {
      showToast("Please choose a valid customer", "warning");
      return;
    }
    const targetCustomer = customers.find(
      (c) => c.id === openAccountForm.customerId,
    );
    if (!targetCustomer) return;

    // Check if account already exists
    const duplicate = accounts.find(
      (acc) => acc.customerId === targetCustomer.id,
    );
    if (duplicate) {
      showToast("This customer already has a credit account!", "warning");
      return;
    }

    const limit = parseFloat(openAccountForm.creditLimit) || 0;
    if (limit <= 0) {
      showToast("Credit limit must be a positive number", "warning");
      return;
    }

    const period = parseInt(openAccountForm.creditPeriod) || 30;
    const notes = openAccountForm.notes || "";
    const approvedBy = openAccountForm.approvedBy || "System Administrator";
    const nowStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

    const setupTx = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      date: nowStr,
      type: "SETUP",
      category: "Account Created",
      amount: 0,
      description: `Account opened with Limit ₹${limit.toFixed(2)} and Credit Period ${period} days.`,
      operator: approvedBy,
      runningBalance: 0
    };

    const newAccObj = {
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerMobile: targetCustomer.mobile,
      creditLimit: limit,
      creditGiven: 0,
      paymentsReceived: 0,
      outstanding: 0,
      status: "Active",
      creditPeriod: period,
      notes: notes,
      approvedBy: approvedBy,
      createdBy: approvedBy,
      createdDate: nowStr,
      updatedBy: approvedBy,
      updatedDate: nowStr,
      advanceBalance: 0,
      isArchived: false,
      transactions: [setupTx]
    };

    const newAccs = [...accounts, newAccObj];
    saveAccounts(newAccs);
    setShowOpenAccountModal(false);
    setOpenAccountForm({ customerId: "", creditLimit: "10000", creditPeriod: "30", notes: "", approvedBy: "System Administrator", customerPhone: "" });
    showToast(`Credit account enabled for ${targetCustomer.name}!`);
  };

  // 2. Record payment towards credit account (with excess advance handler)
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) {
      showToast("Please enter a valid amount greater than ₹0", "warning");
      return;
    }

    const outstanding = selectedAccount.outstanding || 0;
    const nowStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const user = "System Administrator";

    let actualPaymentAmount = amount;
    let excessAdvanceAmount = 0;

    if (amount > outstanding) {
      if (!convertExcessToAdvance) {
        showToast(`Overpayment is not allowed unless converted to Advance Balance! Please check the conversion option or adjust the payment amount.`, "warning");
        return;
      }
      actualPaymentAmount = outstanding;
      excessAdvanceAmount = parseFloat((amount - outstanding).toFixed(2));
    }

    let txsToAppend = [];
    let nextOutstanding = selectedAccount.outstanding;
    let nextPayments = selectedAccount.paymentsReceived;
    let nextAdvance = selectedAccount.advanceBalance || 0;

    if (actualPaymentAmount > 0) {
      nextPayments = parseFloat((nextPayments + actualPaymentAmount).toFixed(2));
      nextOutstanding = parseFloat((nextOutstanding - actualPaymentAmount).toFixed(2));
      
      const paymentTx = {
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        date: nowStr,
        type: "PAYMENT",
        category: "Payment",
        amount: actualPaymentAmount,
        description: paymentForm.description || "Credit settlement pay",
        method: paymentForm.paymentMethod,
        operator: user,
        runningBalance: nextOutstanding
      };
      txsToAppend.push(paymentTx);
    }

    if (excessAdvanceAmount > 0) {
      nextAdvance = parseFloat((nextAdvance + excessAdvanceAmount).toFixed(2));
      
      const advanceTx = {
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        date: nowStr,
        type: "ADVANCE",
        category: "Advance",
        amount: excessAdvanceAmount,
        description: "Overpayment converted to Customer Advance Balance",
        method: paymentForm.paymentMethod,
        operator: user,
        runningBalance: nextOutstanding
      };
      txsToAppend.push(advanceTx);
    }

    const updated = accounts.map((acc) => {
      if (acc.customerId === selectedAccount.customerId) {
        return {
          ...acc,
          paymentsReceived: nextPayments,
          outstanding: nextOutstanding,
          advanceBalance: nextAdvance,
          lastPaymentDate: nowStr,
          updatedBy: user,
          updatedDate: nowStr,
          transactions: [...txsToAppend, ...(acc.transactions || [])]
        };
      }
      return acc;
    });

    saveAccounts(updated);
    setShowPaymentModal(false);
    setPaymentForm({ amount: "", paymentMethod: "CASH", description: "Paid at cashier desk" });
    showToast(`Successfully processed payment/advance of ₹${amount.toFixed(2)} for ${selectedAccount.customerName}!`);
  };

  // 3. Edit credit limit & settings
  const handleUpdateLimit = (e) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const newLimit = parseFloat(limitForm.creditLimit) || 0;
    if (newLimit < 0) {
      showToast("Credit limit cannot be negative!", "warning");
      return;
    }

    const nextStatus = limitForm.status || "Active";
    const nextPeriod = parseInt(limitForm.creditPeriod) || 30;
    const nextNotes = limitForm.notes || "";
    const approvedBy = limitForm.approvedBy || "System Administrator";
    const nowStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

    let addedTxs = [];
    
    // Log limit change if limit changed
    if (newLimit !== selectedAccount.creditLimit) {
      addedTxs.push({
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        date: nowStr,
        type: "ADJUSTMENT",
        category: "Limit Change",
        amount: Math.abs(newLimit - selectedAccount.creditLimit),
        description: `Credit Limit adjusted from ₹${selectedAccount.creditLimit.toFixed(2)} to ₹${newLimit.toFixed(2)}`,
        operator: approvedBy,
        runningBalance: selectedAccount.outstanding
      });
    }

    // Log status change if status changed
    if (nextStatus !== selectedAccount.status) {
      addedTxs.push({
        id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
        date: nowStr,
        type: "ADJUSTMENT",
        category: nextStatus === "Closed" ? "Account Closed" : "Adjustment",
        amount: 0,
        description: `Account status updated from ${selectedAccount.status} to ${nextStatus}`,
        operator: approvedBy,
        runningBalance: selectedAccount.outstanding
      });
    }

    const updated = accounts.map(acc => {
      if (acc.customerId === selectedAccount.customerId) {
        return {
          ...acc,
          creditLimit: newLimit,
          status: nextStatus,
          creditPeriod: nextPeriod,
          notes: nextNotes,
          updatedBy: approvedBy,
          updatedDate: nowStr,
          transactions: [...addedTxs, ...(acc.transactions || [])]
        };
      }
      return acc;
    });

    saveAccounts(updated);
    setShowLimitModal(false);
    showToast(`Account settings updated for ${selectedAccount.customerName}!`);
  };

  // --- ACTIONS FOR ARCHIVE & DELETE RULES ---
  const handleInitiateDelete = (acc) => {
    // Rules: Allow deletion only when outstanding balance is zero and no financial transactions exist
    const hasFinancialTransactions = acc.transactions && acc.transactions.some(t => t.type === "CREDIT" || t.type === "PAYMENT" || t.type === "ADVANCE" || t.category === "Sale" || t.category === "Payment");
    const outstanding = acc.outstanding || 0;

    if (outstanding > 0 || hasFinancialTransactions) {
      setConfirmConfig({
        type: "archive_required",
        account: acc,
        title: "Delete Blocked - Archive Required",
        message: `This account cannot be deleted because it contains active financial records or an outstanding balance of ₹${outstanding.toFixed(2)}. To maintain absolute accounting integrity and audit trails, please Archive this account instead.`,
        actionText: "Archive Instead"
      });
      setShowConfirmModal(true);
    } else {
      setConfirmConfig({
        type: "delete",
        account: acc,
        title: "Confirm Permanent Deletion",
        message: `Are you absolutely sure you want to permanently delete the credit account for ${acc.customerName}? This will purge all settings and configurations. This action cannot be undone!`,
        actionText: "Delete Account"
      });
      setShowConfirmModal(true);
    }
  };

  const handleInitiateArchive = (acc) => {
    setConfirmConfig({
      type: "archive",
      account: acc,
      title: "Confirm Archiving Account",
      message: `Are you sure you want to archive the credit account for ${acc.customerName}? Archived accounts are excluded from normal search lists but remain completely intact in history for audit purposes.`,
      actionText: "Archive Account"
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    const { type, account } = confirmConfig;
    if (!account) return;

    if (type === "delete") {
      const updated = accounts.filter(acc => acc.customerId !== account.customerId);
      saveAccounts(updated);
      showToast(`Credit account for ${account.customerName} has been permanently deleted.`);
    } else if (type === "archive" || type === "archive_required") {
      const updated = accounts.map(acc => {
        if (acc.customerId === account.customerId) {
          return {
            ...acc,
            isArchived: true,
            status: "Closed", // Automatically close when archived
            updatedBy: "System Administrator",
            updatedDate: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
          };
        }
        return acc;
      });
      saveAccounts(updated);
      showToast(`Credit account for ${account.customerName} has been successfully archived.`);
    }
    setShowConfirmModal(false);
  };

  // --- STATS COMPUTATION ---
  const nonArchivedAccounts = accounts.filter(acc => !acc.isArchived);
  const totalCreditGiven = nonArchivedAccounts.reduce((sum, acc) => sum + (acc.creditGiven || 0), 0);
  const totalPayments = nonArchivedAccounts.reduce((sum, acc) => sum + (acc.paymentsReceived || 0), 0);
  const totalOutstanding = nonArchivedAccounts.reduce((sum, acc) => sum + (acc.outstanding || 0), 0);
  const activeAccountsCount = nonArchivedAccounts.filter(acc => acc.outstanding > 0).length;

  // --- SEARCH AND FILTER LOGIC ---
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.customerMobile.includes(searchQuery);

    if (statusFilter === "Archived") {
      return matchesSearch && acc.isArchived;
    }

    // Default view: exclude archived accounts from normal views
    if (acc.isArchived) return false;

    if (statusFilter === "All") return matchesSearch;
    if (statusFilter === "Outstanding")
      return matchesSearch && acc.outstanding > 0;
    if (statusFilter === "Settled")
      return matchesSearch && acc.outstanding <= 0;

    return matchesSearch;
  });

  // --- 8.5 PAGINATION CALCULATIONS ---
  const totalRecords = filteredAccounts.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-[calc(100vh-60px)] font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-lg text-white font-semibold text-xs shadow-md transition-all duration-300 transform translate-y-0
          ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}
        >
          <CheckCircle size={15} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header section with page title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-pos-card border border-pos-border p-5 rounded shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-primary flex items-center gap-2">
           
            Deposit Accounts & Credit Ledger
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Manage customer credit accounts, track loans extended, deposits
            made, and active outstanding balances.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setOpenAccountForm({
                customerId: "",
                creditLimit: "10000",
                creditPeriod: "30",
                notes: "",
                approvedBy: "System Administrator",
                customerPhone: ""
              });
              setShowOpenAccountModal(true);
            }}
            className="flex items-center gap-1.5 text-sm font-extrabold bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded transition-colors shadow-sm cursor-pointer border-0"
          >
            <Plus size={15} strokeWidth={2.5} />
            Open Credit Account
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatsCards
        totalCreditGiven={totalCreditGiven}
        totalPayments={totalPayments}
        totalOutstanding={totalOutstanding}
        activeAccountsCount={activeAccountsCount}
      />

      {/* FILTERS DOCK */}
      <FiltersDock
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        accounts={accounts}
      />

      {/* DATA TABLE CARD */}
      <DepositAccountsTable
        paginatedAccounts={paginatedAccounts}
        getDaysOutstanding={getDaysOutstanding}
        onViewLedger={(acc) => {
          setSelectedAccount(acc);
          setShowLedgerModal(true);
        }}
        onOpenSettings={(acc) => {
          setSelectedAccount(acc);
          setLimitForm({
            creditLimit: acc.creditLimit.toString(),
            status: acc.status || "Active",
            creditPeriod: (acc.creditPeriod || 30).toString(),
            notes: acc.notes || "",
            approvedBy: acc.approvedBy || "System Administrator"
          });
          setShowLimitModal(true);
        }}
        onCollectPayment={(acc) => {
          setSelectedAccount(acc);
          setPaymentForm({
            amount: "",
            paymentMethod: "CASH",
            description: "Paid at cashier desk"
          });
          setConvertExcessToAdvance(true);
          setShowPaymentModal(true);
        }}
        onInitiateArchive={handleInitiateArchive}
        onInitiateDelete={handleInitiateDelete}
        onUnarchive={(acc) => {
          const updated = accounts.map(a => {
            if (a.customerId === acc.customerId) {
              return { ...a, isArchived: false, status: "Active" };
            }
            return a;
          });
          saveAccounts(updated);
          showToast(`Account for ${acc.customerName} has been restored/unarchived.`);
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        totalRecords={totalRecords}
        itemsPerPage={itemsPerPage}
        totalAccountsCount={accounts.length}
      />

      {/* MODAL 1: RECORD CUSTOMER DEPOSIT PAYMENT / SETTLEMENT */}
      <CollectPaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedAccount={selectedAccount}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        convertExcessToAdvance={convertExcessToAdvance}
        setConvertExcessToAdvance={setConvertExcessToAdvance}
        onSubmit={handleRecordPayment}
      />

      {/* MODAL 2: ADJUST CUSTOMER CREDIT LIMIT & STATUS SETTINGS */}
      <AccountSettingsModal
        show={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        selectedAccount={selectedAccount}
        limitForm={limitForm}
        setLimitForm={setLimitForm}
        onSubmit={handleUpdateLimit}
      />

      {/* MODAL 3: ENABLE/OPEN CREDIT FOR EXISTING CUSTOMER */}
      <OpenAccountModal
        show={showOpenAccountModal}
        onClose={() => setShowOpenAccountModal(false)}
        customers={customers}
        accounts={accounts}
        openAccountForm={openAccountForm}
        setOpenAccountForm={setOpenAccountForm}
        onSubmit={handleOpenAccount}
      />

      {/* MODAL 4: DETAILED LEDGER TRANSACTION LOG / AUDIT HISTORY */}
      <LedgerModal
        show={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        selectedAccount={selectedAccount}
      />

      {/* MODAL 5: CUSTOM ARCHIVE / DELETE CONFIRMATION DIALOG */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        confirmConfig={confirmConfig}
        onConfirm={handleConfirmAction}
      />

    </div>
  );
};

export default DepositAccounts;
