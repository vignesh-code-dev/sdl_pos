import React, { useState } from "react";
import KPIBox from "../../components/KPIBox";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Users,
  CreditCard,
  RefreshCw,
  Download,
  Calendar,
} from "lucide-react";

const StoreOverview = () => {
  // 1. டைம் ஃபில்டர் ஸ்டேட் (Today, Week, Month, All Time)
  const [timeFilter, setTimeFilter] = useState("Today");

  // தற்காலிக டேட்டா (Mock Data) - டாக்குமெண்ட் படி அத்தனை விவரங்களும் சேர்க்கப்பட்டுள்ளது
  const topProducts = [
    {
      name: "Maggi Noodles 70g",
      category: "Grocery",
      sold: "142 Qty",
      revenue: "₹2,130",
      profit: "₹426",
    },
    {
      name: "Aashirvaad Atta 5kg",
      category: "Flour",
      sold: "98 Qty",
      revenue: "₹29,400",
      profit: "₹3,430",
    },
    {
      name: "Surf Excel 1kg",
      category: "Household",
      sold: "64 Qty",
      revenue: "₹10,240",
      profit: "₹1,536",
    },
    {
      name: "Good Day Biscuit XL",
      category: "Snacks",
      sold: "55 Qty",
      revenue: "₹1,650",
      profit: "₹330",
    },
  ];

  const staffPerformance = [
    {
      name: "Suresh Kumar (You)",
      role: "Admin",
      transactions: 84,
      units: 312,
      revenue: "₹28,450",
    },
    {
      name: "Anitha Devi",
      role: "Cashier",
      transactions: 48,
      units: 184,
      revenue: "₹14,230",
    },
    {
      name: "Ramesh Raj",
      role: "Cashier",
      transactions: 10,
      units: 25,
      revenue: "₹2,550",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ──────────────────────────────────────────────────────────────
          TOP ACTION BAR: டைட்டில், ஃபில்டர்கள் & எக்ஸ்போர்ட் பட்டன்கள்
          ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-pos-card border border-pos-border p-4 rounded-2xl shadow-md">
        <div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tight">
            Store Overview Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sales intelligence and business performance metrics.
          </p>
        </div>

        {/* ஃபில்டர்கள் & ஆக்ஷன்ஸ் */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* டைம் ஃபில்டர் குரூப் */}
          <div className="flex items-center bg-pos-bg border border-pos-border p-1 rounded-xl">
            {["Today", "Week", "Month", "All Time"].map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeFilter(mode)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeFilter === mode
                    ? "bg-brand-primary text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* கஸ்டம் டேட் & அதர் பட்டன்ஸ் */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-xl bg-pos-bg border border-pos-border text-slate-400 hover:text-white transition-colors"
              title="Custom Date Range"
            >
              <Calendar size={16} />
            </button>
            <button
              className="p-2 rounded-xl bg-pos-bg border border-pos-border text-slate-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
            <button className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl transition-all">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────
          8 KEY PERFORMANCE INDICATORS (KPIs GRID)
          ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Revenue */}
        <KPIBox
          title="Total Revenue"
          value="₹45,230.00"
          icon={DollarSign}
          trend="+12.5%"
          trendType="up"
          description="Gross sales generated"
          color="success"
        />

        {/* 2. Gross Profit */}
        <KPIBox
          title="Gross Profit"
          value="₹12,450.00"
          icon={TrendingUp}
          trend="+14.2%"
          trendType="up"
          description="Revenue minus product cost"
          color="primary"
        />

        {/* 3. Profit Margin (%) — Displays as a gauge indicator layout */}
        <div className="bg-pos-card border border-pos-border p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              Profit Margin
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100">
                27.5%
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                Healthy
              </span>
            </div>
            {/* குட்டி Gauge இண்டிகேட்டர் பார் */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-brand-primary h-full rounded-full"
                style={{ width: "27.5%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* 4. Total Transactions */}
        <KPIBox
          title="Total Transactions"
          value="142"
          icon={ShoppingBag}
          trend="+5.1%"
          trendType="up"
          description="Count of completed bills"
          color="primary"
        />

        {/* 5. Total Expense */}
        <KPIBox
          title="Total Expense"
          value="₹3,150.00"
          icon={CreditCard}
          trend="-8.3%"
          trendType="down"
          description="Sum of shop expenses"
          color="danger"
        />

        {/* 6. Units Sold */}
        <KPIBox
          title="Units Sold"
          value="521 pcs"
          icon={ShoppingBag}
          trend="+10.4%"
          trendType="up"
          description="Total items passed inventory"
          color="warning"
        />

        {/* 7. Average Ticket */}
        <KPIBox
          title="Average Ticket"
          value="₹318.50"
          icon={DollarSign}
          trend="+2.3%"
          trendType="up"
          description="Average basket sale value"
          color="primary"
        />

        {/* 8. Total Cost */}
        <KPIBox
          title="Total Cost"
          value="₹32,780.00"
          icon={AlertCircle}
          trend="Calculated"
          trendType="neutral"
          description="Aggregate cost of sold goods"
          color="neutral"
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────
          SUPPLEMENTARY PANELS: TOP PRODUCTS & STAFF PERFORMANCE
          ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL A: Top Selling Products */}
        <div className="bg-pos-card border border-pos-border rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 tracking-wide">
                  Top Selling Products
                </h2>
                <p className="text-[11px] text-slate-500">
                  Ranked by volume, revenue, and profitability.
                </p>
              </div>
              <button className="text-xs text-brand-primary font-semibold hover:underline flex items-center gap-1">
                Full Catalogue <ArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-pos-border text-xs uppercase font-semibold">
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-center">Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                    <th className="pb-3 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/40">
                  {topProducts.map((prod, idx) => (
                    <tr
                      key={idx}
                      className="text-slate-300 hover:bg-pos-bg/20 transition-colors"
                    >
                      <td className="py-3">
                        <div className="font-semibold text-slate-200 truncate max-w-[160px]">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {prod.category}
                        </div>
                      </td>
                      <td className="py-3 text-center font-mono text-slate-300 font-medium">
                        {prod.sold}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-200">
                        {prod.revenue}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        {prod.profit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PANEL B: Staff Performance */}
        <div className="bg-pos-card border border-pos-border rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 tracking-wide">
                  Staff Performance
                </h2>
                <p className="text-[11px] text-slate-500">
                  Cashier-wise breakdown of sales data.
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-pos-bg border border-pos-border text-slate-400">
                <Users size={15} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-pos-border text-xs uppercase font-semibold">
                    <th className="pb-3">Staff / Role</th>
                    <th className="pb-3 text-center">Bills</th>
                    <th className="pb-3 text-center">Items Sold</th>
                    <th className="pb-3 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/40">
                  {staffPerformance.map((staff, idx) => (
                    <tr
                      key={idx}
                      className="text-slate-300 hover:bg-pos-bg/20 transition-colors"
                    >
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-200">
                          {staff.name}
                        </div>
                        <div className="text-[10px] font-mono font-bold uppercase text-brand-warning">
                          {staff.role}
                        </div>
                      </td>
                      <td className="py-3.5 text-center font-mono font-medium text-slate-400">
                        {staff.transactions}
                      </td>
                      <td className="py-3.5 text-center font-mono font-medium text-slate-400">
                        {staff.units} pcs
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-brand-primary">
                        {staff.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreOverview;
