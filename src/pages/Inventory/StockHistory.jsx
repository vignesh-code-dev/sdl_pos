import React, { useState, useEffect } from "react";
import {
  History,
  Layers,
  FileSpreadsheet,
  UserCheck,
  Search,
  Calendar,
  ArrowUpRight,
  Info,
} from "lucide-react";

const StockHistory = () => {
  const [movementLog, setMovementLog] = useState([]);
  const [products, setProducts] = useState([]); // தயாரிப்புகள் பட்டியல்
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("All");

  useEffect(() => {
    // 1. அனைத்து தயாரிப்புகளையும் எடுத்தல் (SKU Fallback-காக)
    const savedProducts = localStorage.getItem("billmate_products");
    let mappedProducts = [];
    if (savedProducts) {
      mappedProducts = JSON.parse(savedProducts);
      setProducts(mappedProducts);
    }

    // 2. ஸ்டாக் என்ட்ரிகளை எடுத்தல்
    const savedEntries = localStorage.getItem("billmate_stock_entries");
    if (savedEntries) {
      setMovementLog(JSON.parse(savedEntries));
    }
  }, []);

  // --- Summary KPI கணக்கீடுகள் ---
  const totalEntries = movementLog.length;

  // தனித்துவமான தயாரிப்புகளின் எண்ணிக்கை
  const uniqueProductsCount = new Set(
    movementLog.map((item) => item.sku || item.selectedProductId || item.name),
  ).size;

  // மொத்தமாக சேர்க்கப்பட்ட ஸ்டாக்கின் அளவு
  const totalQuantityAdded = movementLog.reduce(
    (acc, item) => acc + Number(item.qty || 0),
    0,
  );

  // --- யுசர் ஃபில்டருக்கான பட்டியல் தயாரிப்பு ---
  const dynamicUsers = [
    "All",
    ...new Set(movementLog.map((item) => item.entryBy)),
  ];

  // --- சர்ச் & ஃபில்டர் லாஜிக் ---
  const filteredLogs = movementLog.filter((log) => {
    // பழைய தரவாக இருந்தால், தயாரிப்புகள் லிஸ்டில் இருந்து அதன் SKU-வை தேடுதல்
    const matchedProduct = products.find(
      (p) =>
        p.name === log.name ||
        p.sku === log.selectedProductId ||
        p.id === log.selectedProductId,
    );
    const currentSku = (
      log.sku ||
      log.selectedProductId ||
      (matchedProduct ? matchedProduct.sku : "") ||
      ""
    ).toLowerCase();
    const currentName = (log.name || "").toLowerCase();

    const matchesSearch =
      currentName.includes(searchQuery.toLowerCase()) ||
      currentSku.includes(searchQuery.toLowerCase());

    const matchesUser = userFilter === "All" || log.entryBy === userFilter;

    return matchesSearch && matchesUser;
  });

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900 font-sans">
      {/* HEADER */}
      <div className="mb-4 shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-brand-500 flex items-center gap-2">
          <History className="text-brand-500" size={22} /> Stock History
        </h2>
      </div>

      {/* SUMMARY KPIs GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 shrink-0">
        {/* Total Entries */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
              Total Entries
            </span>
            <span className="text-4xl font-bold text-slate-800 font-mono block mt-0.5">
              {totalEntries}
            </span>
          </div>
          <div className="p-2 bg-slate-600 rounded-full text-white">
            <FileSpreadsheet size={20} />
          </div>
        </div>

        {/* Unique Products */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
              Unique Products
            </span>
            <span className="text-4xl font-bold text-blue-600 font-mono block mt-0.5">
              {uniqueProductsCount}
            </span>
          </div>
          <div className="p-2 bg-blue-600 rounded-full text-white">
            <Layers size={20} />
          </div>
        </div>

        {/* Total Quantity Added */}
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
              Total Qty Added
            </span>
            <span className="text-4xl font-bold text-emerald-600 font-mono block mt-0.5">
              {totalQuantityAdded}
            </span>
          </div>
          <div className="p-2 bg-brand-500 rounded-full text-white">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white border border-pos-border rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-xs mb-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-pos-bg border border-pos-border rounded pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500/50 font-medium"
          />
        </div>

        {/* User Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <UserCheck size={14} className="text-slate-400 hidden sm:inline" />
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="text-xs bg-pos-bg w-full sm:w-[180px] border border-pos-border rounded px-3 py-2.5 font-bold text-slate-600 focus:outline-none"
          >
            {dynamicUsers.map((user, i) => (
              <option key={i} value={user}>
                {user === "All" ? "All Handled Users" : `User: ${user}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="flex-1 overflow-x-auto overflow-y-auto bg-white border border-pos-border rounded shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <History size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">
              No stock movement records found.
            </p>
          </div>
        ) : (
          <table className="w-full text-center border-collapse min-w-[1000px]">
            <thead className="bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider border-b border-pos-border">
              <tr>
                <th className="py-3 px-4 text-left pl-6">Date & Time</th>
                <th className="py-3 px-4 text-center">SKU</th>
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-center">Quantity Added</th>
                <th className="py-3 px-4 text-right">Buy Price</th>
                <th className="py-3 px-4 text-center">Entered By</th>
                <th className="py-3 px-4 text-left pr-6">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border">
              {filteredLogs.map((log) => {
                // பழைய என்ட்ரிகளுக்கு தயாரிப்புகள் லிஸ்டில் இருந்து SKU எடுக்கும் மேப்பிங் லாஜிக்
                const targetProduct = products.find(
                  (p) =>
                    p.name === log.name ||
                    p.sku === log.selectedProductId ||
                    p.id === log.selectedProductId,
                );

                const displaySku =
                  log.sku ||
                  (targetProduct ? targetProduct.sku : log.selectedProductId) ||
                  "N/A";
                const displayNotes =
                  log.notes ||
                  log.supplierNote ||
                  (log.remarks ? log.remarks : "");

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-brand-500/10 transition-colors text-sm font-medium text-text-secondary"
                  >
                    {/* Date & Time */}
                    <td className="py-3 px-4 text-left pl-6 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-mono">
                        {log.date}
                      </span>
                    </td>
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono text-center">
                      {displaySku}
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4 text-left">{log.name}</td>

                    {/* Quantity Added */}
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 font-mono font-black px-2.5 py-0.5 rounded text-[12px] border border-emerald-100">
                        +{log.qty}{" "}
                        <span className="text-[10px] font-sans font-normal lowercase">
                          {log.unit}
                        </span>
                      </span>
                    </td>

                    {/* Buy Price */}
                    <td className="py-3 px-4 text-right font-mono">
                      ₹{Number(log.buyPrice || 0).toFixed(2)}
                    </td>

                    {/* Entered By */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-bold">
                        {log.entryBy}
                      </span>
                    </td>

                    {/* Supplier Notes */}
                    <td className="py-3 px-4 text-left pr-6 text-xs text-slate-500 font-medium max-w-[200px] truncate">
                      {displayNotes ? (
                        <span
                          className="flex items-center gap-1"
                          title={displayNotes}
                        >
                          <Info
                            size={12}
                            className="text-text-primary shrink-0"
                          />
                          {displayNotes}
                        </span>
                      ) : (
                        <span className="text-text-secondary italic">
                          No notes
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

export default StockHistory;
