import React, { useState, useEffect, useMemo } from "react";
import KPIBox from "../../components/dashboard/KPIBox";
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
import { calculateLineTotal } from "../../utils/invoiceCalculations";
import { useAuth } from "../../context/AuthContext";

const parseInvoiceDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
};

const formatDateToInputString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculatePeriodStats = (invoices, expenses, startDate, endDate, productCostMap) => {
  let filteredInvoices = invoices.filter(inv => inv.status === "Active");
  let filteredExpenses = [...expenses];

  if (startDate) {
    filteredInvoices = filteredInvoices.filter(inv => {
      const d = parseInvoiceDate(inv.date);
      return d >= startDate;
    });
    filteredExpenses = filteredExpenses.filter(exp => {
      const d = new Date(exp.date + "T00:00:00");
      return d >= startDate;
    });
  }

  if (endDate) {
    filteredInvoices = filteredInvoices.filter(inv => {
      const d = parseInvoiceDate(inv.date);
      return d <= endDate;
    });
    filteredExpenses = filteredExpenses.filter(exp => {
      const d = new Date(exp.date + "T23:59:59");
      return d <= endDate;
    });
  }

  let totalRevenue = 0;
  let totalCost = 0;
  let unitsSold = 0;
  let totalTransactions = filteredInvoices.length;

  filteredInvoices.forEach(inv => {
    totalRevenue += inv.grandTotal || 0;
    
    (inv.items || []).forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const returnedQty = (inv.returns || [])
        .filter(r => r.sku === item.sku)
        .reduce((sum, r) => sum + (parseFloat(r.quantityReturned) || 0), 0);
      const netQty = Math.max(0, qty - returnedQty);
      
      unitsSold += netQty;

      const costPrice = item.costPrice !== undefined 
        ? parseFloat(item.costPrice) 
        : (productCostMap[item.sku] !== undefined 
          ? parseFloat(productCostMap[item.sku]) 
          : (parseFloat(item.rate) || 0) * 0.7);

      totalCost += netQty * costPrice;
    });
  });

  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    profitMargin,
    totalTransactions,
    totalExpense,
    unitsSold,
    averageTicket,
    filteredInvoices
  };
};

const getTrendString = (current, previous) => {
  if (!previous || previous === 0) {
    if (current > 0) return { trend: "New", trendType: "up" };
    return { trend: "0%", trendType: "neutral" };
  }
  const pct = ((current - previous) / previous) * 100;
  const formatted = pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  const type = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";
  return { trend: formatted, trendType: type };
};

