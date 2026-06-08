import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  User,
  CheckCircle,
} from "lucide-react";

const Analytics = () => {
  // 1. மல்டி-டைமென்ஷனல் ஃபில்டர் ஸ்டேட்ஸ் (Multi-dimensional Filters)
  const [period, setPeriod] = useState("Month");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState("All");

  // தற்காலிக அனலிட்டிக்ஸ் டேட்டா (Mock Analyst Data)
  const analyticsKPIs = [
    {
      title: "Total Revenue",
      value: "₹2,45,230.00",
      change: "+14.8%",
      isUp: true,
      sub: "vs Last Month",
    },
    {
      title: "Total Cost",
      value: "₹1,78,900.00",
      change: "+11.2%",
      isUp: true,
      sub: "Cost of Goods Sold",
    },
    {
      title: "Gross Profit",
      value: "₹66,330.00",
      change: "+25.4%",
      isUp: true,
      sub: "Net Earnings",
    },
    {
      title: "Profit Margin",
      value: "27.05%",
      change: "+2.1%",
      isUp: true,
      sub: "Avg Margin Rate",
    },
    {
      title: "Transaction Count",
      value: "1,142",
      change: "+8.5%",
      isUp: true,
      sub: "Completed Bills",
    },
    {
      title: "Units Sold",
      value: "4,821 pcs",
      change: "+12.3%",
      isUp: true,
      sub: "Inventory Volume",
    },
    {
      title: "Average Ticket Value",
      value: "₹214.73",
      change: "-1.5%",
      isUp: false,
      sub: "Avg Value Per Bill",
    },
  ];

  const staffPerformance = [
    {
      name: "Suresh Kumar",
      role: "Admin",
      revenue: "₹1,45,230",
      transactions: 612,
      units: 2450,
      efficiency: "98%",
    },
    {
      name: "Anitha Devi",
      role: "Cashier",
      revenue: "₹84,200",
      transactions: 450,
      units: 2100,
      efficiency: "94%",
    },
    {
      name: "Ramesh Raj",
      role: "Cashier",
      revenue: "₹15,800",
      transactions: 80,
      units: 271,
      efficiency: "89%",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ──────────────────────────────────────────────────────────────
          HEADER: அனலிஸ்ட் வியூ டைட்டில் & எக்ஸ்போர்ட் ஆக்ஷன்ஸ்
          ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-primary">
            <BarChart3 size={22} />
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Deep Business Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-dimensional data analysis and business intelligence reporting.
          </p>
        </div>

        {/* அட்வான்ஸ்டு எக்ஸ்போர்ட் பட்டன்கள் */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl transition-all">
            <Download size={15} /> Export CSV
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-brand-primary hover:bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl transition-all shadow-md font-bold">
            <Download size={15} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────
          FILTER PANEL: மல்டி-டைமென்ஷனல் ஃபில்டர்கள் (Enhanced Filters)
          ────────────────────────────────────────────────────────────── */}
      <div className="bg-pos-card border border-pos-border p-4 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-pos-border/40 pb-2">
          <Filter size={14} className="text-brand-primary" />
          <span>Analytical Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. பிரியட் ஃபில்டர் */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Calendar size={12} /> Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl p-2.5 text-slate-200 font-medium focus:outline-none focus:border-brand-primary"
            >
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="All Time">All Time</option>
              <option value="Custom">Custom Date Range...</option>
            </select>
          </div>

          {/* 2. கேட்டகிரி ஃபில்டர் */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Layers size={12} /> Product Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl p-2.5 text-slate-200 font-medium focus:outline-none focus:border-brand-primary"
            >
              <option value="All">All Categories</option>
              <option value="Grocery">Grocery / Packaged Items</option>
              <option value="Household">Household & Detergents</option>
              <option value="Snacks">Snacks & Beverages</option>
              <option value="Dairy">Dairy & Frozen Foods</option>
            </select>
          </div>

          {/* 3. ஸ்டாஃப் ஃபில்டர் */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <User size={12} /> Handled By (Staff)
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl p-2.5 text-slate-200 font-medium focus:outline-none focus:border-brand-primary"
            >
              <option value="All">All Cashiers</option>
              <option value="Suresh">Suresh Kumar (Admin)</option>
              <option value="Anitha">Anitha Devi (Cashier)</option>
              <option value="Ramesh">Ramesh Raj (Cashier)</option>
            </select>
          </div>

          {/* 4. ரெஃப்ரெஷ் & அப்ளை பட்டன் */}
          <div className="flex items-end">
            <button className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-pos-bg hover:bg-slate-800 border border-pos-border text-slate-300 p-2.5 rounded-xl transition-all">
              <RefreshCw size={14} /> Refresh Analytics
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────
          DISPLAYED METRICS (7 ANALYST KPIs GRID)
          ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {analyticsKPIs.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-pos-card border border-pos-border/80 p-5 rounded-2xl shadow-md flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {kpi.title}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-slate-100">
                {kpi.value}
              </span>
              <div
                className={`flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded ${kpi.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-brand-danger"}`}
              >
                {kpi.isUp ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {kpi.change}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────────
          STAFF PERFORMANCE CARD PANEL
          ────────────────────────────────────────────────────────────── */}
      <div className="bg-pos-card border border-pos-border rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-200 tracking-wide flex items-center gap-2">
              <Users size={18} className="text-brand-warning" /> Staff
              Performance Analysis
            </h2>
            <p className="text-[11px] text-slate-500">
              Comprehensive productivity audit of sales staff and terminal
              actions.
            </p>
          </div>
          <div className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-md font-bold uppercase flex items-center gap-1">
            <CheckCircle size={10} className="text-brand-success" /> Live Status
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-pos-border text-xs uppercase font-semibold">
                <th className="pb-3">Cashier Name</th>
                <th className="pb-3 text-right">Revenue Generated</th>
                <th className="pb-3 text-center">Transaction Count</th>
                <th className="pb-3 text-center">Units Sold</th>
                <th className="pb-3 text-right">Terminal Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border/40 font-medium">
              {staffPerformance.map((staff, idx) => (
                <tr
                  key={idx}
                  className="text-slate-300 hover:bg-pos-bg/20 transition-colors"
                >
                  <td className="py-4">
                    <div className="font-bold text-slate-200">{staff.name}</div>
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-500">
                      {staff.role}
                    </div>
                  </td>
                  <td className="py-4 text-right font-mono font-bold text-emerald-400">
                    {staff.revenue}
                  </td>
                  <td className="py-4 text-center font-mono text-slate-200">
                    {staff.transactions} bills
                  </td>
                  <td className="py-4 text-center font-mono text-slate-400">
                    {staff.units} pcs
                  </td>
                  <td className="py-4 text-right font-mono">
                    <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-md font-bold">
                      {staff.efficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
