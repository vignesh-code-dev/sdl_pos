import React from "react";
import { Search, Calendar, Download, Printer } from "lucide-react";

export default function ReportFilters({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchTerm,
  setSearchTerm,
  onPrint,
  onCSVExport,
  activeTab
}) {
  return (
    <div id="report-controls-panel" className="bg-pos-card border border-pos-border p-5 rounded shadow-sm mb-6 no-print animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Search & Period Select Filters */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Search Box */}
          {activeTab !== "backups" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
                <Search size={12} className="text-brand-primary" />
                <span>Search Query</span>
              </label>
              <input
                id="search-filter-input"
                type="text"
                className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 border border-pos-border rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-sans"
                placeholder="Search note, customer, IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Date Range Start (Since) */}
          {activeTab !== "deposit" && activeTab !== "backups" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
                <Calendar size={12} className="text-brand-primary" />
                <span>Since Date</span>
              </label>
              <input
                id="date-from-input"
                 type="date"
                className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          )}

          {/* Date Range End (Until) */}
          {activeTab !== "deposit" && activeTab !== "backups" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 select-none flex items-center gap-1.5 font-sans">
                <Calendar size={12} className="text-brand-primary" />
                <span>Until Date</span>
              </label>
              <input
                id="date-to-input"
                type="date"
                className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons: Export or Backup Controls */}
        {activeTab !== "backups" && (
          <div className="md:col-span-4 flex items-center justify-end gap-3 flex-wrap sm:flex-nowrap">
            {/* CSV Download Trigger */}
            <button
              id="export-csv-btn"
              type="button"
              onClick={onCSVExport}
              className="flex items-center gap-1.5 text-sm font-semibold border border-brand-primary text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            {/* Print Trigger */}
            <button
              id="print-report-btn"
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 text-sm font-semibold bg-brand-primary hover:bg-[#008967] text-white px-4 py-2.5 rounded transition-all shadow-sm cursor-pointer border-0"
            >
              <Printer size={14} />
              <span>Print Audit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
