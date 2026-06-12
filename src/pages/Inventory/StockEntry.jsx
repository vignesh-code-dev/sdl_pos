import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Barcode,
  Keyboard,
  FileText,
  DollarSign,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";

const StockEntry = () => {
  // பார்ம் ஸ்டேட்ஸ் (Form States)
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [supplierNote, setSupplierNote] = useState("");
  const [entryMode, setEntryMode] = useState("manual"); // manual அல்லது barcode
  const [barcodeInput, setBarcodeInput] = useState("");

  // சமீபத்திய என்ட்ரிகள் ஸ்டேட் (Recent Entries State)
  const [recentEntries, setRecentEntries] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // லோக்கல் ஸ்டோரேஜில் இருந்து தயாரிப்புகள் மற்றும் முந்தைய என்ட்ரிகளை எடுத்தல்
    const savedProducts = localStorage.getItem("billmate_products");
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedEntries = localStorage.getItem("billmate_stock_entries");
    if (savedEntries) {
      setRecentEntries(JSON.parse(savedEntries));
    }
  }, []);

  // பார்ம் சப்மிட் செய்யும் லாஜிக்
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || !quantity || !purchasePrice) {
      alert("தயவுசெய்து தேவையான அனைத்து விவரங்களையும் நிரப்பவும்!");
      return;
    }

    // தற்போதைய தயாரிப்பைக் கண்டறிதல்
    const updatedProducts = products.map((prod) => {
      if (prod.sku === selectedProductId || prod.id === selectedProductId) {
        const currentStock = Number(prod.currentStock || 0) + Number(quantity);
        return {
          ...prod,
          currentStock: currentStock,
          costPrice: Number(purchasePrice), // புதிய வாங்குதல் விலை அப்டேட்
          sellingPrice: sellingPrice ? Number(sellingPrice) : prod.sellingPrice, //விருப்பப்பட்டால் விற்பனை விலை அப்டேட்
        };
      }
      return prod;
    });

    // தயாரிப்பு பெயர் அறிதல் (என்ட்ரி பேனலுக்காக)
    const currentProd = products.find(
      (p) => p.sku === selectedProductId || p.id === selectedProductId,
    );

    const formatDateIntl = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      // 'en-GB' லோக்கல் தானாகவே DD/MM/YYYY வடிவம் தரும், அதை நாம் '-' ஆக மாற்றுகிறோம்
      return new Intl.DateTimeFormat("en-GB").format(date).replace(/\//g, "-");
    };

    // புதிய என்ட்ரி டேட்டா உருவாக்குதல் (SKU மற்றும் Notes பிழைகள் இங்கே சரி செய்யப்பட்டுள்ளன)
    const newEntry = {
      id: Date.now(),
      name: currentProd ? currentProd.name : "Unknown Product",
      sku: currentProd ? currentProd.sku : selectedProductId, // SKU வை நேரடியாக இணைத்தல்
      qty: Number(quantity),
      unit: unit,
      buyPrice: Number(purchasePrice),
      entryBy: "Admin", // தற்போதைய பயனர்
      notes: supplierNote, // சப்ளையர் குறிப்பை 'notes' என்ற பெயரில் சேமித்தல்
      date: formatDateIntl(new Date().toISOString()), // சரியான தேதி வடிவமைப்பு
    };

    const finalEntries = [newEntry, ...recentEntries];

    // லோக்கல் ஸ்டோரேஜில் சேமித்தல் (முழு வரலாறும் சேமிப்பில் இருக்கும்)
    localStorage.setItem("billmate_products", JSON.stringify(updatedProducts));
    localStorage.setItem(
      "billmate_stock_entries",
      JSON.stringify(finalEntries),
    );

    // ஸ்டேட்களை புதுப்பித்தல்
    setProducts(updatedProducts);
    setRecentEntries(finalEntries);
    setSuccessMessage("Stock replenished successfully!");

    // பார்மை ரீசெட் செய்தல்
    setSelectedProductId("");
    setQuantity("");
    setPurchasePrice("");
    setSellingPrice("");
    setSupplierNote("");
    setBarcodeInput("");

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // பார்கோடு ஸ்கேன் செய்யும் போலி செயல்பாடு (Simulated Barcode Scan)
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const foundProduct = products.find((p) => p.sku === barcodeInput);
    if (foundProduct) {
      setSelectedProductId(foundProduct.sku);
      setPurchasePrice(foundProduct.costPrice || "");
      alert(`Product Found: ${foundProduct.name}`);
    } else {
      alert("தயாரிப்பு பார்கோடுடன் பொருந்தவில்லை!");
    }
  };

  return (
    <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 bg-pos-bg text-slate-900 font-sans min-h-[calc(100vh-70px)]">
      {/* இடது மற்றும் நடுப்பகுதி: STOCK ENTRY FORM */}
      <div className="lg:col-span-2 bg-white border border-pos-border rounded p-5 shadow-xs flex flex-col justify-between">
        <div>
          {/* தலைப்பு */}
          <div className="flex items-center justify-between border-b border-pos-border pb-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-primary flex items-center gap-2">
                <PlusCircle size={20} className="text-brand-primary" /> Stock
                Entry (Restocking)
              </h2>
              <p className="text-xs text-text-secondary font-medium">
                Add new stock via manual entry or barcode scan
              </p>
            </div>

            {/* என்ட்ரி மோடு சுவிட்ச் */}
            <div className="flex border border-pos-border rounded overflow-hidden p-0.5 bg-slate-50">
              <button
                onClick={() => setEntryMode("manual")}
                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${entryMode === "manual" ? "bg-white text-brand-primary shadow-xs" : "text-slate-500"}`}
              >
                <Keyboard size={13} /> Manual
              </button>
              <button
                onClick={() => setEntryMode("barcode")}
                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${entryMode === "barcode" ? "bg-white text-brand-primary shadow-xs" : "text-slate-500"}`}
              >
                <Barcode size={13} /> Barcode
              </button>
            </div>
          </div>

          {/* பார்கோடு ஸ்கேனர் உள்ளீடு */}
          {entryMode === "barcode" && (
            <form
              onSubmit={handleBarcodeSubmit}
              className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded flex gap-2"
            >
              <input
                type="text"
                placeholder="Scan or Type Barcode (SKU) & Press Enter..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="flex-1 text-sm bg-white border border-pos-border rounded px-3 py-2 font-mono focus:outline-none focus:border-brand-primary"
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold text-xs px-4 rounded hover:bg-blue-700 cursor-pointer transition-all flex items-center gap-1"
              >
                Find
              </button>
            </form>
          )}

          {/* வெற்றி அறிவிப்பு */}
          {successMessage && (
            <div className="mb-4 bg-emerald-50 text-emerald-700 p-2.5 rounded text-xs font-bold flex items-center gap-2 border border-emerald-100 animate-pulse">
              <CheckCircle2 size={16} /> {successMessage}
            </div>
          )}

          {/* முதன்மைப் படிவம் (Main Form) */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Select Product */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">
                Select Product <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(
                    (prod) =>
                      prod.sku === e.target.value || prod.id === e.target.value,
                  );
                  if (p) setPurchasePrice(p.costPrice || "");
                }}
                className="w-full text-xs bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-slate-700 focus:outline-none focus:border-brand-primary"
                required
              >
                <option value="">-- Choose a Product --</option>
                {products.map((p) => (
                  <option key={p.sku || p.id} value={p.sku || p.id}>
                    {p.name} (SKU: {p.sku}) — Stock: {p.currentStock || 0}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity to Add */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">
                Quantity to Add <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Layers size={14} className="absolute left-3 text-slate-400" />
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-9 pr-3 py-2.5 font-mono font-bold focus:outline-none focus:border-brand-primary"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* QTY Entered As (Units) */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">
                QTY Entered As <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-slate-600 focus:outline-none focus:border-brand-primary"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="box">Boxes (box)</option>
                <option value="liters">Liters (l)</option>
              </select>
            </div>

            {/* New Purchase Price */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">
                New Purchase Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-8 pr-3 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Update Selling Price */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">
                Update Selling Price (₹){" "}
                <span className="text-slate-400">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder=" "
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-8 pr-3 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                  step="0.01"
                />
              </div>
            </div>

            {/* Supplier Note */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">
                Supplier Note{" "}
                <span className="text-text-tertiary">(Optional)</span>
              </label>
              <div className="relative">
                <FileText
                  size={14}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <textarea
                  placeholder="Add supplier invoice numbers or remarks..."
                  value={supplierNote}
                  onChange={(e) => setSupplierNote(e.target.value)}
                  className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-9 pr-3 py-2 h-20 focus:outline-none focus:border-brand-primary resize-none font-medium"
                />
              </div>
            </div>

            {/* சப்மிட் பட்டன் */}
            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                className="w-full bg-slate-600 text-white font-bold uppercase tracking-wider text-xs py-3 rounded shadow-xs hover:bg-brand-primary transition-all active:scale-[0.99] cursor-pointer"
              >
                Update Stock & Pricing
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* வலது பகுதி: RECENT STOCK ENTRIES PANEL */}
      <div className="bg-white border border-pos-border rounded p-4 shadow-xs flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 border-b border-pos-border pb-3 mb-3 shrink-0">
          <Clock size={16} className="text-brand-primary" />
          <h3 className="text-sm font-black text-brand-primary uppercase tracking-tight">
            Recent Stock Entries
          </h3>
        </div>

        {/* ஸ்க்ரோலபிள் என்ட்ரி லிஸ்ட் */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {recentEntries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 italic">
              No recent entries found.
            </p>
          ) : (
            recentEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="border border-pos-border rounded p-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 line-clamp-1">
                      {entry.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      By:{" "}
                      <span className="text-slate-600 font-bold">
                        {entry.entryBy}
                      </span>{" "}
                      • {entry.date}
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-mono font-black text-[12px] px-2 py-0.5 rounded shrink-0">
                    +{entry.qty} {entry.unit}
                  </span>
                </div>
                {/* Supplier Note Right Panel-இல் காட்டுவதற்கு */}
                {(entry.notes || entry.supplierNote) && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded p-1.5 mt-2 italic line-clamp-1">
                    Note: {entry.notes || entry.supplierNote}
                  </p>
                )}
                <div className="mt-2 pt-2 border-t border-dashed border-pos-border flex justify-between items-center text-[12px]">
                  <span className="text-slate-400 font-medium">
                    Cost per unit:
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    ₹{entry.buyPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StockEntry;
