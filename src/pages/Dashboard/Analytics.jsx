import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  ShoppingBag,
  CreditCard,
  Layers,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  User,
  PieChart,
  BarChart3,
} from "lucide-react";

const Analytics = () => {
  // 1. பில்டரிங் ஸ்டேட்டுகள் (Multi-dimensional Filters)
  const [timeFilter, setTimeFilter] = useState("Month");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCashier, setSelectedCashier] = useState("All");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDates, setCustomDates] = useState({
    start: "2026-06-01",
    end: "2026-06-17",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // போலி தரவு (Mock Data) - அனலிட்டிக்ஸ் லாஜிக்கிற்காக
  const loadDeepAnalytics = () => {
    setIsLoading(true);

    // பில்டர்களைப் பொறுத்து நிஜ அப்ளிகேஷனில் குவெரி மாறும்
    setTimeout(() => {
      setAnalyticsData({
        metrics: {
          totalRevenue: 185400.0,
          totalCost: 121300.0,
          grossProfit: 64100.0,
          profitMargin: 34.5,
          transactionCount: 1580,
          unitsSold: 4120,
          averageTicket: 117.34,
        },
        staffPerformance: [
          {
            id: "STF-01",
            name: "Anand Kumar",
            revenue: 78500.0,
            transactions: 650,
            unitsSold: 1820,
          },
          {
            id: "STF-02",
            name: "Priya Sharma",
            revenue: 64200.0,
            transactions: 540,
            unitsSold: 1450,
          },
          {
            id: "STF-03",
            name: "Suresh Raina",
            revenue: 42700.0,
            transactions: 390,
            unitsSold: 850,
          },
        ],
        categoryBreakdown: [
          {
            name: "Groceries",
            share: "55%",
            revenue: 101970.0,
            transactions: 890,
          },
          {
            name: "Cosmetics",
            share: "20%",
            revenue: 37080.0,
            transactions: 240,
          },
          {
            name: "Beverages",
            share: "15%",
            revenue: 27810.0,
            transactions: 310,
          },
          {
            name: "Stationery",
            share: "10%",
            revenue: 18540.0,
            transactions: 140,
          },
        ],
      });
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadDeepAnalytics();
  }, [timeFilter, selectedCategory, selectedCashier]);

  const handleExportCSV = () => {
    alert("Analytics dataset exported successfully!");
  };

  if (!analyticsData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-pos-bg">
        <RefreshCw className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  const { metrics, staffPerformance, categoryBreakdown } = analyticsData;

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-y-auto text-slate-900 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BarChart3 size={22} className="text-brand-500" />
            Deep Analytics View
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Multi-dimensional business auditing and pattern analysis
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto p-2.5 bg-brand-500 hover:bg-brand-500-hover text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-transform"
        >
          <Download size={14} />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* MULTI-DIMENSIONAL FILTERS PANEL */}
      <div className="bg-white border border-pos-border rounded p-4 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Dimension 1: Time Period */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-text-secondary tracking-wider block">
            Timeline Period
          </label>
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setShowCustomDate(e.target.value === "Custom");
              }}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="All Time">All Time</option>
              <option value="Custom">Custom Range...</option>
            </select>
            <Calendar
              size={14}
              className="absolute right-3 top-3 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Dimension 2: Product Category */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-text-secondary tracking-wider block">
            Product Dimension
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="Groceries">Groceries</option>
              <option value="Cosmetics">Cosmetics</option>
              <option value="Beverages">Beverages</option>
              <option value="Stationery">Stationery</option>
            </select>
            <Filter
              size={14}
              className="absolute right-3 top-3 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Dimension 3: Cashier / Staff */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-text-secondary tracking-wider block">
            Human Resource Dimension
          </label>
          <div className="relative">
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Cashiers</option>
              <option value="STF-01">Anand Kumar</option>
              <option value="STF-02">Priya Sharma</option>
              <option value="STF-03">Suresh Raina</option>
            </select>
            <User
              size={14}
              className="absolute right-3 top-3 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Refresh Trigger / Custom Date Informer */}
        <div className="flex items-center gap-2">
          {showCustomDate ? (
            <div className="flex items-center gap-1.5 bg-pos-bg border border-pos-border rounded p-1.5 w-full justify-between">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) =>
                  setCustomDates({ ...customDates, start: e.target.value })
                }
                className="bg-transparent text-[11px] font-mono font-bold outline-none max-w-[95px]"
              />
              <span className="text-[10px] text-slate-400">to</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) =>
                  setCustomDates({ ...customDates, end: e.target.value })
                }
                className="bg-transparent text-[11px] font-mono font-bold outline-none max-w-[95px]"
              />
            </div>
          ) : (
            <button
              onClick={loadDeepAnalytics}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-pos-border rounded cursor-pointer transition-colors"
            >
              <RefreshCw
                size={14}
                className={isLoading ? "animate-spin text-brand-500" : ""}
              />
              <span>Re-run Query</span>
            </button>
          )}
        </div>
      </div>

      {/* METRICS DISCOVERY GRID (7 SPECIFIED METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Total Revenue
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
            ₹
            {metrics.totalRevenue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <DollarSign size={12} className="text-emerald-500" /> Gross volume
            generated
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Total Cost (COGS)
          </span>
          <span className="text-2xl font-black text-slate-600 font-mono block mt-1">
            ₹
            {metrics.totalCost.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <Layers size={12} className="text-slate-400" /> Procurement expense
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Gross Profit
          </span>
          <span className="text-2xl font-black text-blue-600 font-mono block mt-1">
            ₹
            {metrics.grossProfit.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <TrendingUp size={12} className="text-blue-500" /> Net inventory
            earnings
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Profit Margin
          </span>
          <span className="text-2xl font-black text-brand-500 font-mono block mt-1">
            {metrics.profitMargin}%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full"
              style={{ width: `${metrics.profitMargin}%` }}
            />
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Transaction Count
          </span>
          <span className="text-xl font-black text-slate-800 font-mono block mt-1">
            {metrics.transactionCount}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <CreditCard size={12} className="text-indigo-500" /> Completed
            invoices
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Units Sold
          </span>
          <span className="text-xl font-black text-slate-800 font-mono block mt-1">
            {metrics.unitsSold}{" "}
            <span className="text-xs font-normal text-slate-400 font-sans">
              pcs
            </span>
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
            <ShoppingBag size={12} className="text-amber-500" /> Physical stock
            volume
          </div>
        </div>

        {/* Average Ticket Value */}
        <div className="bg-white border border-pos-border rounded p-4 shadow-xs sm:col-span-2 lg:col-span-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary block">
            Average Ticket Value
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              ₹{metrics.averageTicket.toFixed(2)}
            </span>
            <span className="text-xs text-text-secondary font-medium">
              per checkout session
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Calculated as Total Revenue / Transaction Count
          </p>
        </div>
      </div>

      {/* ANALYST INSIGHT TABLES (STAFF PERFORMANCE & CATEGORY AUDIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. STAFF PERFORMANCE CARD (2/3 WIDTH) */}
        <div className="bg-white border border-pos-border rounded shadow-xs flex flex-col overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-pos-border bg-slate-50/50">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User size={15} className="text-brand-500" />
              Staff Productivity Audit
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pos-border bg-slate-50/80 text-[11px] font-bold uppercase text-text-secondary">
                  <th className="py-3 px-4">Cashier Name</th>
                  <th className="py-3 px-4 text-center">Transactions</th>
                  <th className="py-3 px-4 text-center">Units Sold</th>
                  <th className="py-3 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border text-xs">
                {staffPerformance.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {staff.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {staff.transactions}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                      {staff.unitsSold}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-brand-500">
                      ₹
                      {staff.revenue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. CATEGORY SHARE BREAKDOWN (1/3 WIDTH) */}
        <div className="bg-white border border-pos-border rounded shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-pos-border bg-slate-50/50">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <PieChart size={15} className="text-indigo-500" />
              Category Contribution Share
            </h3>
          </div>
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{cat.name}</span>
                  <span className="font-mono text-brand-500">
                    {cat.share} ({cat.transactions} Txns)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: cat.share }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono text-right">
                  Volume: ₹{cat.revenue.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
