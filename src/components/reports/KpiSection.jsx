import React from "react";
import {
  CheckCircle2,
  DollarSign,
  ArrowDownCircle,
  TrendingUp,
  FileText,
  XCircle,
  AlertCircle,
  ArrowUpCircle,
  Wallet,
  CreditCard
} from "lucide-react";

export default function KpiSection({ activeTab, salesData, invoiceData, revenueData, depositData, bankData }) {
  const getKpis = () => {
    if (activeTab === "sales") {
      const count = salesData.length;
      const rev = salesData.reduce((acc, s) => acc + s.amount, 0);
      const disc = salesData.reduce((acc, s) => acc + s.discounts, 0);
      const avg = count > 0 ? rev / count : 0;

      return [
        {
          label: "Total Transactions",
          val: count,
          sub: "Completed checked out sales",
          bg: "bg-teal-50 text-brand-primary border-teal-100",
          icon: <CheckCircle2 size={20} />
        },
        {
          label: "Total Sales Revenue",
          val: `₹${rev.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Gross items currency cleared",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: <DollarSign size={20} />
        },
        {
          label: "Total Discount Given",
          val: `₹${disc.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Line level & instant retail markdowns",
          bg: "bg-rose-50 text-brand-danger border-rose-100",
          icon: <ArrowDownCircle size={20} />
        },
        {
          label: "Average Invoice Value",
          val: `₹${avg.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Basket average invoice ticket",
          bg: "bg-blue-50 text-blue-600 border-blue-105",
          icon: <TrendingUp size={20} />
        }
      ];
    } else if (activeTab === "invoice") {
      const activeCount = invoiceData.filter((r) => r.status === "Active").length;
      const cancelledCount = invoiceData.filter((r) => r.status !== "Active").length;
      const activeTotal = invoiceData.filter((r) => r.status === "Active").reduce((acc, r) => acc + r.grandTotal, 0);
      const outstandingTotal = invoiceData.filter((r) => r.status === "Active").reduce((acc, r) => acc + r.balance, 0);

      return [
        {
          label: "Active Invoices",
          val: activeCount,
          sub: "Valid active ledger bills",
          bg: "bg-teal-50 text-brand-primary border-teal-100",
          icon: <FileText size={20} />
        },
        {
          label: "Cancelled Invoices",
          val: cancelledCount,
          sub: "Voided or returned bills",
          bg: "bg-rose-50 text-brand-danger border-rose-100",
          icon: <XCircle size={20} />
        },
        {
          label: "Total Gross Invoiced",
          val: `₹${activeTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Aggregated gross client billing",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: <DollarSign size={20} />
        },
        {
          label: "Outstanding Receivables",
          val: `₹${outstandingTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Balances left to collect",
          bg: "bg-amber-50 text-brand-warning border-amber-100",
          icon: <AlertCircle size={20} />
        }
      ];
    } else if (activeTab === "revenue") {
      const grandTotal = revenueData.reduce((acc, r) => acc + r.total, 0);
      const totalCount = revenueData.reduce((acc, r) => acc + r.count, 0);
      const avgDaily = revenueData.length > 0 ? grandTotal / revenueData.length : 0;
      const peakDayRev = revenueData.length > 0 ? Math.max(...revenueData.map((r) => r.total)) : 0;

      return [
        {
          label: "Aggregate Revenue",
          val: `₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Summed operational gross valuation",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: <DollarSign size={20} />
        },
        {
          label: "Total Order Volume",
          val: totalCount,
          sub: "Total customer tickets recorded",
          bg: "bg-blue-50 text-blue-600 border-blue-100",
          icon: <FileText size={20} />
        },
        {
          label: "Average Daily Revenue",
          val: `₹${avgDaily.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Historical daily operation mean",
          bg: "bg-teal-50 text-brand-primary border-teal-100",
          icon: <TrendingUp size={20} />
        },
        {
          label: "Peak Daily Valuation",
          val: `₹${peakDayRev.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Highest single-day settlement",
          bg: "bg-emerald-100/40 text-emerald-900 border-emerald-200",
          icon: <ArrowUpCircle size={20} />
        }
      ];
    } else if (activeTab === "deposit") {
      const limitTotal = depositData.reduce((acc, d) => acc + d.creditLimit, 0);
      const givenTotal = depositData.reduce((acc, d) => acc + d.creditGiven, 0);
      const settledTotal = depositData.reduce((acc, d) => acc + d.paymentsReceived, 0);
      const outstandingCredit = depositData.reduce((acc, d) => acc + d.outstanding, 0);

      return [
        {
          label: "Total Credit Ceiling",
          val: `₹${limitTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Combined customer limit allocated",
          bg: "bg-blue-50 text-blue-600 border-blue-105",
          icon: <Wallet size={20} />
        },
        {
          label: "Active Credit Given",
          val: `₹${givenTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Outstanding book tab given out (Dr)",
          bg: "bg-amber-50 text-brand-warning border-amber-100",
          icon: <ArrowUpCircle size={20} />
        },
        {
          label: "Total Client Settled",
          val: `₹${settledTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Total payments cleared back (Cr)",
          bg: "bg-teal-50 text-brand-primary border-teal-100",
          icon: <ArrowDownCircle size={20} />
        },
        {
          label: "Outstanding Balances",
          val: `₹${outstandingCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Collectable book credit outstanding",
          bg: "bg-rose-50 text-brand-danger border-rose-100",
          icon: <DollarSign size={20} />
        }
      ];
    } else if (activeTab === "bank_transfer") {
      const count = bankData.length;
      const bankCleared = bankData.filter((r) => r.status === "Active").reduce((acc, r) => acc + r.paidAmount, 0);
      const bankPending = bankData.filter((r) => r.status === "Active").reduce((acc, r) => acc + (r.grandTotal - r.paidAmount), 0);
      const avgTransfer = count > 0 ? (bankCleared + bankPending) / count : 0;

      return [
        {
          label: "Bank Transactions",
          val: count,
          sub: "Cleared wire transfers count",
          bg: "bg-blue-50 text-blue-600 border-blue-105",
          icon: <CreditCard size={20} />
        },
        {
          label: "Total Bank Receipts",
          val: `₹${bankCleared.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Direct deposits strictly reconciled",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: <DollarSign size={20} />
        },
        {
          label: "Unsettled Bank Dues",
          val: `₹${bankPending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Awaiting bank clearance balance",
          bg: "bg-rose-50 text-brand-danger border-rose-100",
          icon: <AlertCircle size={20} />
        },
        {
          label: "Average Transfer Amount",
          val: `₹${avgTransfer.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          sub: "Mean bank transfer client ticket",
          bg: "bg-teal-50 text-brand-primary border-teal-100",
          icon: <TrendingUp size={20} />
        }
      ];
    }
    return [];
  };

  const currentKpis = getKpis();

  if (activeTab === "backups" || currentKpis.length === 0) return null;

  return (
    <div id="kpi-banner-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {currentKpis.map((kpi, idx) => (
        <div
          key={idx}
          id={`kpi-card-${idx}`}
          className="bg-pos-card border border-pos-border p-5 rounded shadow-sm flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block select-none">
              {kpi.label}
            </span>
            <span className="text-3xl font-black text-slate-800 tracking-tight block font-mono select-all">
              {kpi.val}
            </span>
            <span className="text-[13px] text-slate-400 font-medium block">
              {kpi.sub}
            </span>
          </div>
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${kpi.bg}`}>
            {kpi.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
