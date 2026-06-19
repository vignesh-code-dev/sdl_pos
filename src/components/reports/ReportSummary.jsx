import React from "react";
import { Info, Calendar, Clock, Inbox } from "lucide-react";

export default function ReportSummary({ recordCount, dateFrom, dateTo, activeTab }) {
  // Simple format helper
  const formatDateFriendly = (dateStr) => {
    if (!dateStr) return "-";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getReportName = () => {
    switch (activeTab) {
      case "sales":
        return "Store Sales General Ledger";
      case "invoice":
        return "Invoice Registration Audit";
      case "revenue":
        return "Aggregated Daily Revenue Matrix";
      case "deposit":
        return "Book Credit Ledger & Tab Balances";
      case "bank_transfer":
        return "Bank Wire Settlement Register";
      default:
        return "Store Activity Audit";
    }
  };

  const currentFormattedTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  
  const currentFormattedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  if (activeTab === "backups") return null;

  return (
    <div id="report-summary-banner" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 bg-pos-card border border-pos-border rounded p-5 shadow-sm font-sans">
      {/* Column 1: Metadata Description */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded bg-teal-50 text-brand-primary border border-teal-100 flex-shrink-0 mt-0.5">
          <Info size={16} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block select-none">Report Identity</span>
          <p className="text-sm font-bold text-slate-800 leading-normal mt-1">{getReportName()}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Status: Stable Operational</p>
        </div>
      </div>

      {/* Column 2: Parameters and Records */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0 mt-0.5">
          <Inbox size={16} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block select-none">Quantitative Summary</span>
          <p className="text-sm font-bold text-slate-800 mt-1">
            Records Found: <span className="text-emerald-700 font-extrabold font-mono text-base">{recordCount}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Date Range: {dateFrom ? formatDateFriendly(dateFrom) : "All-time"} — {dateTo ? formatDateFriendly(dateTo) : "Present"}
          </p>
        </div>
      </div>

      {/* Column 3: Generated Stamp */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0 mt-0.5">
          <Clock size={16} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block select-none">System Snapshot</span>
          <p className="text-sm font-bold text-slate-800 mt-1 font-mono">
            Generated: {currentFormattedDate} {currentFormattedTime}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium font-sans">Verified Store Registry Archive</p>
        </div>
      </div>
    </div>
  );
}
