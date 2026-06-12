import React, { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Calendar,
} from "lucide-react";

const StockCount = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // டேட்டாவை லோட் செய்யும் பங்க்ஷன்
  const loadInventoryData = () => {
    setIsRefreshing(true);
    try {
      const savedProducts = localStorage.getItem("billmate_products");
      const parsedProducts = savedProducts ? JSON.parse(savedProducts) : [];

      // புதிய பில்லிங் மற்றும் விற்பனை மெட்ரிக்ஸ்களை சாம்பிள் டேட்டாவாக இணைக்கிறோம்
      // (பின்னாலில் பில் போடும் டேட்டாவுடன் இதை எளிதாக இணைத்துக் கொள்ளலாம்)
      const mappedProducts = parsedProducts.map((p) => {
        const currentStock =
          p.currentStock !== undefined
            ? p.currentStock
            : Math.floor(Math.random() * 100);
        const minStock = p.minStock !== undefined ? p.minStock : 10;

        // 30 நாட்களில் விற்கப்பட்ட அளவு (சாம்பிள்)
        const qtySold30D =
          p.qtySold30D !== undefined
            ? p.qtySold30D
            : Math.floor(Math.random() * 40);

        // Revenue = Qty Sold * Selling Price
        const revenue30D = qtySold30D * (p.sellingPrice || 0);

        // Profit = (Selling Price - Cost Price) * Qty Sold
        const profit30D =
          qtySold30D * ((p.sellingPrice || 0) - (p.costPrice || 0));

        // கடைசியாக விற்கப்பட்ட நாள் (Sample Date format: YYYY-MM-DD)
        const lastSold =
          p.lastSold || (qtySold30D > 0 ? "2026-06-08" : "No Sales");

        return {
          ...p,
          currentStock,
          minStock,
          qtySold30D,
          revenue30D,
          profit30D,
          lastSold,
        };
      });

      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  // --- KPI கணக்கீடுகள் ---
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minStock,
  ).length;
  const outOfStockProducts = products.filter(
    (p) => p.currentStock === 0,
  ).length;
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.currentStock * (p.costPrice || 0),
    0,
  );

  // --- ஃபில்டர் லாஜிக் ---
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.includes(searchQuery);

    let matchesStatus = true;
    if (stockStatusFilter === "Low Stock") {
      matchesStatus = p.currentStock > 0 && p.currentStock <= p.minStock;
    } else if (stockStatusFilter === "Out of Stock") {
      matchesStatus = p.currentStock === 0;
    } else if (stockStatusFilter === "In Stock") {
      matchesStatus = p.currentStock > p.minStock;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-primary">
            Stock Count
          </h2>
        </div>
        <button
          onClick={loadInventoryData}
          disabled={isRefreshing}
          className="p-2 bg-white border border-pos-border rounded text-slate-600 hover:text-brand-primary font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw
            size={14}
            className={`${isRefreshing ? "animate-spin text-brand-primary" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* KPIs GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 shrink-0">
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Total Products
            </span>
            <span className="text-2xl font-black text-text-primary font-mono block mt-0.5">
              {totalProducts}
            </span>
          </div>
          <div className="p-2 bg-blue-600 rounded-full text-white">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Low Stock
            </span>
            <span className="text-2xl font-black text-brand-warning font-mono block mt-0.5">
              {lowStockProducts}
            </span>
          </div>
          <div className="p-2 bg-brand-warning flex items-center justify-center rounded-full text-white">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Out of Stock
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono block mt-0.5">
              {outOfStockProducts}
            </span>
          </div>
          <div className="p-2 bg-brand-danger rounded-full text-white">
            <XCircle size={22} />
          </div>
        </div>

        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary block">
              Total Inventory Value
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono block mt-0.5">
              ₹
              {totalInventoryValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="p-2 bg-brand-primary rounded-full text-white">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-pos-border rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-xs mb-4">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="text-xs bg-pos-bg w-full sm:w-[160px] border border-pos-border rounded px-3 py-2.5 font-bold text-text-secondary focus:outline-none"
          >
            <option value="All">All Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* DETAILED STOCK TABLE */}
      <div className="flex-1 overflow-x-auto overflow-y-auto bg-white border border-pos-border rounded shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <Package size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">No stock records found.</p>
          </div>
        ) : (
          <table className="w-full text-center border-collapse min-w-[1200px]">
            <thead className="bg-brand-primary text-white text-[11px] font-bold uppercase tracking-wider border-b border-pos-border sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-center">SKU</th>
                <th className="py-3 px-4 text-left pl-6">Product Name</th>
                <th className="py-3 px-4 text-center">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-right">Buy Price</th>
                <th className="py-3 px-4 text-right">Inventory Value</th>
                <th className="py-3 px-4 text-right ">30-Day Revenue</th>
                <th className="py-3 px-4 text-right ">30-Day Profit</th>
                <th className="py-3 px-4 text-center">Qty Sold (30D)</th>
                <th className="py-3 px-4 text-center pr-6">Last Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border text-[13px] text-slate-700">
              {filteredProducts.map((p, idx) => {
                const stockValue = p.currentStock * (p.costPrice || 0);

                // Stock Color Coding
                let stockColor = "text-text-primary";
                if (p.currentStock === 0)
                  stockColor = "text-brand-danger font-black";
                else if (p.currentStock <= p.minStock)
                  stockColor = "text-brand-warning font-black";

                return (
                  <tr
                    key={p.sku || idx}
                    className="hover:bg-slate-50/60 transition-colors text-text-secondary text-[14px]"
                  >
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      {p.sku}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4 text-left pl-6 font-bold text-slate-800">
                      {p.name}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block bg-brand-primary text-white font-bold px-2 py-1 rounded-full text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td
                      className={`py-3 px-4 font-mono text-center ${stockColor}`}
                    >
                      {p.currentStock}{" "}
                      <span className="text-[10px] text-text-secondary font-sans font-normal">
                        {p.unit || "pcs"}
                      </span>
                    </td>

                    {/* Buy Price */}
                    <td className="py-3 px-4 text-right font-mono">
                      ₹{(p.costPrice || 0).toFixed(2)}
                    </td>

                    {/* Inventory Value */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      ₹{stockValue.toFixed(2)}
                    </td>

                    {/* 30-Day Revenue */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 bg-blue-50/20">
                      ₹{(p.revenue30D || 0).toFixed(2)}
                    </td>

                    {/* 30-Day Profit */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 bg-emerald-50/20">
                      ₹{(p.profit30D || 0).toFixed(2)}
                    </td>

                    {/* Qty Sold (30D) */}
                    <td className="py-3 px-4 font-mono font-bold text-center text-slate-700">
                      {p.qtySold30D || 0}
                    </td>

                    {/* Last Sold */}
                    <td className="py-3 px-4 text-center pr-6 text-xs text-slate-500 font-medium">
                      {p.lastSold === "No Sales" ? (
                        <span className="text-slate-400 italic">No Sales</span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-slate-600 font-mono">
                          <Calendar size={12} className="text-slate-400" />
                          {p.lastSold}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockCount;
