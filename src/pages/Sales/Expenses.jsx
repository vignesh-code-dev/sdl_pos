import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Download,
  Search,
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  FileText,
  Building2,
  Bookmark,
  PlusCircle,
  X,
  AlertTriangle
} from "lucide-react";

export default function Expenses() {
  // --- 1. SEED DATA / STATE ---
  const [expenses, setExpenses] = useState([]);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);

  // --- 2. FORM ENTRY STATE ---
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customShop, setCustomShop] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [note, setNote] = useState("");

  const [showNewShopInput, setShowNewShopInput] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // --- 3. FILTER / SEARCH STATS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShop, setFilterShop] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- 4. TOAST AND CUSTOM CONFIRM ---
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // --- 5. LIFECYCLE & INITIAL SEEDING ---
  useEffect(() => {
    // A. Seed Shops
    const savedShops = localStorage.getItem("billmate_expense_shops");
    if (!savedShops) {
      const defaultShops = ["Main Supermarket", "SDL Grocery Outlet", "SDL Electronics", "City Food Court"];
      localStorage.setItem("billmate_expense_shops", JSON.stringify(defaultShops));
      setShops(defaultShops);
    } else {
      setShops(JSON.parse(savedShops));
    }

    // B. Seed Categories
    const savedCategories = localStorage.getItem("billmate_expense_categories");
    if (!savedCategories) {
      const defaultCategories = ["Rent", "Electricity", "Supplies", "Salaries", "Transport", "Marketing", "Maintenance", "Internet / Phone", "Miscellaneous"];
      localStorage.setItem("billmate_expense_categories", JSON.stringify(defaultCategories));
      setCategories(defaultCategories);
    } else {
      setCategories(JSON.parse(savedCategories));
    }

    // C. Seed Expenses
    const savedExpenses = localStorage.getItem("billmate_expenses");
    if (!savedExpenses || JSON.parse(savedExpenses).length === 0) {
      const defaultExpenses = [
        {
          id: "EXP-202606-1001",
          date: "2026-06-11",
          time: "10:30",
          shop: "Main Supermarket",
          category: "Rent",
          amount: 45000.0,
          note: "Monthly building lease payment for main block"
        },
        {
          id: "EXP-202606-1002",
          date: "2026-06-10",
          time: "14:15",
          shop: "Main Supermarket",
          category: "Electricity",
          amount: 8420.0,
          note: "May electricity invoice - online trans ref #983274"
        },
        {
          id: "EXP-202606-1003",
          date: "2026-06-08",
          time: "11:00",
          shop: "SDL Electronics",
          category: "Supplies",
          amount: 12500.0,
          note: "UPS replacement batteries for billing setups"
        },
        {
          id: "EXP-202606-1004",
          date: "2026-06-05",
          time: "18:00",
          shop: "Main Supermarket",
          category: "Salaries",
          amount: 25000.0,
          note: "Part-time cashier stipend (May cycle)"
        },
        {
          id: "EXP-202606-1005",
          date: "2026-06-01",
          time: "09:30",
          shop: "City Food Court",
          category: "Marketing",
          amount: 3500.0,
          note: "Flyers and local promotional pamphlet prints"
        }
      ];
      localStorage.setItem("billmate_expenses", JSON.stringify(defaultExpenses));
      setExpenses(defaultExpenses);
    } else {
      setExpenses(JSON.parse(savedExpenses));
    }

    // D. Default form fields to current date/time
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const formattedTime = today.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
    setDate(formattedDate);
    setTime(formattedTime);
  }, []);

  // Sync expenses list to storage
  const saveExpensesToStorage = (updated) => {
    setExpenses(updated);
    localStorage.setItem("billmate_expenses", JSON.stringify(updated));
  };

  // --- 6. ADD ACTIONS ---
  const handleAddNewShop = (e) => {
    e.preventDefault();
    const cleaned = customShop.trim();
    if (!cleaned) {
      showToast("Please enter a valid shop name.", "warning");
      return;
    }
    if (shops.some(s => s.toLowerCase() === cleaned.toLowerCase())) {
      showToast("This shop already exists in records.", "warning");
      setSelectedShop(cleaned);
      setShowNewShopInput(false);
      setCustomShop("");
      return;
    }
    const updated = [...shops, cleaned];
    setShops(updated);
    localStorage.setItem("billmate_expense_shops", JSON.stringify(updated));
    setSelectedShop(cleaned);
    setShowNewShopInput(false);
    setCustomShop("");
    showToast(`New shop "${cleaned}" registered successfully!`, "success");
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    const cleaned = customCategory.trim();
    if (!cleaned) {
      showToast("Please enter a valid category name.", "warning");
      return;
    }
    if (categories.some(c => c.toLowerCase() === cleaned.toLowerCase())) {
      showToast("This category already exists.", "warning");
      setSelectedCategory(cleaned);
      setShowNewCategoryInput(false);
      setCustomCategory("");
      return;
    }
    const updated = [...categories, cleaned];
    setCategories(updated);
    localStorage.setItem("billmate_expense_categories", JSON.stringify(updated));
    setSelectedCategory(cleaned);
    setShowNewCategoryInput(false);
    setCustomCategory("");
    showToast(`Category "${cleaned}" added to selection list!`, "success");
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      showToast("Please enter a valid amount greater than ₹0.", "warning");
      return;
    }
    if (!selectedShop) {
      showToast("Please select or add a Shop Name.", "warning");
      return;
    }
    if (!selectedCategory) {
      showToast("Please select or add an Expense Category.", "warning");
      return;
    }

    const randId = `EXP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newExpense = {
      id: randId,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "12:00",
      shop: selectedShop,
      category: selectedCategory,
      amount: numAmount,
      note: note.trim()
    };

    const updated = [newExpense, ...expenses];
    saveExpensesToStorage(updated);

    // Reset Form Fields (keep defaults for ease-of-use)
    setAmount("");
    setNote("");
    showToast("Expense logged successfully!", "success");
  };

  const handleDeleteExpense = (id) => {
    const updated = expenses.filter(exp => exp.id !== id);
    saveExpensesToStorage(updated);
    setConfirmDeleteId(null);
    showToast("Expense entry deleted.", "info");
  };

  // --- 7. FILTERING LOGIC ---
  const filtered = expenses.filter(exp => {
    // Search keyword match (Note, Category, Shop, or Amount)
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      exp.shop.toLowerCase().includes(query) ||
      exp.category.toLowerCase().includes(query) ||
      exp.note.toLowerCase().includes(query) ||
      exp.amount.toString().includes(query) ||
      exp.id.toLowerCase().includes(query);

    // Shop selection filter
    const matchesShop = filterShop === "All" || exp.shop === filterShop;

    // Category selection filter
    const matchesCategory = filterCategory === "All" || exp.category === filterCategory;

    // Date range filters
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && exp.date >= dateFrom;
    }
    if (dateTo) {
      matchesDate = matchesDate && exp.date <= dateTo;
    }

    return matchesSearch && matchesShop && matchesCategory && matchesDate;
  });

  // --- 8. STATS / ANALYTICAL INSIGHTS ---
  const totalSumFiltered = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalCountFiltered = filtered.length;
  const averageValue = totalCountFiltered > 0 ? (totalSumFiltered / totalCountFiltered) : 0;

  // Find most frequent category
  const categoryFreq = filtered.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  let mostExpensiveCategory = "-";
  let topCatAmt = 0;
  Object.keys(categoryFreq).forEach(cat => {
    if (categoryFreq[cat] > topCatAmt) {
      topCatAmt = categoryFreq[cat];
      mostExpensiveCategory = cat;
    }
  });

  // --- 9. EXPORT LOGIC (CSV) ---
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast("No data matches current filters to export.", "warning");
      return;
    }
    let csv = "Expense ID,Date,Time,Shop,Category,Amount (INR),Note\n";
    filtered.forEach(e => {
      const escapedNote = (e.note || "").replace(/"/g, '""');
      csv += `${e.id},${e.date},${e.time},"${e.shop}","${e.category}",${e.amount},"${escapedNote}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Store_Expenses_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV expense report downloaded!", "success");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase font-mono">
            Expense Tracker
          </h1>
          <p className="text-xs font-bold text-slate-400">
            Record and manage business expenses with category and shop classification
          </p>
        </div>

        <div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-extrabold bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-100 px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer border-0"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. Analytical KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-pos-card border border-pos-border p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Logged (INR)</span>
            <span className="text-xl font-black text-slate-800 font-mono">₹{totalSumFiltered.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-brand-primary border border-teal-100">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-pos-card border border-pos-border p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Cost</span>
            <span className="text-xl font-black text-slate-800 font-mono">₹{averageValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-pos-card border border-pos-border p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Top Expense Category</span>
            <span className="text-sm font-black text-slate-800 truncate block max-w-[150px]">{mostExpensiveCategory}</span>
            <span className="text-[10px] font-bold text-rose-500 font-mono">₹{topCatAmt.toLocaleString("en-IN")}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-brand-danger border border-rose-100">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-pos-card border border-pos-border p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Filtered Entries Count</span>
            <span className="text-xl font-black text-slate-800 font-mono">{totalCountFiltered}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-brand-warning border border-amber-100">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* 3. Main Split Panel Grid - Left Log Entry, Right Logs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Register New Expense Form (Colspan: 4) */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-pos-card border border-pos-border rounded-2xl shadow-xs p-6 space-y-5">
            <div className="border-b border-pos-border/60 pb-3 flex items-center gap-2">
              <PlusCircle size={18} className="text-brand-primary" />
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase">Log New Expense</h2>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              
              {/* DATE */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={12} className="text-brand-primary" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* TIME */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={12} className="text-brand-primary" />
                  <span>Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* AMOUNT */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <DollarSign size={12} className="text-brand-primary" />
                  <span>Amount (₹)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary font-mono placeholder:font-sans placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>

              {/* SHOP NAME */}
              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 size={12} className="text-brand-primary" />
                    <span>Shop Name</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowNewShopInput(!showNewShopInput); setShowNewCategoryInput(false); }}
                    className="text-[10px] text-brand-primary font-extrabold hover:underline border-0 bg-transparent cursor-pointer p-0"
                  >
                    {showNewShopInput ? "Select Existing" : "+ Create New"}
                  </button>
                </div>

                {!showNewShopInput ? (
                  <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="">-- Choose Shop --</option>
                    {shops.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new shop name"
                      value={customShop}
                      onChange={(e) => setCustomShop(e.target.value)}
                      className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-brand-primary/40 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewShop}
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs px-3.5 rounded-xl font-bold border-0 cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* CATEGORY */}
              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Bookmark size={12} className="text-brand-primary" />
                    <span>Expense Category</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowNewCategoryInput(!showNewCategoryInput); setShowNewShopInput(false); }}
                    className="text-[10px] text-brand-primary font-extrabold hover:underline border-0 bg-transparent cursor-pointer p-0"
                  >
                    {showNewCategoryInput ? "Select Existing" : "+ Create New"}
                  </button>
                </div>

                {!showNewCategoryInput ? (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Salaries, Electricity"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-brand-primary/40 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs px-3.5 rounded-xl font-bold border-0 cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* NOTE (OPTIONAL) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Optional Note (Remarks)
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe details... (supplier name, online txn ID, etc.)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary placeholder:text-slate-400"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 mt-2 transition-all shadow-md shadow-emerald-500/10 cursor-pointer border-0 uppercase tracking-wider"
              >
                <Plus size={14} />
                Save Expense Record
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Filters and Recent Expenses Table List (Colspan: 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters Panel Container */}
          <div className="bg-pos-card border border-pos-border p-5 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Realtime Search Query */}
            <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Search size={11} className="text-brand-primary" />
                <span>Search Notes/IDs</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type note, shop, ID..."
                className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Date From */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={11} className="text-brand-primary" />
                <span>Since</span>
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={11} className="text-brand-primary" />
                <span>Until</span>
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Shop filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Filter size={11} className="text-brand-primary" />
                <span>Shop Group</span>
              </label>
              <select
                value={filterShop}
                onChange={(e) => setFilterShop(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
              >
                <option value="All">All Shops</option>
                {shops.map((sh, idx) => (
                  <option key={idx} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Clear filters link */}
          {(searchTerm || dateFrom || dateTo || filterShop !== "All") && (
            <div className="flex justify-end pr-1">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFrom("");
                  setDateTo("");
                  setFilterShop("All");
                }}
                className="text-xs text-slate-400 hover:text-brand-danger font-extrabold flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Table Panel Container */}
          <div className="bg-pos-card border border-pos-border rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-pos-border/60 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Recent Expense Logs ({filtered.length})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-pos-border text-slate-400 uppercase text-[10px] tracking-widest font-extrabold bg-slate-50/30">
                    <th className="p-4 text-left">Date / Time</th>
                    <th className="p-4 text-left">Shop</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-left">Note</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold text-xs">
                        No expenses found matching the selected filters. Log a new expense to get started.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors text-xs text-slate-700">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 font-mono">{exp.date}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{exp.time}</div>
                          <div className="text-[9px] text-slate-300 font-mono mt-0.5 uppercase">{exp.id}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{exp.shop}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-800 font-mono">
                          ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-slate-500 max-w-[200px] break-words leading-relaxed font-medium">
                          {exp.note || <span className="italic text-slate-300 font-normal">No remarks</span>}
                        </td>
                        <td className="p-4 text-center">
                          {confirmDeleteId === exp.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="bg-brand-danger hover:bg-rose-600 text-white border-0 py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 py-1 px-2.5 rounded font-bold text-[10px] cursor-pointer"
                              >
                                Stop
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(exp.id)}
                              title="Delete Expense Entry"
                              className="text-slate-400 hover:text-brand-danger p-2 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Footer on Filtered Amount */}
            <div className="bg-slate-50/50 p-4 border-t border-pos-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-600 gap-2">
              <span>Showing {filtered.length} of {expenses.length} expense transactions</span>
              <span className="text-sm font-black text-slate-800">
                Filtered Total: <span className="font-mono text-brand-primary">₹{totalSumFiltered.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* --- 4. TOAST ALERTS --- */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 border border-pos-border rounded-xl bg-slate-900 text-slate-100 shadow-xl transition-all animate-fader text-xs leading-relaxed max-w-sm">
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="text-brand-success shrink-0" />
          ) : toast.type === "warning" ? (
            <AlertTriangle size={16} className="text-brand-warning shrink-0" />
          ) : (
            <DollarSign size={16} className="text-teal-400 shrink-0" />
          )}
          <span className="font-bold flex-1">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
