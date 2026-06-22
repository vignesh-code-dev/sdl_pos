import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  XCircle,
  FileText,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  X,
  Plus,
  Minus,
  ArrowLeftRight,
  Calculator,
  RotateCcw,
  Save,
  CreditCard,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import InvoiceModal from "../../components/invoices/InvoiceModal";
import EditInvoiceModal from "../../components/invoices/EditInvoiceModal";
import ReturnInvoiceModal from "../../components/invoices/ReturnInvoiceModal";
import { restoreStock, verifyAndDeductStock, ensureBarcodes } from "../../utils/barcodePrinter.jsx";

const Invoices = () => {
  const { shopInfo } = useAuth();

  // 1. Data States
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);

  // 2. Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination to first page upon filter modifications
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, statusFilter]);

  // 3. UI Dialog States
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [editInvoice, setEditInvoice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [returnInvoice, setReturnInvoice] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Custom Toast, custom confirmation modal, and HTML download support inside sandbox iFrame
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

  // Initialize and Seed Invoices if Empty
  useEffect(() => {
    // Force synchronize with product catalog to ensure rate accuracy
    let savedProducts = localStorage.getItem("billmate_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    const savedInvoices = localStorage.getItem("billmate_invoices");
    if (!savedInvoices || JSON.parse(savedInvoices).length === 0) {
      const defaultInvoices = [
        {
          id: "INV-202606-1024",
          date: "Jun 7, 2026, 11:30 AM",
          shopName: "SDL BillMate POS Supermarket",
          customerName: "Rahul Sharma",
          customerMobile: "9876543210",
          items: [
            { name: "Maggi Masala Noodles 70g", sku: "1001", rate: 14, quantity: 5, unit: "pcs", discount: 5, tax: 5 },
            { name: "Coca Cola Soft Drink 250ml", sku: "2001", rate: 20, quantity: 2, unit: "pcs", discount: 10, tax: 18 }
          ],
          subtotal: 110,
          totalLineDiscount: 7.5,
          totalTax: 10.2,
          globalDiscount: 5,
          grandTotal: 107.7,
          paidAmount: 107.7,
          balance: 0,
          paymentMethod: "CASH",
          status: "Active",
          returns: [],
          operator: "admin"
        },
        {
          id: "INV-202606-2048",
          date: "Jun 6, 2026, 03:45 PM",
          shopName: "SDL BillMate POS Supermarket",
          customerName: "Priya Patel",
          customerMobile: "8765432109",
          items: [
            { name: "Aashirvaad Shudh Chakki Atta 1kg", sku: "1002", rate: 58, quantity: 2, unit: "kg", discount: 0, tax: 5 },
            { name: "Tata Salt Iodized 1kg", sku: "1003", rate: 28, quantity: 1, unit: "pcs", discount: 0, tax: 0 }
          ],
          subtotal: 144,
          totalLineDiscount: 0,
          totalTax: 5.8,
          globalDiscount: 0,
          grandTotal: 149.8,
          paidAmount: 149.8,
          balance: 0,
          paymentMethod: "CARD",
          status: "Active",
          returns: [],
          operator: "admin"
        },
        {
          id: "INV-202606-3096",
          date: "Jun 5, 2026, 09:15 AM",
          shopName: "SDL BillMate POS Supermarket",
          customerName: "Walk-in Guest",
          customerMobile: "Walk-In",
          items: [
            { name: "Colgate Strong Teeth Toothpaste 150g", sku: "4001", rate: 95, quantity: 1, unit: "pcs", discount: 8, tax: 18 }
          ],
          subtotal: 95,
          totalLineDiscount: 7.6,
          totalTax: 15.73,
          globalDiscount: 0,
          grandTotal: 103.13,
          paidAmount: 100.0,
          balance: 3.13,
          paymentMethod: "UPI",
          status: "Active",
          returns: [],
          operator: "admin"
        }
      ];
      localStorage.setItem("billmate_invoices", JSON.stringify(defaultInvoices));
      setInvoices(defaultInvoices);
    } else {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Sync to localStorage
  const saveInvoicesToStorage = (updatedList) => {
    setInvoices(updatedList);
    localStorage.setItem("billmate_invoices", JSON.stringify(updatedList));
  };

  // Helper date parsing robust logic
  const parseInvoiceDate = (dateStr) => {
    if (!dateStr) return new Date();
    // Normal JS Date constructor check
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) return new Date(timestamp);
    
    // Custom fallback parser for "Jun 7, 2026, 11:30 AM" Format
    try {
      const parts = dateStr.replace(/,/g, "").split(" ");
      // parts example: ["Jun", "7", "2026", "11:30", "AM"]
      const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const month = months[parts[0]] !== undefined ? months[parts[0]] : 0;
      const day = parseInt(parts[1]) || 1;
      const year = parseInt(parts[2]) || 2026;
      
      let hour = 12;
      let min = 0;
      if (parts[3]) {
        const timeParts = parts[3].split(":");
        hour = parseInt(timeParts[0]) || 12;
        min = parseInt(timeParts[1]) || 0;
      }
      
      if (parts[4] && parts[4].toLowerCase() === "pm" && hour < 12) {
        hour += 12;
      } else if (parts[4] && parts[4].toLowerCase() === "am" && hour === 12) {
        hour = 0;
      }
      
      return new Date(year, month, day, hour, min);
    } catch (err) {
      return new Date();
    }
  };

  // Calculate Single Line Total
  const calculateLineTotal = (item) => {
    const base = item.rate * item.quantity;
    const afterDiscount = base - (base * (item.discount / 100));
    const taxAmount = afterDiscount * (item.tax / 100);
    return afterDiscount + taxAmount;
  };

  // Filters & Search Logic
  const filteredInvoices = invoices.filter((inv) => {
    // A. Search Input (ID or customer name/mobile)
    const matchSearch =
      (inv && inv.id ? inv.id.toString().toLowerCase().includes((searchTerm || "").toLowerCase()) : false) ||
      (inv && inv.customerName ? inv.customerName.toString().toLowerCase().includes((searchTerm || "").toLowerCase()) : false) ||
      (inv && inv.customerMobile && inv.customerMobile.includes(searchTerm));

    // B. Status Filter
    const matchStatus =
      statusFilter === "All" ||
      (inv && inv.status ? inv.status.toString().toLowerCase() === (statusFilter || "").toLowerCase() : false);

    // C. Date Range Filter
    let matchDate = true;
    const invDate = parseInvoiceDate(inv.date);
    
    // Set hours to zero for accurate day-level bounds comparison
    invDate.setHours(0, 0, 0, 0);

    if (dateFrom) {
      const fromLimit = new Date(dateFrom);
      fromLimit.setHours(0, 0, 0, 0);
      if (invDate < fromLimit) matchDate = false;
    }
    if (dateTo) {
      const toLimit = new Date(dateTo);
      toLimit.setHours(0, 0, 0, 0);
      if (invDate > toLimit) matchDate = false;
    }

    return matchSearch && matchStatus && matchDate;
  });

  // KPI calculations on filtered items
  const totalInvoicesValue = filteredInvoices
    .filter((inv) => inv.status !== "Cancelled")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalInvoicesCount = filteredInvoices.length;

  const totalCancelledCount = filteredInvoices.filter((inv) => inv.status === "Cancelled").length;

  const totalOutstandingBalance = filteredInvoices
    .filter((inv) => inv.status !== "Cancelled")
    .reduce((sum, inv) => sum + (parseFloat(inv.balance) || 0), 0);

  // Pagination slice and total counts metadata
  const totalFilteredCount = filteredInvoices.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // CSV Export for external reporting
  const handleCSVExport = () => {
    if (filteredInvoices.length === 0) {
      showToast("No data available to export.", "warning");
      return;
    }

    // Assemble CSV Columns Header
    let csvContent = "Invoice No,Date,Customer Name,Customer Mobile,Items Count,Returns Refund,Grand Total,Amount Paid,Outstanding Balance,Payment Method,Status,Operator\n";

    filteredInvoices.forEach((inv) => {
      const returnsRefund = inv.returns ? inv.returns.reduce((sum, r) => sum + r.refundAmount, 0) : 0;
      const countItems = inv.items ? inv.items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0) : 0;
      
      const lineStr = `"${inv.id}","${inv.date}","${inv.customerName.replace(/"/g, '""')}","${inv.customerMobile}","${countItems}","${returnsRefund}","${inv.grandTotal.toFixed(2)}","${parseFloat(inv.paidAmount || 0).toFixed(2)}","${parseFloat(inv.balance || 0).toFixed(2)}","${inv.paymentMethod}","${inv.status}","${inv.operator}"\n`;
      csvContent += lineStr;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BillMate_Invoices_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report exported successfully!", "success");
  };

  // Toggle Cancel/Active status
  const handleToggleCancelStatus = (invoiceId) => {
    const targetInvoice = invoices.find(inv => inv.id === invoiceId);	 
    if (!targetInvoice) return;	 
 	 
    const currentStatus = targetInvoice.status || "Active";	 
    const nextStatus = currentStatus === "Cancelled" ? "Active" : "Cancelled";
    setCustomConfirm({
      isOpen: true,
      title: "Change Invoice Status",
      message: `Are you sure you want to change the status of invoice ${invoiceId}? Cancelled invoices do not reflect in active sales calculations.`,
      isDanger: false,
      confirmText: "Change Status",
      cancelText: "Cancel",
      onConfirm: () => {
        // Enforce inventory updates	 
        if (nextStatus === "Cancelled") {	 
          // RESTORE stock for remaining (unreturned) quantities	 
          const itemsToRestore = (targetInvoice.items || []).map(item => {	 
            const alreadyReturnedQty = (targetInvoice.returns || [])	 
              .filter(r => r.sku === item.sku)	 
              .reduce((sum, r) => sum + r.quantityReturned, 0);	 
            const remainingQty = Math.max(0, item.quantity - alreadyReturnedQty);	 
            return { sku: item.sku, quantity: remainingQty };	 
          }).filter(i => i.quantity > 0);	 
 	 
          restoreStock(itemsToRestore);	 
        } else {	 
          // Reactivating the invoice: DEDUCT quantities from stock with validation	 
          const itemsToDeduct = (targetInvoice.items || []).map(item => {	 
            const alreadyReturnedQty = (targetInvoice.returns || [])	 
              .filter(r => r.sku === item.sku)	 
              .reduce((sum, r) => sum + r.quantityReturned, 0);	 
            const remainingQty = Math.max(0, item.quantity - alreadyReturnedQty);	 
            return { sku: item.sku, quantity: remainingQty, name: item.name };	 
          }).filter(i => i.quantity > 0);	 
 	 
          const deductionResult = verifyAndDeductStock(itemsToDeduct);	 
          if (!deductionResult.success) {	 
            alert("Cannot reactivate invoice! " + deductionResult.error);	 
            setCustomConfirm(prev => ({ ...prev, isOpen: false }));	 
            return;	 
          }	 
        }
        const updated = invoices.map((inv) => {
          if (inv.id === invoiceId) {
            const nextStatus = inv.status === "Cancelled" ? "Active" : "Cancelled";
            return {
              ...inv,
              status: nextStatus
            };
          }
          return inv;
        });

        saveInvoicesToStorage(updated);
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
        showToast(`Invoice ${invoiceId} status updated successfully.`, "success");
      }
    });
  };

  // Delete invoice completely
  const handleDeleteInvoice = (invoiceId) => {
    setCustomConfirm({
      isOpen: true,
      title: "Permanent Delete Invoice",
      message: `WARNING: Are you absolutely certain you want to delete Invoice ${invoiceId}? This action cannot be undone!`,
      isDanger: true,
      confirmText: "Delete Permanently",
      cancelText: "Cancel",
      onConfirm: () => {
        const updated = invoices.filter((inv) => inv.id !== invoiceId);
        saveInvoicesToStorage(updated);
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
        showToast(`Invoice ${invoiceId} was successfully deleted.`, "success");
      }
    });
  };

  // Save changes from Edit Modal
  const handleSaveEditInvoice = (e) => {
    e.preventDefault();
    if (!editInvoice) return;

    const paid = parseFloat(editInvoice.paidAmount) || 0;
    const grand = parseFloat(editInvoice.grandTotal) || 0;
    const balanceValue = Math.max(0, grand - paid);

    const updated = invoices.map((inv) => {
      if (inv.id === editInvoice.id) {
        return {
          ...editInvoice,
          paidAmount: paid,
          balance: balanceValue
        };
      }
      return inv;
    });

    saveInvoicesToStorage(updated);
    setShowEditModal(false);
    setEditInvoice(null);
  };

  // Open Return Dialog and set initial variables
  const handleOpenReturnWorkflow = (invoice) => {
    setReturnInvoice(invoice);
    setShowReturnModal(true);
  };

  // Finalize Return Log Transaction
  const handleProcessReturnSubmit = (itemsToReturn) => {

    setCustomConfirm({
      isOpen: true,
      title: "Confirm Items Return",
      message: `Confirm return for ${itemsToReturn.length} unique line items? It will generate credit refund entries and modify the active ledger.`,
      isDanger: false,
      confirmText: "Yes, Return",
      cancelText: "Cancel",
      onConfirm: () => {
        // Build return logs
        const returnLogs = itemsToReturn.map((line) => {
          // Calculate individual line refund values including applied item discount & taxes
          const itemBase = line.rate * line.quantityToReturn;
          const itemAfterDiscount = itemBase - (itemBase * (line.discount / 100));
          const lineTaxAmount = itemAfterDiscount * (line.tax / 100);
          const totalRefundValue = itemAfterDiscount + lineTaxAmount;

          return {
            sku: line.sku,
            name: line.name,
            quantityReturned: line.quantityToReturn,
            refundAmount: parseFloat(totalRefundValue.toFixed(2)),
            dateProcessed: new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          };
        });

        const updated = invoices.map((inv) => {
          if (inv.id === returnInvoice.id) {
            const aggregatedReturns = [...(inv.returns || []), ...returnLogs];
            
            // Sum total refunds to reduce grand total or maintain ledger
            const totalRefundAmt = returnLogs.reduce((sum, r) => sum + r.refundAmount, 0);
            
            // Calculate new invoice grand totals and paid amounts safely
            const nextGrandTotal = Math.max(0, inv.grandTotal - totalRefundAmt);
            const nextPaidAmt = Math.max(0, inv.paidAmount - totalRefundAmt);
            const nextBalance = Math.max(0, nextGrandTotal - nextPaidAmt);

            return {
              ...inv,
              grandTotal: nextGrandTotal,
              paidAmount: nextPaidAmt,
              balance: nextBalance,
              returns: aggregatedReturns
            };
          }
          return inv;
        });

        saveInvoicesToStorage(updated);
          // Automatically restore corresponding stock quantity on successful return
        restoreStock(itemsToReturn.map(it => ({	 
          sku: it.sku,	 
          quantity: it.quantityToReturn	 
        })));
        setShowReturnModal(false);
        setReturnInvoice(null);
        setCustomConfirm(prev => ({ ...prev, isOpen: false }));
        showToast("Return transaction successfully processed and balance ledgers revised.", "success");
      }
    });
  };

  return (
    <div className="p-6 space-y-6 bg-pos-bg overflow-x-hidden min-h-screen text-slate-800">
      
      {/* Dynamic Printing Style overrides embedded cleanly */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; background: #fff !important; }
          #thermal-print-area, #thermal-print-area * { visibility: visible !important; color: #000 !important; }
          #thermal-print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 400px !important; margin: 0 auto !important; padding: 10px !important; font-size: 11px !important; line-height: 1.4 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────────
          TOP ACTION BAR: Header Panel, Quick Filters
          ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-pos-card border border-pos-border p-5 rounded shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-primary">
            Invoice & Returns Registry
          </h1>
          <p className="text-xs text-text-muted mt-1 font-medium">
            Audit historic orders, execute returns, manage balances, and generate CSV reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-1.5 text-sm font-semibold bg-white border border-brand-primary hover:bg-brand-primary/5 text-brand-primary px-4 py-2.5 rounded transition-all cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────
          DIVERGENT METRIC FLASHES (KPIs)
          ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs py-1 text-slate-500 uppercase tracking-widest block font-bold select-none">Gross Filtered Receipts</span>
            <span className="text-3xl font-semibold text-slate-800 font-mono">₹{totalInvoicesValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-brand-primary border border-teal-100 font-semibold text-sm">
            <FileText size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase text-slate-500 tracking-widest block font-bold select-none">Active Invoices</span>
            <span className="text-3xl font-semibold text-slate-800 font-mono">{totalInvoicesCount - totalCancelledCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 font-semibold text-sm">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase text-slate-500 tracking-widest block font-bold select-none">Cancelled Count</span>
            <span className="text-3xl font-bold text-brand-danger font-mono">{totalCancelledCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-brand-danger border border-rose-100 font-semibold text-sm">
            <XCircle size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs uppercase text-slate-500 tracking-widest block font-bold select-none">Outstanding Balance</span>
            <span className="text-3xl font-bold text-brand-danger font-mono">₹{totalOutstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-brand-danger font-semibold text-sm">
            <AlertTriangle size={20} />
          </div>
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────
          FILTERS DOCK
          ────────────────────────────────────────────────────────────── */}
      <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* Multi Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
            <Search size={11.5} className="text-brand-primary" />
            <span>Search Identifier</span>
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Invoice ID, customer..."
            className="w-full text-sm font-semibold text-slate-800 bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium height-[42px]"
          />
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
            <Calendar size={11.5} className="text-brand-primary" />
            <span>Date From</span>
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full text-sm font-semibold text-slate-800 bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
            <Calendar size={11.5} className="text-brand-primary" />
            <span>Date To</span>
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full text-sm font-semibold text-slate-800 bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
            <Filter size={11.5} className="text-brand-primary" />
            <span>Status Filter</span>
          </label>
          <div className="flex bg-[#f8fafc] border border-pos-border rounded p-1 justify-between">
            {["All", "Active", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 text-center py-1.5 text-[13px] font-bold rounded transition-colors cursor-pointer border-0 ${
                  statusFilter === st
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────
          DATA TABLE
          ────────────────────────────────────────────────────────────── */}
      <div className="bg-pos-card border border-pos-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1020px]">
            <thead>
              <tr className="border-b border-pos-border text-white uppercase text-xs font-semibold tracking-wider bg-emerald-600">
                <th className="p-4 text-xs font-semibold uppercase">Invoice No</th>
                <th className="p-4 text-xs font-semibold uppercase">Date</th>
                <th className="p-4 text-xs font-semibold uppercase">Customer</th>
                <th className="p-4 text-center text-xs font-semibold uppercase w-20 font-sans font-bold">Items</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Returns</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Grand Total (₹)</th>
                <th className="p-4 text-right text-xs font-semibold uppercase">Paid (₹)</th>
                <th className="p-4 text-center text-xs font-semibold uppercase">Balance (₹)</th>
                <th className="p-4 text-xs font-semibold uppercase">Payment Method</th>
                <th className="p-4 text-center text-xs font-semibold uppercase">Status</th>
                <th className="p-4 text-center text-xs font-semibold uppercase w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border/50 text-sm font-medium text-text-secondary">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-20 text-slate-400 font-semibold font-sans">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <div className="p-3.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                        <FileText size={28} />
                      </div>
                      <p className="font-bold text-slate-700 mt-2">No Matching Invoices Found</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Adjust your parameters, reset custom dates, or generate new transactions inside the POS Billing screen.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv, idx) => {
                  const lineItemsCount = inv.items ? inv.items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) : 0;
                  const totalRefunds = inv.returns ? inv.returns.reduce((sum, ret) => sum + ret.refundAmount, 0) : 0;
                  const paidVal = inv.paidAmount !== undefined ? inv.paidAmount : inv.grandTotal;
                  const balanceVal = inv.balance !== undefined ? inv.balance : Math.max(0, inv.grandTotal - paidVal);
                  
                  return (
                    <tr
                      key={`${inv.id}-${idx}`}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        inv.status === "Cancelled" ? "bg-slate-50/40 opacity-75" : ""
                      }`}
                    >
                      {/* Invoice ID */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                        {inv.id}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-2 text-[14px] text-slate-500  whitespace-nowrap">
                        {inv.date}
                      </td>

                      {/* Customer context */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 capitalize">{inv.customerName || "Walk-in"}</div>
                        {inv.customerMobile && inv.customerMobile !== "Walk-In" && (
                          <div className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">{inv.customerMobile}</div>
                        )}
                      </td>

                      {/* Items quantity */}
                      <td className="py-3.5 px-3 text-center font-bold text-slate-600 font-mono">
                        {Number(lineItemsCount.toFixed(3))}
                      </td>

                      {/* Returns Refund status */}
                      <td className={`py-3.5 px-3 text-center font-semibold font-mono whitespace-nowrap ${
                        totalRefunds > 0 ? "text-rose-600 font-bold" : "text-slate-400"
                      }`}>
                        {totalRefunds > 0 ? `-₹${totalRefunds.toFixed(2)}` : "₹0.00"}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-center font-black text-slate-800 font-mono whitespace-nowrap">
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono whitespace-nowrap">
                        ₹{paidVal.toFixed(2)}
                      </td>

                      {/* Balance */}
                      <td className={`py-3.5 px-3 text-center font-bold font-mono whitespace-nowrap ${
                        balanceVal > 0 ? "text-brand-danger" : "text-slate-400"
                      }`}>
                        ₹{balanceVal.toFixed(2)}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-mono font-bold px-2 py-1 rounded text-[10px] uppercase ${
                          inv.paymentMethod === "CASH" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          inv.paymentMethod === "CARD" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                          "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}>
                          {inv.paymentMethod === "CASH" ? "Cash" :
                           inv.paymentMethod === "CARD" ? "Card" :
                           inv.paymentMethod === "UPI" ? "UPI" : inv.paymentMethod || "Cash"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-sans font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase ${
                          inv.status === "Cancelled"
                            ? "bg-rose-50 border border-rose-100 text-brand-danger"
                            : "bg-emerald-50 border border-emerald-100 text-brand-success"
                        }`}>
                          {inv.status || "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* View details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-350 text-slate-600 cursor-pointer transition-colors"
                            title="View / Print Receipt"
                          >
                            <Eye size={12} strokeWidth={2.5} />
                          </button>

                          {/* Edit inline information */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditInvoice({ ...inv });
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-teal-50 border border-emerald-100 hover:bg-emerald-100 text-brand-primary cursor-pointer transition-colors"
                            title="Edit Invoice Details"
                          >
                            <Edit2 size={12} strokeWidth={2.5} />
                          </button>

                          {/* Process product returns */}
                          <button
                            type="button"
                            onClick={() => handleOpenReturnWorkflow(inv)}
                            className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 cursor-pointer transition-colors"
                            title="Process Items Return"
                            disabled={inv.status === "Cancelled"}
                            style={{ opacity: inv.status === "Cancelled" ? 0.35 : 1 }}
                          >
                            <ArrowLeftRight size={12} strokeWidth={2.5} />
                          </button>

                          {/* Toggle Cancel status */}
                          <button
                            type="button"
                            onClick={() => handleToggleCancelStatus(inv.id)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              inv.status === "Cancelled"
                                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                : "bg-rose-50 border-rose-100 text-brand-danger hover:bg-rose-100"
                            }`}
                            title={inv.status === "Cancelled" ? "Reactivate Order Invoice" : "Cancel Order Invoice"}
                          >
                            <XCircle size={12} strokeWidth={2.5} />
                          </button>

                          {/* Delete invoice completely */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 rounded-lg bg-red-100 border border-red-200 hover:bg-red-200 text-red-650 cursor-pointer transition-colors"
                            title="Permanent Remove"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
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

        {/* Summary Footer with Pagination Controls */}
        <div className="bg-slate-50/50 p-4 border-t border-pos-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-600 gap-2 select-none border-0 no-print">
          {totalFilteredCount > 0 ? (
            <span>
              Showing <span className="font-extrabold text-slate-700">{startIndex + 1}</span> to{" "}
              <span className="font-extrabold text-slate-700">
                {Math.min(totalFilteredCount, startIndex + itemsPerPage)}
              </span>{" "}
              of <span className="font-extrabold text-slate-700">{totalFilteredCount}</span> entries (Filtered from {invoices.length} total)
            </span>
          ) : (
            <span>Showing 0 of 0 entries</span>
          )}

          {totalFilteredCount > 0 && (
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

      {/* ──────────────────────────────────────────────────────────────
          VIEW INVOICE MODAL
          ────────────────────────────────────────────────────────────── */}
      <InvoiceModal
        isOpen={showViewModal}
        invoice={selectedInvoice}
        onClose={() => { setShowViewModal(false); setSelectedInvoice(null); }}
        title="Sale Invoice Details"
        closeActionText="Close View"
        showToast={showToast}
        showDownload={true}
      />

      <EditInvoiceModal
        isOpen={showEditModal}
        invoice={editInvoice}
        onClose={() => {
          setShowEditModal(false);
          setEditInvoice(null);
        }}
        onSave={handleSaveEditInvoice}
      />

      <ReturnInvoiceModal
        isOpen={showReturnModal}
        invoice={returnInvoice}
        onClose={() => {
          setShowReturnModal(false);
          setReturnInvoice(null);
        }}
        onSubmit={handleProcessReturnSubmit}
        showToast={showToast}
      />

      {/* Custom Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[250] max-w-sm bg-slate-900 border border-slate-800 text-white px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 no-print">
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4 font-sans no-print">
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

export default Invoices;
