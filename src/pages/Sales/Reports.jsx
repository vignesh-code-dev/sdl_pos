import React, { useState, useEffect, useRef } from "react";
import { Database, RefreshCw, FileText, CheckCircle2, AlertCircle } from "lucide-react";

// Import Custom Subcomponents
import KpiSection from "../../components/reports/KpiSection";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportSummary from "../../components/reports/ReportSummary";
import ReportTable from "../../components/reports/ReportTable";
import RevenueChart from "../../components/reports/RevenueChart";
import BackupTab from "../../components/reports/BackupTab";

// Import Modal
import InvoiceModal from "../../components/invoices/InvoiceModal";

// Import Utilities / Logic Helpers
import {
  getSalesDataFiltered,
  getInvoiceDataFiltered,
  getRevenueDataFiltered,
  getDepositDataFiltered,
  getBankTransferDataFiltered,
  exportCSV
} from "../../utils/reportUtils";

import { printInvoice } from "../../utils/invoicePrinter";
import { downloadInvoiceHTML } from "../../utils/invoiceDownload";

export default function Reports() {
  // --- 1. CORE DATA STATES ---
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [depositAccounts, setDepositAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);

  // --- 2. REPORT SELECTION ---
  // Available tabs: "sales", "invoice", "revenue", "deposit", "bank_transfer", "backups"
  const [activeTab, setActiveTab] = useState("sales");

  // --- 3. FILTER & PARSING STATES ---
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- 4. BACKUP & ARCHIVE CONFIGS ---
  const [backupCycle, setBackupCycle] = useState("Off");
  const [lastBackupDate, setLastBackupDate] = useState("Never");
  const fileInputRef = useRef(null);

  // --- 5. TOAST NOTIFICATION STUFF ---
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // --- 6. SELECTED INVOICE FOR VIEW MODAL ---
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // --- 7. INITIAL DATA LOADING & RETRIEVAL ---
  useEffect(() => {
    // Load Invoices
    const savedInvoices = localStorage.getItem("billmate_invoices");
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }

    // Load Expenses
    const savedExpenses = localStorage.getItem("billmate_expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    // Load Deposit Accounts
    const savedAccounts = localStorage.getItem("billmate_deposit_accounts");
    if (savedAccounts) {
      setDepositAccounts(JSON.parse(savedAccounts));
    }

    // Load Customers Registry
    const savedCustomers = localStorage.getItem("billmate_customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }

    // Load Backup configurations
    const savedCycle = localStorage.getItem("billmate_backup_cycle");
    if (savedCycle) {
      setBackupCycle(savedCycle);
    }
    const savedBackupDate = localStorage.getItem("billmate_last_backup");
    if (savedBackupDate) {
      setLastBackupDate(savedBackupDate);
    }

    // Initialize Default Dates: Start of current month to today
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setDateFrom(formatDate(firstDay));
    setDateTo(formatDate(now));
  }, []);

  // Reset page upon filter parameters shifting
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, dateFrom, dateTo, searchTerm]);

  // --- 8. ARCHIVAL/BACKUP UTILS & HANDLERS ---
  const handleBackupCycleChange = (e) => {
    const value = e.target.value;
    setBackupCycle(value);
    localStorage.setItem("billmate_backup_cycle", value);
    showToast(`Automated backup frequency updated to: ${value}`, "success");
  };

  const handleManualBackupDownload = () => {
    try {
      const backupData = {
        billmate_invoices: JSON.parse(localStorage.getItem("billmate_invoices") || "[]"),
        billmate_expenses: JSON.parse(localStorage.getItem("billmate_expenses") || "[]"),
        billmate_deposit_accounts: JSON.parse(localStorage.getItem("billmate_deposit_accounts") || "[]"),
        billmate_customers: JSON.parse(localStorage.getItem("billmate_customers") || "[]"),
        billmate_products: JSON.parse(localStorage.getItem("billmate_products") || "[]"),
        billmate_users: JSON.parse(localStorage.getItem("billmate_users") || "[]")
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      const stampedDate = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `sdl_billmate_backup_${stampedDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const timestamp = new Date().toLocaleString();
      setLastBackupDate(timestamp);
      localStorage.setItem("billmate_last_backup", timestamp);
      showToast("Master store JSON backup generated and downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to compile manual database snapshot: " + err.message, "danger");
    }
  };

  const handleImportBackupUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const keys = [
          "billmate_invoices",
          "billmate_expenses",
          "billmate_deposit_accounts",
          "billmate_customers",
          "billmate_products",
          "billmate_users"
        ];

        let loadedCount = 0;
        keys.forEach((key) => {
          if (imported[key]) {
            localStorage.setItem(key, JSON.stringify(imported[key]));
            loadedCount++;
          }
        });

        if (loadedCount > 0) {
          showToast(`Full DB backup snapshot restored successfully (${loadedCount} schemas synchronized).`, "success");
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          showToast("Imported JSON file is missing supported SDL BillMate database models.", "danger");
        }
      } catch (err) {
        showToast("Error parsing backup snapshot file: " + err.message, "danger");
      }
    };
    reader.readAsText(file);
  };

  const triggerImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- 9. INTERACTIVE ACTION DISPATCHERS ---
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintInvoice = (invoice) => {
    printInvoice(invoice);
    showToast(`Triggered thermal docket print for invoice #${invoice.id}`, "success");
  };

  const handleExportInvoice = (invoice) => {
    downloadInvoiceHTML(invoice, showToast);
  };

  const handleMasterPrint = () => {
    window.print();
  };

  // --- 10. DYNAMIC CALCULATION SECTIONS ---
  const salesData = getSalesDataFiltered(invoices, dateFrom, dateTo, searchTerm);
  const invoiceData = getInvoiceDataFiltered(invoices, dateFrom, dateTo, searchTerm);
  const revenueData = getRevenueDataFiltered(invoices, dateFrom, dateTo);
  const depositData = getDepositDataFiltered(depositAccounts, searchTerm);
  const bankData = getBankTransferDataFiltered(invoices, dateFrom, dateTo, searchTerm);

  // Determine current dataset rows based on the active tab
  const activeReportRows = (() => {
    switch (activeTab) {
      case "sales":
        return salesData;
      case "invoice":
        return invoiceData;
      case "revenue":
        return revenueData;
      case "deposit":
        return depositData;
      case "bank_transfer":
        return bankData;
      default:
        return [];
    }
  })();

  const totalRecords = activeReportRows.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = activeReportRows.slice(startIndex, startIndex + itemsPerPage);

  const handleCSVExport = () => {
    exportCSV(activeTab, activeReportRows, showToast);
  };

  // Render Horizontal Tab Strip
  const renderTabStrip = () => {
    const tabs = [
      { id: "sales", label: "Sales Report" },
      { id: "invoice", label: "Invoice Audit" },
      { id: "revenue", label: "Revenue Ledger" },
      { id: "deposit", label: "Credit Report" },
      { id: "bank_transfer", label: "Bank Wire List" },
      { id: "backups", label: "Backups & Archival" }
    ];

    return (
      <div className="flex border-b border-slate-200 overflow-x-auto no-print mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 uppercase tracking-wide flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {tab.id === "backups" && <Database size={13} />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-pos-bg overflow-x-hidden min-h-screen text-slate-800 font-sans">
      
      {/* 1. TOAST NOTIFICATION CONTAINER */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm animate-in fade-in slide-in-from-bottom-5 no-print">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : toast.type === "danger"
                ? "bg-rose-50 text-brand-danger border-rose-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            <div className="shrink-0">
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : (
                <AlertCircle size={18} className="text-rose-500" />
              )}
            </div>
            <p className="text-xs font-bold leading-normal">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-pos-card border border-pos-border p-5 rounded shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-850">
            Reports & Archive Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium select-none font-sans">
            Oversee transactional spreadsheets, run deep invoice audits, map cash flow clearing channels, and secure ledger archives.
          </p>
        </div>

        {activeTab !== "backups" && (
          <div className="flex items-center gap-2 no-print self-start md:self-auto">
            <button
              type="button"
              onClick={handleMasterPrint}
              className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded transition-all shadow-sm cursor-pointer border-0"
            >
              <FileText size={14} />
              <span>Print Page / PDF Report</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. REPORT CLASSIFICATION TABS */}
      {renderTabStrip()}

      {/* 4. MASTER KPI CARDS GRID */}
      <KpiSection
        activeTab={activeTab}
        salesData={salesData}
        invoiceData={invoiceData}
        revenueData={revenueData}
        depositData={depositData}
        bankData={bankData}
      />

      {/* 5. QUICK REPORT SUMMARY CARD (NEW) */}
      <ReportSummary
        recordCount={totalRecords}
        dateFrom={dateFrom}
        dateTo={dateTo}
        activeTab={activeTab}
      />

      {/* 6. REPORT TARGET FILTER PANEL */}
      <ReportFilters
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onPrint={handleMasterPrint}
        onCSVExport={handleCSVExport}
        activeTab={activeTab}
      />

      {/* 7. VISUAL REVENUE STATS (Only shown on Revenue tab) */}
      <RevenueChart activeTab={activeTab} revenueData={revenueData} />

      {/* 8. REPORT DATASHEET TABLE DOCKET */}
      <ReportTable
        activeTab={activeTab}
        rows={activeReportRows}
        paginatedRows={paginatedRows}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onViewInvoice={handleViewInvoice}
        onPrintInvoice={handlePrintInvoice}
        onExportInvoice={handleExportInvoice}
      />

      {/* 9. STANDALONE BACKUP CENTER (Only active for backups tab) */}
      <BackupTab
        activeTab={activeTab}
        backupCycle={backupCycle}
        onBackupCycleChange={handleBackupCycleChange}
        lastBackupDate={lastBackupDate}
        onManualBackup={handleManualBackupDownload}
        onImportBackup={handleImportBackupUpload}
        fileInputRef={fileInputRef}
        onTriggerImport={triggerImportClick}
      />

      {/* 10. REUSABLE FULL INVOICE VIEW MODAL */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        invoice={selectedInvoice}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Ledger Transaction Invoice Details"
        showDownload={true}
      />
    </div>
  );
}
