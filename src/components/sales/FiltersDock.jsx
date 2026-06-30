import React from "react";
import { Search, Filter } from "lucide-react";

const FiltersDock = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, accounts }) => {
  const dueCount = accounts.filter(a => !a.isArchived && a.outstanding > 0).length;
  const archivedCount = accounts.filter(a => a.isArchived).length;

  return (
    <div id="sales-filters-dock" className="bg-pos-card border border-pos-border p-5 rounded shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
      {/* Searching */}
      <div className="lg:col-span-2 space-y-3">
        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
          <Search size={11} className="text-brand-primary" />
          <span>Search Customer Registry</span>
        </label>
        <input
          id="search-customer-input"
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
          <span>Balance & Archive State Filters</span>
        </label>
        <div className="flex bg-slate-50 border border-pos-border rounded p-1 justify-between gap-1">
          <button
            id="filter-active"
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`flex-1 text-center py-1.5 text-[11px] font-extrabold rounded transition-colors cursor-pointer border-0 ${
              statusFilter === "All"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-slate-400 hover:text-slate-700 font-bold"
            }`}
          >
            ACTIVE
          </button>
          <button
            id="filter-due"
            type="button"
            onClick={() => setStatusFilter("Outstanding")}
            className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded transition-colors cursor-pointer border-0 ${
              statusFilter === "Outstanding"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            DUE ({dueCount})
          </button>
          <button
            id="filter-settled"
            type="button"
            onClick={() => setStatusFilter("Settled")}
            className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded transition-colors cursor-pointer border-0 ${
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
  );
};

export default FiltersDock;