const StoreOverview = () => {
  const { currentUser } = useAuth();
  // 1. Time Filter States
  const [timeFilter, setTimeFilter] = useState("Today");
  const [dateFrom, setDateFrom] = useState(() => formatDateToInputString(new Date()));
  const [dateTo, setDateTo] = useState(() => formatDateToInputString(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 2. Data States
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    try {
      const savedInvoices = localStorage.getItem("billmate_invoices");
      const savedExpenses = localStorage.getItem("billmate_expenses");
      const savedProducts = localStorage.getItem("billmate_products");

      setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      setProducts(savedProducts ? JSON.parse(savedProducts) : []);
    } catch (e) {
      console.error("Error loading local storage data in dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTimeFilterClick = (mode) => {
    setTimeFilter(mode);
    const now = new Date();
    if (mode === "Today") {
      const todayStr = formatDateToInputString(now);
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (mode === "Week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      setDateFrom(formatDateToInputString(weekAgo));
      setDateTo(formatDateToInputString(now));
    } else if (mode === "Month") {
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      setDateFrom(formatDateToInputString(monthAgo));
      setDateTo(formatDateToInputString(now));
    } else if (mode === "All Time") {
      setDateFrom("");
      setDateTo("");
    }
  };

  const handleCustomDateChange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
    setTimeFilter("Custom");
  };

  const productCostMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (p.sku) {
        map[p.sku] = parseFloat(p.costPrice) || 0;
      }
    });
    return map;
  }, [products]);

  const stats = useMemo(() => {
    let currentStart = null;
    let currentEnd = null;
    const now = new Date();

    if (timeFilter === "Today") {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeFilter === "Week") {
      currentStart = new Date();
      currentStart.setDate(now.getDate() - 7);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeFilter === "Month") {
      currentStart = new Date();
      currentStart.setDate(now.getDate() - 30);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeFilter === "All Time") {
      currentStart = null;
      currentEnd = null;
    } else if (timeFilter === "Custom") {
      currentStart = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
      currentEnd = dateTo ? new Date(dateTo + "T23:59:59") : null;
    }

    const currentStats = calculatePeriodStats(invoices, expenses, currentStart, currentEnd, productCostMap);

    let prevStart = null;
    let prevEnd = null;

    if (timeFilter === "Today") {
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentEnd);
      prevEnd.setDate(prevEnd.getDate() - 1);
    } else if (timeFilter === "Week") {
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(currentStart);
    } else if (timeFilter === "Month") {
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 30);
      prevEnd = new Date(currentStart);
    } else if (timeFilter === "Custom" && currentStart && currentEnd) {
      const duration = currentEnd.getTime() - currentStart.getTime();
      prevStart = new Date(currentStart.getTime() - duration);
      prevEnd = new Date(currentStart.getTime());
    }

    const prevStats = prevStart ? calculatePeriodStats(invoices, expenses, prevStart, prevEnd, productCostMap) : null;

    return {
      current: currentStats,
      previous: prevStats
    };
  }, [invoices, expenses, productCostMap, timeFilter, dateFrom, dateTo]);

  const topProducts = useMemo(() => {
    const acc = {};
    const activeInvs = stats.current.filteredInvoices || [];

    activeInvs.forEach(inv => {
      (inv.items || []).forEach(item => {
        const qty = parseFloat(item.quantity) || 0;
        const returnedQty = (inv.returns || [])
          .filter(r => r.sku === item.sku)
          .reduce((sum, r) => sum + (parseFloat(r.quantityReturned) || 0), 0);
        const netQty = Math.max(0, qty - returnedQty);

        if (netQty <= 0) return;

        const key = item.sku || item.name;

        const netItem = {
          rate: parseFloat(item.rate) || 0,
          quantity: netQty,
          discount: parseFloat(item.discount) || 0,
          tax: parseFloat(item.tax) || 0
        };
        const revenue = calculateLineTotal(netItem);

        const costPrice = item.costPrice !== undefined 
          ? parseFloat(item.costPrice) 
          : (productCostMap[item.sku] !== undefined 
            ? parseFloat(productCostMap[item.sku]) 
            : (parseFloat(item.rate) || 0) * 0.7);

        const cost = netQty * costPrice;
        const profit = revenue - cost;

        if (!acc[key]) {
          acc[key] = {
            name: item.name,
            sku: item.sku,
            category: item.category || "General",
            sold: 0,
            revenue: 0,
            profit: 0
          };
        }
        acc[key].sold += netQty;
        acc[key].revenue += revenue;
        acc[key].profit += profit;
      });
    });

    return Object.values(acc)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);
  }, [stats.current.filteredInvoices, productCostMap]);

  const staffPerformance = useMemo(() => {
    const acc = {};
    const activeInvs = stats.current.filteredInvoices || [];

    activeInvs.forEach(inv => {
      const op = inv.operator || "admin";
      
      let invoiceUnits = 0;
      (inv.items || []).forEach(item => {
        const qty = parseFloat(item.quantity) || 0;
        const returnedQty = (inv.returns || [])
          .filter(r => r.sku === item.sku)
          .reduce((sum, r) => sum + (parseFloat(r.quantityReturned) || 0), 0);
        invoiceUnits += Math.max(0, qty - returnedQty);
      });

      if (!acc[op]) {
        acc[op] = {
          name: op === "admin" 
            ? (currentUser === "admin" ? "Admin (You)" : "Admin") 
            : (op === currentUser ? `${op.charAt(0).toUpperCase() + op.slice(1)} (You)` : op.charAt(0).toUpperCase() + op.slice(1)),
          role: op === "admin" ? "Admin" : "Cashier",
          transactions: 0,
          units: 0,
          revenue: 0
        };
      }

      acc[op].transactions += 1;
      acc[op].units += invoiceUnits;
      acc[op].revenue += inv.grandTotal || 0;
    });

    return Object.values(acc).sort((a, b) => b.revenue - a.revenue);
  }, [stats.current.filteredInvoices]);

  const handleExportCSV = () => {
    let csv = "STORE OVERVIEW DASHBOARD REPORT\n";
    csv += `Time Frame,${timeFilter || "Custom"}\n`;
    csv += `Date Range,${dateFrom || "Beginning"} to ${dateTo || "Today"}\n\n`;

    csv += "KEY PERFORMANCE INDICATORS\n";
    csv += "Metric,Value\n";
    csv += `Total Revenue,₹${stats.current.totalRevenue.toFixed(2)}\n`;
    csv += `Gross Profit,₹${stats.current.grossProfit.toFixed(2)}\n`;
    csv += `Profit Margin,${stats.current.profitMargin.toFixed(1)}%\n`;
    csv += `Total Transactions,${stats.current.totalTransactions}\n`;
    csv += `Total Expense,₹${stats.current.totalExpense.toFixed(2)}\n`;
    csv += `Units Sold,${stats.current.unitsSold} pcs\n`;
    csv += `Average Ticket,₹${stats.current.averageTicket.toFixed(2)}\n`;
    csv += `Total Cost,₹${stats.current.totalCost.toFixed(2)}\n\n`;

    csv += "TOP SELLING PRODUCTS\n";
    csv += "SKU,Product Name,Category,Quantity Sold,Revenue,Profit\n";
    topProducts.forEach((p) => {
      csv += `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}",${p.sold},₹${p.revenue.toFixed(2)},₹${p.profit.toFixed(2)}\n`;
    });
    csv += "\n";

    csv += "STAFF PERFORMANCE\n";
    csv += "Staff Name,Role,Transactions,Units Sold,Revenue Generated\n";
    staffPerformance.forEach((s) => {
      csv += `"${s.name}","${s.role}",${s.transactions},${s.units},₹${s.revenue.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stampedDate = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `sdl_billmate_dashboard_report_${stampedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trendRevenue = getTrendString(stats.current.totalRevenue, stats.previous?.totalRevenue);
  const trendProfit = getTrendString(stats.current.grossProfit, stats.previous?.grossProfit);
  const trendTransactions = getTrendString(stats.current.totalTransactions, stats.previous?.totalTransactions);
  const trendExpense = getTrendString(stats.current.totalExpense, stats.previous?.totalExpense);
  const trendUnitsSold = getTrendString(stats.current.unitsSold, stats.previous?.unitsSold);
  const trendAverageTicket = getTrendString(stats.current.averageTicket, stats.previous?.averageTicket);

  const marginHealth = stats.current.profitMargin >= 20 
    ? { label: "Healthy", colorClass: "text-[#2E7D32] bg-emerald-500/10", indicatorClass: "bg-[#2E7D32]" } 
    : stats.current.profitMargin >= 10 
      ? { label: "Moderate", colorClass: "text-[#f59e0b] bg-[#f59e0b]/10", indicatorClass: "bg-[#f59e0b]" } 
      : { label: "Low", colorClass: "text-brand-danger bg-brand-danger/10", indicatorClass: "bg-brand-danger" };

  return (
    <div className="p-6 space-y-6">
      {/* ──────────────────────────────────────────────────────────────
          TOP ACTION BAR: Title, Filters & Export Buttons
          ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-pos-card border border-pos-border p-4 rounded-2xl shadow-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009b77]">
            Store Overview Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            Real-time sales intelligence and business performance metrics.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Time Filter Group */}
          <div className="flex items-center bg-pos-bg border border-pos-border p-1 rounded-xl">
            {["Today", "Week", "Month", "All Time"].map((mode) => (
              <button
                key={mode}
                onClick={() => handleTimeFilterClick(mode)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  timeFilter === mode
                    ? "bg-[#009b77] text-white shadow-md font-bold"
                    : "text-slate-500 hover:text-[#009b77]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Custom Date & Other Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showDatePicker || timeFilter === "Custom"
                  ? "bg-[#009b77]/10 border-[#009b77] text-[#009b77]"
                  : "bg-pos-bg border-pos-border text-slate-500 hover:text-[#009b77]"
              }`}
              title="Custom Date Range"
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-pos-bg border border-pos-border text-slate-500 hover:text-[#009b77] transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Inline Date Picker Drawer */}
      {showDatePicker && (
        <div className="flex flex-wrap items-center gap-4 bg-pos-card border border-pos-border p-4 rounded-2xl shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleCustomDateChange(e.target.value, dateTo)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20 text-slate-800 font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleCustomDateChange(dateFrom, e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20 text-slate-800 font-bold"
            />
          </div>
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setTimeFilter("All Time");
              setShowDatePicker(false);
            }}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Clear Custom Filter
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
          8 KEY PERFORMANCE INDICATORS (KPIs GRID)
          ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Revenue */}
        <KPIBox
          title="Total Revenue"
          value={`₹${stats.current.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={trendRevenue.trend}
          trendType={trendRevenue.trendType}
          description="Gross sales generated"
          color="success"
        />

        {/* 2. Gross Profit */}
        <KPIBox
          title="Gross Profit"
          value={`₹${stats.current.grossProfit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend={trendProfit.trend}
          trendType={trendProfit.trendType}
          description="Revenue minus product cost"
          color="primary"
        />

        {/* 3. Profit Margin (%) */}
        <div className="bg-pos-card border border-pos-border p-6 rounded shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-slate-400 uppercase tracking-wide select-none">
              Profit Margin
            </span>
            <div className={`p-2 rounded-xl ${marginHealth.colorClass}`}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2.5">
              <span className="text-xl sm:text-2xl lg:text-xl xl:text-3xl 2xl:text-4xl font-bold text-[#2E7D32] tracking-tight font-mono break-all leading-tight">
                {stats.current.profitMargin.toFixed(1)}%
              </span>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${marginHealth.colorClass}`}>
                {marginHealth.label}
              </span>
            </div>
            {/* Dynamic Gauge Progress Indicator Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${marginHealth.indicatorClass}`}
                style={{ width: `${Math.min(100, Math.max(0, stats.current.profitMargin))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 4. Total Transactions */}
        <KPIBox
          title="Total Transactions"
          value={stats.current.totalTransactions.toString()}
          icon={ShoppingBag}
          trend={trendTransactions.trend}
          trendType={trendTransactions.trendType}
          description="Count of completed bills"
          color="primary"
        />

        {/* 5. Total Expense */}
        <KPIBox
          title="Total Expense"
          value={`₹${stats.current.totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={CreditCard}
          trend={trendExpense.trend}
          trendType={trendExpense.trendType}
          description="Sum of shop expenses"
          color="danger"
        />

        {/* 6. Units Sold */}
        <KPIBox
          title="Units Sold"
          value={`${stats.current.unitsSold.toFixed(0)} pcs`}
          icon={ShoppingBag}
          trend={trendUnitsSold.trend}
          trendType={trendUnitsSold.trendType}
          description="Total items passed inventory"
          color="warning"
        />

        {/* 7. Average Ticket */}
        <KPIBox
          title="Average Ticket"
          value={`₹${stats.current.averageTicket.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={trendAverageTicket.trend}
          trendType={trendAverageTicket.trendType}
          description="Average basket sale value"
          color="primary"
        />

        {/* 8. Total Cost */}
        <KPIBox
          title="Total Cost"
          value={`₹${stats.current.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                <h2 className="text-xl font-bold text-slate-800 tracking-wide">
                  Top Selling Products
                </h2>
                <p className="text-xs text-text-muted mt-0.5 font-medium">
                  Ranked by volume, revenue, and profitability.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-pos-border text-xs uppercase font-semibold">
                    <th className="pb-3 text-xs font-semibold uppercase">Product</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase">Sold</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase">Revenue</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/40 text-sm font-medium text-slate-700">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted text-xs font-medium uppercase tracking-wider">
                        No sales recorded in the selected period.
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((prod, idx) => (
                      <tr
                        key={idx}
                        className="text-slate-700 hover:bg-slate-50/50 transition-colors text-sm font-medium"
                      >
                        <td className="py-3">
                          <div className="font-bold text-slate-800 truncate max-w-[160px] text-sm">
                            {prod.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {prod.category}
                          </div>
                        </td>
                        <td className="py-3 text-center font-mono text-slate-800 font-bold text-sm">
                          {prod.sold.toFixed(0)} Qty
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-800 text-sm">
                          ₹{prod.revenue.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-[#2E7D32] text-sm">
                          ₹{prod.profit.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                      </tr>
                    ))
                  )}
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
                <h2 className="text-xl font-bold text-slate-800 tracking-wide">
                  Staff Performance
                </h2>
                <p className="text-xs text-text-muted mt-0.5 font-medium">
                  Cashier-wise breakdown of sales data.
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-pos-bg border border-pos-border text-slate-400">
                <Users size={15} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-pos-border text-xs uppercase font-semibold">
                    <th className="pb-3 text-xs font-semibold uppercase">Staff / Role</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase">Bills</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase">Items Sold</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/40 text-sm font-medium text-slate-700">
                  {staffPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted text-xs font-medium uppercase tracking-wider">
                        No active staff transactions found.
                      </td>
                    </tr>
                  ) : (
                    staffPerformance.map((staff, idx) => (
                      <tr
                        key={idx}
                        className="text-slate-700 hover:bg-slate-50/50 transition-colors text-sm font-medium"
                      >
                        <td className="py-3.5">
                          <div className="font-bold text-slate-800 text-sm">
                            {staff.name}
                          </div>
                          <div className="text-xs uppercase text-brand-warning font-semibold tracking-wide">
                            {staff.role}
                          </div>
                        </td>
                        <td className="py-3.5 text-center font-mono font-medium text-slate-500 text-sm">
                          {staff.transactions}
                        </td>
                        <td className="py-3.5 text-center font-mono font-medium text-slate-500 text-sm">
                          {staff.units.toFixed(0)} pcs
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-[#009b77] text-sm">
                          ₹{staff.revenue.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                      </tr>
                    ))
                  )}
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
        