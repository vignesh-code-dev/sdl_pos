import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  ShoppingBag,
  CreditCard,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Download,
  User,
  Award,
} from "lucide-react";

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("Month");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDates, setCustomDates] = useState({
    start: "2026-06-01",
    end: "2026-06-17",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // போலி தரவு (Mock Data) லோடிங்
  const loadDashboardIntelligence = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setDashboardData({
        kpis: {
          totalRevenue: 145250.0,
          grossProfit: 48380.0,
          profitMargin: 33.3,
          totalTransactions: 1240,
          totalExpense: 12500.0,
          unitsSold: 3420,
          averageTicket: 117.13,
          totalCost: 96870.0,
        },
        topProducts: [
          {
            sku: "GRO-001",
            name: "Aashirvaad Atta 5kg",
            qtySold: 420,
            revenue: 117600.0,
            profit: 25200.0,
          },
          {
            sku: "BEV-012",
            name: "Coca Cola 1.25L",
            qtySold: 310,
            revenue: 21700.0,
            profit: 6200.0,
          },
          {
            sku: "COS-045",
            name: "Sunsilk Shampoo 180ml",
            qtySold: 185,
            revenue: 25900.0,
            profit: 9250.0,
          },
          {
            sku: "STA-009",
            name: "Classmate Notebook A4",
            qtySold: 150,
            revenue: 9000.0,
            profit: 3000.0,
          },
        ],
        staffPerformance: [
          {
            id: "STF-01",
            name: "Anand Kumar",
            transactions: 520,
            unitsSold: 1430,
            revenue: 61100.0,
          },
          {
            id: "STF-02",
            name: "Priya Sharma",
            transactions: 430,
            unitsSold: 1190,
            revenue: 50350.0,
          },
          {
            id: "STF-03",
            name: "Suresh Raina",
            transactions: 290,
            unitsSold: 800,
            revenue: 33800.0,
          },
        ],
      });
      setIsRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    loadDashboardIntelligence();
  }, [timeFilter]);

  if (!dashboardData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-pos-bg">
        <RefreshCw className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  const { kpis, topProducts, staffPerformance } = dashboardData;

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-y-auto text-slate-900 font-sans">
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-white border border-pos-border rounded p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0 shadow-xs mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-500">
            Store Overview
          </h2>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filters Switch */}
          <div className="border border-pos-border rounded flex bg-pos-bg p-1 overflow-hidden text-xs font-bold">
            {["Today", "Week", "Month", "All Time"].map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setTimeFilter(mode);
                  if (mode !== "Custom") setShowCustomDate(false);
                }}
                className={`px-3 py-1.5 rounded cursor-pointer transition-all ${
                  timeFilter === mode
                    ? "bg-brand-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-brand-500"
                }`}
              >
                {mode}
              </button>
            ))}
            <button
              onClick={() => {
                setTimeFilter("Custom");
                setShowCustomDate(!showCustomDate);
              }}
              className={`px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1 ${
                timeFilter === "Custom"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-brand-500"
              }`}
            >
              <Calendar size={12} />
              <span>Custom</span>
            </button>
          </div>

          {/* Custom Date Picker Popup */}
          {showCustomDate && (
            <div className="flex items-center gap-2 bg-pos-bg border border-pos-border rounded px-2 py-1">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) =>
                  setCustomDates({ ...customDates, start: e.target.value })
                }
                className="bg-transparent text-xs font-mono font-bold border-none outline-none"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) =>
                  setCustomDates({ ...customDates, end: e.target.value })
                }
                className="bg-transparent text-xs font-mono font-bold border-none outline-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardIntelligence}
              className="p-2.5 bg-white border border-pos-border rounded text-slate-600 hover:text-brand-500 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin text-brand-500" : ""}
              />
            </button>
            <button className="p-2.5 bg-white border border-pos-border rounded text-slate-600 hover:text-brand-500 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform">
              <Download size={14} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 8-KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Total Revenue
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              ₹
              {kpis.totalRevenue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded text-emerald-600">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Gross Profit
            </span>
            <span className="text-2xl font-black text-blue-600 font-mono block mt-1">
              ₹
              {kpis.grossProfit.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded text-blue-600">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Profit Margin (%) with Visual Gauge */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
          <div className="flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Profit Margin (%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-brand-500 font-mono">
                {kpis.profitMargin}%
              </span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={10} /> Healthy
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full"
                style={{ width: `${kpis.profitMargin}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded text-brand-500 ml-2">
            <Percent size={20} />
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Total Transactions
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              {kpis.totalTransactions}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 rounded text-indigo-600">
            <CreditCard size={20} />
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Total Expense
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono block mt-1">
              ₹
              {kpis.totalExpense.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded text-rose-600">
            <Layers size={20} />
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Units Sold
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              {kpis.unitsSold}{" "}
              <span className="text-xs font-normal font-sans text-slate-400">
                items
              </span>
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded text-amber-600">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Average Ticket
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
              ₹{kpis.averageTicket.toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-teal-50 rounded text-teal-600">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Total Cost (COGS)
            </span>
            <span className="text-2xl font-black text-slate-600 font-mono block mt-1">
              ₹
              {kpis.totalCost.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="p-3 bg-slate-100 rounded text-slate-600">
            <Layers size={20} />
          </div>
        </div>
      </div>

      {/* 3. SUPPLEMENTARY PANELS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PANEL A: TOP SELLING PRODUCTS (NORMAL HTML TABLE) */}
        <div className="bg-white border border-pos-border rounded shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-pos-border flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Award className="text-brand-500" size={18} />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Top Selling Products
              </h3>
            </div>
            <span className="text-[10px] bg-brand-500/10 text-brand-500 font-bold px-2 py-0.5 rounded-full">
              Top 4 Items
            </span>
          </div>

          {/* Normal Table Implementation */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pos-border bg-slate-50 text-[11px] font-bold uppercase text-text-secondary select-none">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Qty Sold</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border text-xs">
                {topProducts.map((product) => (
                  <tr
                    key={product.sku}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SKU: {product.sku}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {product.qtySold}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      ₹
                      {product.revenue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      ₹
                      {product.profit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL B: STAFF PERFORMANCE */}
        <div className="bg-white border border-pos-border rounded shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-pos-border flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <User className="text-indigo-600" size={18} />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Staff Performance
              </h3>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
              Cashier-wise Analytics
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto divide-y divide-pos-border">
            {staffPerformance.map((staff) => (
              <div
                key={staff.id}
                className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pos-bg border border-pos-border flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                    {staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {staff.name}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      ID:{" "}
                      <span className="font-mono font-semibold">
                        {staff.id}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-text-secondary block font-semibold uppercase tracking-tight">
                      TXNs
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {staff.transactions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block font-semibold uppercase tracking-tight">
                      Units
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {staff.unitsSold}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block font-semibold uppercase tracking-tight">
                      Revenue
                    </span>
                    <span className="text-xs font-mono font-black text-brand-500">
                      ₹{staff.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
