import React, { useState, useEffect, useMemo } from "react";
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
import { calculateLineTotal } from "../../utils/invoiceCalculations";
import { useAuth } from "../../context/AuthContext";

const parseInvoiceDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
};

const formatStaffName = (name) => {
  if (!name) return "All";
  if (name === "All") return "All Cashiers";
  const lower = name.toLowerCase();
  if (lower === "admin") {
    return "Admin";
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const calculateAnalyticsStats = (invoices, expenses, startDate, endDate, selectedCategory, selectedStaff, productCostMap) => {
  // 1. Filter invoices by status
  let filteredInvoices = invoices.filter(inv => inv.status === "Active");

  // 2. Filter by Date range
  if (startDate) {
    filteredInvoices = filteredInvoices.filter(inv => {
      const d = parseInvoiceDate(inv.date);
      return d >= startDate;
    });
  }
  if (endDate) {
    filteredInvoices = filteredInvoices.filter(inv => {
      const d = parseInvoiceDate(inv.date);
      return d <= endDate;
    });
  }

  // 3. Filter by Staff operator
  if (selectedStaff && selectedStaff !== "All") {
    filteredInvoices = filteredInvoices.filter(inv => {
      const op = (inv.operator || "admin").toLowerCase();
      const sel = selectedStaff.toLowerCase();
      if (sel === "admin" && op === "admin") return true;
      return op.includes(sel) || sel.includes(op);
    });
  }

  // 4. Calculate stats, considering Category Filter
  let totalRevenue = 0;
  let totalCost = 0;
  let unitsSold = 0;
  let matchingTransactionCount = 0;

  filteredInvoices.forEach(inv => {
    let hasMatchingItem = false;
    let invoiceRevenueForCategory = 0;
    let invoiceCostForCategory = 0;
    let invoiceUnitsForCategory = 0;

    (inv.items || []).forEach(item => {
      const itemCategory = item.category || "General";
      const categoryMatches = (selectedCategory === "All") || (itemCategory.toLowerCase() === selectedCategory.toLowerCase());

      if (categoryMatches) {
        hasMatchingItem = true;
        const qty = parseFloat(item.quantity) || 0;
        const returnedQty = (inv.returns || [])
          .filter(r => r.sku === item.sku)
          .reduce((sum, r) => sum + (parseFloat(r.quantityReturned) || 0), 0);
        const netQty = Math.max(0, qty - returnedQty);

        if (netQty > 0) {
          const netItem = {
            rate: parseFloat(item.rate) || 0,
            quantity: netQty,
            discount: parseFloat(item.discount) || 0,
            tax: parseFloat(item.tax) || 0
          };
          const lineRevenue = calculateLineTotal(netItem);
          invoiceRevenueForCategory += lineRevenue;

          const costPrice = item.costPrice !== undefined 
            ? parseFloat(item.costPrice) 
            : (productCostMap[item.sku] !== undefined 
              ? parseFloat(productCostMap[item.sku]) 
              : (parseFloat(item.rate) || 0) * 0.7);

          const lineCost = netQty * costPrice;
          invoiceCostForCategory += lineCost;
          invoiceUnitsForCategory += netQty;
        }
      }
    });

    if (hasMatchingItem) {
      matchingTransactionCount += 1;
      totalRevenue += invoiceRevenueForCategory;
      totalCost += invoiceCostForCategory;
      unitsSold += invoiceUnitsForCategory;
    }
  });

  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  let filteredExpenses = [...expenses];
  if (startDate) {
    filteredExpenses = filteredExpenses.filter(exp => {
      const d = new Date(exp.date + "T00:00:00");
      return d >= startDate;
    });
  }
  if (endDate) {
    filteredExpenses = filteredExpenses.filter(exp => {
      const d = new Date(exp.date + "T23:59:59");
      return d <= endDate;
    });
  }
  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const averageTicket = matchingTransactionCount > 0 ? totalRevenue / matchingTransactionCount : 0;

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    profitMargin,
    transactionCount: matchingTransactionCount,
    unitsSold,
    averageTicket,
    totalExpense,
    filteredInvoices
  };
};

const getTrend = (current, previous) => {
  if (!previous || previous === 0) {
    if (current > 0) return { trend: "New", isUp: true };
    return { trend: "0%", isUp: true };
  }
  const pct = ((current - previous) / previous) * 100;
  const formatted = pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  const isUp = pct >= 0;
  return { trend: formatted, isUp };
};

const Analytics = () => {
  const { currentUser } = useAuth();
  // 1. Filter states
  const [period, setPeriod] = useState("Month");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState("All");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // 2. Data states
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
      console.error("Error loading local storage data in analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productCostMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (p.sku) {
        map[p.sku] = parseFloat(p.costPrice) || 0;
      }
    });
    return map;
  }, [products]);

  // Dynamic filter collections
  const availableCategories = useMemo(() => {
    const cats = new Set(["Grocery", "Household", "Snacks", "Dairy"]);
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    invoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        if (item.category) cats.add(item.category);
      });
    });
    return Array.from(cats);
  }, [products, invoices]);

  const availableStaff = useMemo(() => {
    const staffSet = new Set(["admin", "Anitha Devi", "Ramesh Raj"]);
    invoices.forEach(inv => {
      if (inv.operator) staffSet.add(inv.operator);
    });
    return Array.from(staffSet);
  }, [invoices]);

  // Main calculation engine
  const stats = useMemo(() => {
    let currentStart = null;
    let currentEnd = null;
    const now = new Date();

    if (period === "Today") {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "Week") {
      currentStart = new Date();
      currentStart.setDate(now.getDate() - 7);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "Month") {
      currentStart = new Date();
      currentStart.setDate(now.getDate() - 30);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "All Time") {
      currentStart = null;
      currentEnd = null;
    } else if (period === "Custom") {
      currentStart = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
      currentEnd = dateTo ? new Date(dateTo + "T23:59:59") : null;
    }

    const currentStats = calculateAnalyticsStats(invoices, expenses, currentStart, currentEnd, selectedCategory, selectedStaff, productCostMap);

    let prevStart = null;
    let prevEnd = null;

    if (period === "Today") {
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(currentEnd);
      prevEnd.setDate(prevEnd.getDate() - 1);
    } else if (period === "Week") {
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(currentStart);
    } else if (period === "Month") {
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 30);
      prevEnd = new Date(currentStart);
    } else if (period === "Custom" && currentStart && currentEnd) {
      const duration = currentEnd.getTime() - currentStart.getTime();
      prevStart = new Date(currentStart.getTime() - duration);
      prevEnd = new Date(currentStart.getTime());
    }

    const prevStats = prevStart ? calculateAnalyticsStats(invoices, expenses, prevStart, prevEnd, selectedCategory, selectedStaff, productCostMap) : null;

    return {
      current: currentStats,
      previous: prevStats
    };
  }, [invoices, expenses, productCostMap, period, dateFrom, dateTo, selectedCategory, selectedStaff]);

  const trendRevenue = getTrend(stats.current.totalRevenue, stats.previous?.totalRevenue);
  const trendCost = getTrend(stats.current.totalCost, stats.previous?.totalCost);
  const trendProfit = getTrend(stats.current.grossProfit, stats.previous?.grossProfit);
  const trendMargin = getTrend(stats.current.profitMargin, stats.previous?.profitMargin);
  const trendTransactionCount = getTrend(stats.current.transactionCount, stats.previous?.transactionCount);
  const trendUnitsSold = getTrend(stats.current.unitsSold, stats.previous?.unitsSold);
  const trendAverageTicket = getTrend(stats.current.averageTicket, stats.previous?.averageTicket);

  const analyticsKPIs = [
    {
      title: "Total Revenue",
      value: `₹${stats.current.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: trendRevenue.trend,
      isUp: trendRevenue.isUp,
      sub: "Gross sales generated",
    },
    {
      title: "Total Cost",
      value: `₹${stats.current.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: trendCost.trend,
      isUp: trendCost.isUp,
      sub: "Cost of Goods Sold",
    },
    {
      title: "Gross Profit",
      value: `₹${stats.current.grossProfit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: trendProfit.trend,
      isUp: trendProfit.isUp,
      sub: "Net Earnings",
    },
    {
      title: "Profit Margin",
      value: `${stats.current.profitMargin.toFixed(2)}%`,
      change: trendMargin.trend,
      isUp: trendMargin.isUp,
      sub: "Avg Margin Rate",
    },
    {
      title: "Transaction count",
      value: stats.current.transactionCount.toLocaleString("en-IN"),
      change: trendTransactionCount.trend,
      isUp: trendTransactionCount.isUp,
      sub: "Completed Bills",
    },
    {
      title: "Units Sold",
      value: `${stats.current.unitsSold.toFixed(0)} pcs`,
      change: trendUnitsSold.trend,
      isUp: trendUnitsSold.isUp,
      sub: "Inventory Volume",
    },
    {
      title: "Average Ticket Value",
      value: `₹${stats.current.averageTicket.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: trendAverageTicket.trend,
      isUp: trendAverageTicket.isUp,
      sub: "Avg Value Per Bill",
    },
  ];

  const staffPerformanceAnalysis = useMemo(() => {
    const acc = {};
    const activeInvs = stats.current.filteredInvoices || [];

    activeInvs.forEach(inv => {
      const op = inv.operator || "admin";
      
      let invoiceUnits = 0;
      (inv.items || []).forEach(item => {
        const itemCategory = item.category || "General";
        const categoryMatches = (selectedCategory === "All") || (itemCategory.toLowerCase() === selectedCategory.toLowerCase());

        if (categoryMatches) {
          const qty = parseFloat(item.quantity) || 0;
          const returnedQty = (inv.returns || [])
            .filter(r => r.sku === item.sku)
            .reduce((sum, r) => sum + (parseFloat(r.quantityReturned) || 0), 0);
          invoiceUnits += Math.max(0, qty - returnedQty);
        }
      });

      let operatorInvoiceRevenue = 0;
      (inv.items || []).forEach(item => {
        const itemCategory = item.category || "General";
        const categoryMatches = (selectedCategory === "All") || (itemCategory.toLowerCase() === selectedCategory.toLowerCase());

        if (categoryMatches) {
          const qty = parseFloat(item.quantity) || 0;
          const returnedQty = (inv.returns || [])
            .filter(r => r.sku === item.sku)
            .reduce((sum, r) => sum + (parseFloat(r.quantityReturned) || 0), 0);
          const netQty = Math.max(0, qty - returnedQty);
          if (netQty > 0) {
            const netItem = {
              rate: parseFloat(item.rate) || 0,
              quantity: netQty,
              discount: parseFloat(item.discount) || 0,
              tax: parseFloat(item.tax) || 0
            };
            operatorInvoiceRevenue += calculateLineTotal(netItem);
          }
        }
      });

      if (operatorInvoiceRevenue === 0 && invoiceUnits === 0 && selectedCategory !== "All") {
        return;
      }

      if (!acc[op]) {
        acc[op] = {
          name: op === "admin" 
            ? (currentUser === "admin" ? "Admin (You)" : "Admin") 
            : (op === currentUser ? `${op.charAt(0).toUpperCase() + op.slice(1)} (You)` : op.charAt(0).toUpperCase() + op.slice(1)),
          role: op === "admin" ? "Admin" : "Cashier",
          revenue: 0,
          transactions: 0,
          units: 0
        };
      }

      acc[op].transactions += 1;
      acc[op].units += invoiceUnits;
      acc[op].revenue += operatorInvoiceRevenue;
    });

    return Object.values(acc).map(staff => {
      return {
        ...staff,
        efficiency: staff.revenue > 10000 ? "98%" : staff.revenue > 5000 ? "94%" : staff.revenue > 1000 ? "90%" : "85%"
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [stats.current.filteredInvoices, selectedCategory]);

  const handleExportCSV = () => {
    let csv = "DEEP BUSINESS ANALYTICS REPORT\n";
    csv += `Time Frame,${period}\n`;
    csv += `Date Range,${dateFrom || "Beginning"} to ${dateTo || "Today"}\n`;
    csv += `Product Category Filter,${selectedCategory}\n`;
    csv += `Handled By Staff Filter,${selectedStaff}\n\n`;

    csv += "KEY PERFORMANCE INDICATORS\n";
    csv += "Metric,Value,Trend\n";
    csv += `Total Revenue,₹${stats.current.totalRevenue.toFixed(2)},${trendRevenue.trend}\n`;
    csv += `Total Cost,₹${stats.current.totalCost.toFixed(2)},${trendCost.trend}\n`;
    csv += `Gross Profit,₹${stats.current.grossProfit.toFixed(2)},${trendProfit.trend}\n`;
    csv += `Profit Margin,${stats.current.profitMargin.toFixed(2)}%,${trendMargin.trend}\n`;
    csv += `Transaction Count,${stats.current.transactionCount},${trendTransactionCount.trend}\n`;
    csv += `Units Sold,${stats.current.unitsSold} pcs,${trendUnitsSold.trend}\n`;
    csv += `Average Ticket Value,₹${stats.current.averageTicket.toFixed(2)},${trendAverageTicket.trend}\n\n`;

    csv += "STAFF PERFORMANCE ANALYSIS\n";
    csv += "Staff Name,Role,Revenue Generated,Transactions,Units Sold,Efficiency\n";
    staffPerformanceAnalysis.forEach((s) => {
      csv += `"${s.name}","${s.role}",₹${s.revenue.toFixed(2)},${s.transactions},${s.units},${s.efficiency}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stampedDate = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `sdl_billmate_analytics_report_${stampedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 print:p-0 print:bg-white text-slate-800">
      {/* ──────────────────────────────────────────────────────────────
          PRINT ONLY HEADER
          ────────────────────────────────────────────────────────────── */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-950">SDL BillMate POS - Deep Business Analytics Report</h1>
        <p className="text-sm text-slate-600">Generated on: {new Date().toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">
          Period: {period} {period === "Custom" ? `(${dateFrom} to ${dateTo})` : ""} | Category Filter: {selectedCategory} | Staff Filter: {formatStaffName(selectedStaff)}
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────────
          HEADER: Analyst View Title & Export Actions
          ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-[#009b77] font-semibold">
            <BarChart3 size={24} />
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Deep Business Analytics
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-0.5 font-medium">
            Multi-dimensional data analysis and business intelligence reporting.
          </p>
        </div>

        {/* Advanced Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 text-sm font-semibold bg-[#009b77] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0"
          >
            <Download size={15} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────
          FILTER PANEL: Multi-dimensional Filters
          ────────────────────────────────────────────────────────────── */}
      <div className="bg-pos-card border border-pos-border p-4 rounded-2xl shadow-md space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-pos-border/40 pb-2">
          <Filter size={14} className="text-[#009b77]" />
          <span>Analytical Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Period Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Calendar size={12} className="text-[#009b77]" /> Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-pos-border rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20"
            >
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="All Time">All Time</option>
              <option value="Custom">Custom Date Range...</option>
            </select>
          </div>

          {/* 2. Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Layers size={12} className="text-[#009b77]" /> Product Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-pos-border rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Staff Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <User size={12} className="text-[#009b77]" /> Handled By (Staff)
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-pos-border rounded-xl p-2.5 text-slate-800 font-bold focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20"
            >
              <option value="All">All Cashiers</option>
              {availableStaff.map((staff) => (
                <option key={staff} value={staff}>
                  {formatStaffName(staff)}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Refresh & Apply Button */}
          <div className="flex items-end">
            <button
              onClick={loadData}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 border border-pos-border text-slate-700 p-2.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={14} className="text-[#009b77]" /> Refresh Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Block */}
      {period === "Custom" && (
        <div className="flex flex-wrap items-center gap-4 bg-pos-card border border-pos-border p-4 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20 text-slate-800 font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#009b77] focus:ring-2 focus:ring-[#009b77]/20 text-slate-800 font-bold"
            />
          </div>
          <button
            onClick={() => {
              setPeriod("Month");
            }}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Cancel Custom Filter
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
          DISPLAYED METRICS (7 ANALYST KPIs GRID)
          ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {analyticsKPIs.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-pos-card border border-pos-border p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-[#009b77] transition-all select-none"
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {kpi.title}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl lg:text-xl xl:text-3xl font-extrabold font-mono text-slate-800 break-all leading-tight">
                {kpi.value}
              </span>
              <div
                className={`flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                  kpi.isUp ? "bg-emerald-500/10 text-[#009b77]" : "bg-rose-500/10 text-brand-danger"
                }`}
              >
                {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.change}
              </div>
            </div>
            <div className="text-xs text-text-muted mt-1 font-medium">
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────────
          STAFF PERFORMANCE CARD PANEL
          ────────────────────────────────────────────────────────────── */}
      <div className="bg-pos-card border border-pos-border rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <Users size={20} className="text-[#009b77]" /> Staff
              Performance Analysis
            </h2>
            <p className="text-xs text-text-muted mt-0.5 font-medium">
              Comprehensive productivity audit of sales staff and terminal actions.
            </p>
          </div>
          <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-[#009b77] px-2.5 py-1 rounded-md font-bold uppercase flex items-center gap-1 select-none print:hidden">
            <CheckCircle size={10} /> Live Status
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-pos-border text-xs uppercase font-bold">
                <th className="pb-3 text-xs font-bold uppercase">Cashier Name</th>
                <th className="pb-3 text-right text-xs font-bold uppercase">Revenue Generated</th>
                <th className="pb-3 text-center text-xs font-bold uppercase">Transaction Count</th>
                <th className="pb-3 text-center text-xs font-bold uppercase">Units Sold</th>
                <th className="pb-3 text-right text-xs font-bold uppercase">Terminal Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border/40 text-sm font-medium text-slate-700">
              {staffPerformanceAnalysis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted text-xs font-medium uppercase tracking-wider">
                    No active staff transactions found for the selected filters.
                  </td>
                </tr>
              ) : (
                staffPerformanceAnalysis.map((staff, idx) => (
                  <tr
                    key={idx}
                    className="text-slate-700 hover:bg-slate-50/50 transition-colors text-sm font-medium"
                  >
                    <td className="py-4">
                      <div className="font-bold text-sm text-slate-800">{staff.name}</div>
                      <div className="text-xs text-[#009b77] uppercase tracking-wider font-semibold">
                        {staff.role}
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-[#009b77]">
                      ₹{staff.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-center font-mono text-slate-600 font-medium">
                      {staff.transactions} bills
                    </td>
                    <td className="py-4 text-center font-mono text-slate-600 font-medium">
                      {staff.units.toFixed(0)} pcs
                    </td>
                    <td className="py-4 text-right font-mono">
                      <span className="text-xs bg-emerald-500/10 text-[#009b77] border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                        {staff.efficiency}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;