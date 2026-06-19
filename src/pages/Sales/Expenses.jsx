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

  // Modal visibility state
  const [showAddModal, setShowAddModal] = useState(false);

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
          id: "EXP-2506-1001",
          date: "2026-06-11",
          time: "10:30",
          shop: "Main Supermarket",
          category: "Rent",
          amount: 45000.0,
          note: "Monthly building lease payment for main block"
        },
        {
          id: "EXP-2506-1002",
          date: "2026-06-10",
          time: "14:15",
          shop: "Main Supermarket",
          category: "Electricity",
          amount: 8420.0,
          note: "May electricity invoice - online trans ref #983274"
        },
        {
          id: "EXP-2506-1003",
          date: "2026-06-08",
          time: "11:00",
          shop: "SDL Electronics",
          category: "Supplies",
          amount: 12500.0,
          note: "UPS replacement batteries for billing setups"
        },
        {
          id: "EXP-2506-1004",
          date: "2026-06-05",
          time: "18:00",
          shop: "Main Supermarket",
          category: "Salaries",
          amount: 25000.0,
          note: "Part-time cashier stipend (May cycle)"
        },
        {
          id: "EXP-2506-1005",
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
    resetFormFields();
  }, []);

  const resetFormFields = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const formattedTime = today.toTimeString().split(" ")[0].slice(0, 5); // HH:MM
    setDate(formattedDate);
    setTime(formattedTime);
    setAmount("");
    setSelectedShop("");
    setSelectedCategory("");
    setNote("");
    setShowNewShopInput(false);
    setShowNewCategoryInput(false);
    setCustomShop("");
    setCustomCategory("");
  };

  const handleOpenAddExpenseModal = () => {
    resetFormFields();
    setShowAddModal(true);
  };

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

    const randId = `EXP-${new Date().getFullYear().toString().substring(2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
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

    showToast("Expense logged successfully!", "success");
    setShowAddModal(false);
    resetFormFields();
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
    <div className="p-6 space-y-6 bg-pos-bg overflow-x-hidden min-h-screen text-slate-800 font-sans">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-pos-card border border-pos-border p-5 rounded shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-primary">
            Expense Tracker
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Record and manage business expenses with category and shop classification
          </p>
        </div>
        

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
             className="flex items-center gap-1.5 text-sm font-semibold bg-white border border-brand-primary hover:bg-brand-primary/5 text-brand-primary px-4 py-2.5 rounded transition-all cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
          
          <button
            onClick={handleOpenAddExpenseModal}
            className="flex items-center gap-1.5 text-sm font-semibold bg-brand-primary hover:bg-[#008967] text-white px-4 py-2.5 rounded transition-all shadow-sm cursor-pointer border-0"
          >
            <Plus size={14} />
            Log New Expense
          </button>
        </div>
      </div>

      {/* 2. Analytical KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
             <span className="text-xs py-1 text-slate-500 uppercase tracking-widest block font-bold select-none">Total Logged (INR)</span>
            <span className="text-3xl font-semibold text-slate-800 font-mono">₹{totalSumFiltered.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-brand-primary border border-teal-100 font-semibold text-sm">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
             <span className="text-xs uppercase text-slate-500 tracking-widest block font-bold select-none">Average Cost</span>
            <span className="text-3xl font-semibold text-slate-800 font-mono">₹{averageValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 font-semibold text-sm">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs  uppercase text-slate-500 tracking-widest block font-bold select-none">Top Category</span>
            <span className="text-2xl font-bold text-emerald-700 tracking-widest">{mostExpensiveCategory}: ₹{topCatAmt.toLocaleString("en-IN")}</span>
        
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-brand-danger border border-rose-100 font-semibold text-sm">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs flex items-center justify-between">
          <div className="space-y-2">
             <span className="text-xs text-slate-500  uppercase tracking-widest block font-bold select-none">Filtered Count</span>
            <span className="text-3xl font-bold text-slate-800 font-mono">{totalCountFiltered}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-brand-warning border border-amber-100 font-semibold text-sm">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* 3. Main Full-Width Single Column Layout */}
      <div className="space-y-6">
        
        {/* A. Search and Filters Panel */}
        <div className="bg-pos-card border border-pos-border p-5 rounded shadow-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            
            {/* Realtime Search Query */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
                <Search size={11.5} className="text-brand-primary" />
                <span>Search Notes/IDs</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type note, shop, ID..."
                className="w-full text-sm font-semibold text-slate-800 bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium height-[42px]"
              />
            </div>

            {/* Date From (Since) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
                <Calendar size={11.5} className="text-brand-primary" />
                <span>Since</span>
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full text-sm font-semibold text-[#475569] bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Date To (Until) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
                <Calendar size={11.5} className="text-brand-primary" />
                <span>Until</span>
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full text-sm font-semibold text-[#475569] bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Category selection filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
                <Filter size={11.5} className="text-brand-primary" />
                <span>Category</span>
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full text-sm font-bold text-[#475569] bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all cursor-pointer "
              >
                <option value="All">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Shop selection filter */}
            <div className="space-y-1.5">
              <label className="text-xs  font-bold text-slate-500 uppercase tracking-wide uppercase tracking-wider py-1 flex items-center gap-1.5 select-none">
                <Filter size={11.5} className="text-brand-primary" />
                <span>Shop Group</span>
              </label>
              <select
                value={filterShop}
                onChange={(e) => setFilterShop(e.target.value)}
                className="w-full text-sm font-bold text-[#475569] bg-[#f8fafc] border border-pos-border rounded px-3.5 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Shops</option>
                {shops.map((sh, idx) => (
                  <option key={idx} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Quick Clear filters panel */}
        {(searchTerm || dateFrom || dateTo || filterShop !== "All" || filterCategory !== "All") && (
          <div className="flex justify-end pr-1 -mt-4 animate-in fade-in duration-200">
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFrom("");
                setDateTo("");
                setFilterShop("All");
                setFilterCategory("All");
              }}
              className="text-xs text-slate-400 hover:text-brand-danger font-extrabold flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
            >
              Clear Active Filters
            </button>
          </div>
        )}

        {/* B. Entry Records Table Panel */}
        <div className="bg-pos-card border border-pos-border rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                 <tr className="border-b border-pos-border text-white uppercase text-xs font-semibold tracking-wider bg-emerald-600">
                  <th className="p-4 text-center text-xs font-semibold uppercase">Expense ID</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Date</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Time</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Shop</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Category</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Amount</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase">Note</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border/50 text-sm font-medium text-text-secondary">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-20 text-center text-slate-400 font-semibold text-xs">
                      No expenses found matching the selected filters. Log a new expense to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((exp) => (
                     <tr key={exp.id} className="hover:bg-slate-50/40 transition-colors text-sm font-medium text-text-secondary">
                      {/* ID Column */}
                      <td className="p-4 text-slate-800 text-center text-sm font-semibold font-mono">{exp.id}</td>
                      
                      {/* Date Column */}
                      <td className="p-4 text-slate-750 text-center text-sm font-medium">{exp.date}</td>
                      
                      {/* Time Column */}
                      <td className="p-4 text-slate-750 text-center text-sm font-medium">{exp.time}</td>
                      
                      {/* Shop Column */}
                      <td className="p-4 text-slate-800 text-center text-sm font-semibold">{exp.shop}</td>
                      
                      {/* Category Column */}
                      <td className="p-4 text-center">
                        <span className="hover:bg-emerald-50 text-brand-primary px-2.5 py-1 text-xs font-bold tracking-wide uppercase select-none transition-colors">
                          {exp.category}
                        </span>
                      </td>
                      
                      {/* Amount Column */}
                      <td className="p-4 text-center font-bold text-slate-800 font-mono text-sm font-semibold">
                        ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      
                      {/* Note Column */}
                      <td className="p-4 text-text-secondary max-w-[215px] break-words text-justify text-sm font-medium leading-relaxed">
                        {exp.note || <span className="text-text-muted select-none">No remarks</span>}
                      </td>
                      
                      {/* Actions Column */}
                      <td className="p-4 text-center">
                        {confirmDeleteId === exp.id ? (
                          <div className="flex items-center justify-center gap-1.5">
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
                            className="p-2 text-slate-400 hover:text-brand-danger hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center mx-auto"
                          >
                            <Trash2 size={14.5} strokeWidth={2.5} />
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
          <div className="bg-slate-50/50 p-4 border-t border-pos-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-600 gap-2 select-none">
            <span>Showing {filtered.length} of {expenses.length} expense transactions</span>
          </div>
        </div>
      </div>

      {/* --- 4. SECURE MODAL POPUP FOR LOGGING NEW EXPENSES --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 text-slate-800 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg  shadow-xl w-full max-w-lg border border-pos-border overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-[#F8FBFC] border-b border-pos-border px-6 py-4.5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-8.5 h-8.5 bg-brand-primary/10 rounded flex items-center justify-center text-brand-primary">
                  <PlusCircle size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 uppercase tracking-wider">
                    Log New Expense
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Business Ledger Entry</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-600 hover:text-slate-655 hover:bg-slate-100 transition-colors cursor-pointer border-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              
              {/* Row 1: Date & Time as 2 Columns split */}
              <div className="grid grid-cols-2 gap-4">
                {/* DATE */}
                <div className="space-y-2">
                  <label className="text-[12px] px-1 font-bold text-slate-500 uppercase tracking-widest block select-none">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
                  />
                </div>

                {/* TIME */}
                <div className="space-y-1.5">
                  <label className="text-[12px] px-1 font-bold text-slate-400 uppercase tracking-widest block select-none">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-pos-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Amount */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block select-none">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-[14px] font-black text-slate-450">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-[15px] font-bold text-slate-800 bg-slate-50 border border-pos-border rounded pl-8 pr-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-mono placeholder:font-sans placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Row 3: Shop Name Selection */}
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center select-none mb-1">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block">
                    Shop Name *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowNewShopInput(!showNewShopInput); setShowNewCategoryInput(false); }}
                    className="text-[10px] text-brand-primary font-extrabold hover:underline border-0 bg-transparent cursor-pointer p-0"
                  >
                    {showNewShopInput ? "Show dropdown" : "+ Register New Shop"}
                  </button>
                </div>

                {!showNewShopInput ? (
                  <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    required
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-pos-border rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
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
                      className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-brand-primary/40 rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewShop}
                      className="bg-brand-primary hover:bg-[#008967] text-white text-xs px-4 rounded font-bold border-0 cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Row 4: Expense Category Selection */}
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center select-none mb-1">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block">
                    Expense Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowNewCategoryInput(!showNewCategoryInput); setShowNewShopInput(false); }}
                    className="text-[10px] text-brand-primary font-extrabold hover:underline border-0 bg-transparent cursor-pointer p-0"
                  >
                    {showNewCategoryInput ? "Show list" : "+ Create Custom"}
                  </button>
                </div>

                {!showNewCategoryInput ? (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all cursor-pointer"
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
                      className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-brand-primary/40 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="bg-brand-primary hover:bg-[#008967] text-white text-xs px-4 rounded-xl font-bold border-0 cursor-pointer transition-all"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Row 5: Notes/Remarks Textbox */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block select-none">
                  Optional Note / Remarks
                </label>
                <textarea
                  rows="2"
                  placeholder="Describe details... (supplier name, online txn ID, etc.)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-pos-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-primary focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Modal Buttons Footer bar */}
              <div className="flex gap-3 pt-3.5 border-t border-pos-border select-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#f5f5f5] hover:bg-slate-200 border border-[#eee] text-slate-650 rounded-xl text-xs font-black cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-primary hover:bg-[#008a69] text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer border-0 uppercase tracking-wider"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- 5. TOAST ALERTS --- */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-2.5 px-4.5 py-3 border border-pos-border rounded-xl bg-slate-900 text-slate-100 shadow-xl transition-all animate-fader text-xs leading-relaxed max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
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
