import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  XCircle,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const StockAlerts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertFilter, setAlertFilter] = useState("All");

  useEffect(() => {
    const savedProducts = localStorage.getItem("billmate_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const getAlertType = (prod) => {
    const stock = Number(prod.currentStock || 0);
    const min = Number(prod.minStock || 5);

    if (stock < 0)
      return { type: "Force Sale", label: "Negative Stock (Force Sale)" };
    if (stock === 0) return { type: "Out of Stock", label: "Out of Stock" };
    if (stock <= min) return { type: "Low Stock", label: "Low Stock" };
    return { type: "Normal", label: "Normal" };
  };

  const processedProducts = products.map((p) => ({
    ...p,
    alert: getAlertType(p),
  }));

  const alertLogs = processedProducts.filter((prod) => {
    if (prod.alert.type === "Normal") return false;

    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.sku || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      alertFilter === "All" || prod.alert.type === alertFilter;

    return matchesSearch && matchesFilter;
  });

  const lowStockCount = processedProducts.filter(
    (p) => p.alert.type === "Low Stock",
  ).length;
  const outOfStockCount = processedProducts.filter(
    (p) => p.alert.type === "Out of Stock",
  ).length;
  const forceSaleCount = processedProducts.filter(
    (p) => p.alert.type === "Force Sale",
  ).length;

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("BillMate - Stock Alerts Report", 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated Date: ${new Date().toLocaleDateString("en-GB")}`,
        14,
        28,
      );
      doc.text(
        `Active Filter: ${alertFilter === "All" ? "All Warnings" : alertFilter}`,
        14,
        34,
      );

      const tableHeaders = [
        [
          "Product Details",
          "SKU",
          "Alert Condition",
          "Min Threshold",
          "Current Stock",
        ],
      ];

      const tableRows = alertLogs.map((prod) => [
        prod.name,
        prod.sku || "N/A",
        prod.alert.label,
        prod.minStock || 5,
        prod.currentStock,
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: 40,
        theme: "striped",
        headStyles: { fillColor: [30, 41, 59], halign: "center" },
        bodyStyles: { halign: "center" },
        columnStyles: {
          0: { halign: "left" },
        },
      });

      doc.save(`Stock_Alerts_${alertFilter.replace(" ", "_")}.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert(
        "Oops! Something went wrong while generating the PDF. Please try again.",
      );
    }
  };

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900 font-sans">
      {/* HEADER & EXPORT BUTTON */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-500 flex items-center gap-2">
            <AlertTriangle
              className="text-amber-500 animate-bounce"
              size={22}
            />{" "}
            Stock Alerts
          </h2>
        </div>

        {/* PDF Export Button */}
        <button
          onClick={handleExportPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FileSpreadsheet size={14} /> Export Table Data PDF
        </button>
      </div>

      {/* SUMMARY KPIs GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 shrink-0">
        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-base font-bold uppercase tracking-wider text-text-secondary block">
              Out of Stock
            </span>
            <span className="text-4xl font-black text-rose-600 font-mono block mt-0.5">
              {outOfStockCount}
            </span>
          </div>
          <div className="p-2 bg-danger text-white rounded-full">
            <XCircle size={20} />
          </div>
        </div>

        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-base font-bold uppercase tracking-wider text-text-secondary block">
              Low Stock Alerts
            </span>
            <span className="text-4xl font-black text-amber-600 font-mono block mt-0.5">
              {lowStockCount}
            </span>
          </div>
          <div className="p-2 bg-brand-warning text-white rounded-full">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white border border-pos-border rounded p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-base font-bold uppercase tracking-wider text-text-secondary block">
              Force Sales (Negative)
            </span>
            <span className="text-4xl font-black text-purple-600 font-mono block mt-0.5">
              {forceSaleCount}
            </span>
          </div>
          <div className="p-2 bg-purple-600 text-white rounded-full">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white border border-pos-border rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-xs mb-4">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search alert products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-9 pr-4 py-2.5 focus:outline-none focus:ring focus:ring-brand-500/50 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="text-xs bg-pos-bg w-full sm:w-[180px] border border-pos-border rounded px-3 py-2.5 font-bold text-slate-600 focus:outline-none"
          >
            <option value="All">All Health Warnings</option>
            <option value="Low Stock">Low Stock Only</option>
            <option value="Out of Stock">Out of Stock Only</option>
            <option value="Force Sale">Force Sales Only</option>
          </select>
        </div>
      </div>

      {/* ALERTS DATA TABLE */}
      <div className="flex-1 overflow-x-auto overflow-y-auto bg-white border border-pos-border rounded shadow-xs">
        {alertLogs.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <AlertTriangle
              size={40}
              className="mx-auto mb-2 text-emerald-400"
            />
            <p className="font-bold text-sm text-slate-700">
              Excellent! Inventory Health is Stable.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              No products require urgent restocking.
            </p>
          </div>
        ) : (
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead className="bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider border-b border-pos-border">
              <tr>
                <th className="py-3 px-4 text-left pl-6">Product Details</th>
                <th className="py-3 px-4 text-center">SKU</th>
                <th className="py-3 px-4 text-center">Alert Condition</th>
                <th className="py-3 px-4 text-center">Min Stock</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border">
              {alertLogs.map((prod) => {
                let badgeColor = "bg-warning text-white border-amber-100";
                if (prod.alert.type === "Force Sale")
                  badgeColor = "bg-purple-600 text-white border-purple-100";
                if (prod.alert.type === "Out of Stock")
                  badgeColor = "bg-danger text-white border-rose-100";

                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-brand-500/10 transition-colors text-sm font-medium text-text-secondary"
                  >
                    <td className="py-3 px-4 text-left pl-6">{prod.name}</td>
                    <td className="py-3 px-4 font-monotext-center">
                      {prod.sku || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${badgeColor}`}
                      >
                        {prod.alert.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-center">
                      {prod.minStock || 5}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono ${Number(prod.currentStock) <= 0 ? "text-danger" : "text-warning"}`}
                      >
                        {prod.currentStock}
                      </span>
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

export default StockAlerts;
