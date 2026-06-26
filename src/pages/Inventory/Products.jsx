import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  LayoutGrid,
  List,
  Download,
  Trash2,
  Edit3,
  Search,
  Tag,
  Barcode,
  Upload,
  Layers,
} from "lucide-react";
import { parseCSV, runExportCSV } from "../../utils/csvHelper.jsx";
import BarcodeModal from "../../components/BarcodeModal";
import { ensureBarcodes, generateEAN13Barcode } from "../../utils/barcodePrinter.jsx";

const Products = () => {
  // Retrieve existing products from localStorage
  const [products, setProducts] = useState(() => {
    try {
      const savedProducts = localStorage.getItem("billmate_products");
      const parsed = savedProducts ? JSON.parse(savedProducts) : [];
      return ensureBarcodes(parsed);
    } catch (error) {
      console.error("Error parsing products from localStorage:", error);
      localStorage.removeItem("billmate_products");
      return [];
    }
  });

  // States
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingOldSku, setEditingOldSku] = useState("");

  // Barcode Print states
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState(null);

  // Hidden file input ref for CSV import
  const csvInputRef = useRef(null);

  // Form state (discount and tax included)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "", // Barcode field
    category: "Groceries",
    costPrice: "",
    sellingPrice: "",
    margin: "0",
    discount: "0",
    tax: "0", // ➡️ New tax (Tax %) field
    unit: "pcs",
    image: "",
    currentStock: "0",
    minStock: "0",
  });

  // Save to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem("billmate_products", JSON.stringify(products));
  }, [products]);

  // Profit Margin (%) auto-calculate logic
  useEffect(() => {
    const cost = parseFloat(formData.costPrice) || 0;
    const sell = parseFloat(formData.sellingPrice) || 0;

    if (sell > 0 && sell >= cost) {
      const profit = sell - cost;
      const marginPercent = ((profit / sell) * 100).toFixed(1);
      setFormData((prev) => ({ ...prev, margin: marginPercent }));
    } else {
      setFormData((prev) => ({ ...prev, margin: "0" }));
    }
  }, [formData.costPrice, formData.sellingPrice]);

  // Sync real-time stock deductions and cancellations instantly
  useEffect(() => {
    const handleStockUpdate = () => {
      const savedProducts = localStorage.getItem("billmate_products");
      if (savedProducts) {
        setProducts(ensureBarcodes(JSON.parse(savedProducts)));
      }
    };
    window.addEventListener("billmate_stock_update", handleStockUpdate);
    window.addEventListener("storage", handleStockUpdate);
    return () => {
      window.removeEventListener("billmate_stock_update", handleStockUpdate);
      window.removeEventListener("storage", handleStockUpdate);
    };
  }, []);

  // Manage input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload logic (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to open the add product modal
  const openAddModal = () => {
    setModalMode("add");
    setEditingOldSku(""); // Reset old SKU
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      category: "Groceries",
      costPrice: "",
      sellingPrice: "",
      margin: "0",
      discount: "0",
      tax: "0", // ➡️ 0% tax on reset
      unit: "pcs",
      image: "",
      currentStock: "0",
      minStock: "0",
    });
    setShowModal(true);
  };

  // Function to open edit product modal
  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingOldSku(product.sku); // Save old SKU here
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || "",
      category: product.category,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      margin: product.margin.toString(),
      discount: (product.discount !== undefined
        ? product.discount
        : 0
      ).toString(),
      tax: (product.tax !== undefined ? product.tax : 0).toString(), // ➡️ Loads tax when editing
      unit: product.unit,
      image: product.image || "",
      currentStock: (product.currentStock !== undefined ? product.currentStock : 0).toString(),
      minStock: (product.minStock !== undefined ? product.minStock : 0).toString(),
    });
    setShowModal(true);
  };

  // Primary form submission logic
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.sellingPrice) {
      alert("Please fill in all the required details!");
      return;
    }

    const cleanDiscount = Math.min(
      100,
      Math.max(0, parseFloat(formData.discount) || 0),
    );

    let barcodeValue = (formData.barcode || "").trim();

    // Barcode validation & duplication checks
    if (barcodeValue) {
      // Check if another product is already using this barcode
      const isBarcodeTaken = products.some(
        (p) =>
          p.barcode &&
          p.barcode.trim().toLowerCase() === barcodeValue.toLowerCase() &&
          (modalMode === "add" || p.sku !== editingOldSku)
      );
      if (isBarcodeTaken) {
        alert("This barcode value is already assigned to another product!");
        return;
      }
    } else {
      // Automatic generation during creation/update of product if empty!
      barcodeValue = generateEAN13Barcode(products);
    }

    const processedProduct = {
      ...formData,
      barcode: barcodeValue,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      discount: cleanDiscount,
      tax: parseFloat(formData.tax) || 0, // ➡️ Converted to number and saved
      currentStock: parseFloat(formData.currentStock) || 0,
      minStock: parseFloat(formData.minStock) || 0,
    };

    if (modalMode === "add") {
      // Check if SKU is already in use only when adding a new product
      if (products.some((p) => p.sku === formData.sku)) {
        alert("This SKU code is already in use!");
        return;
      }
      setProducts((prev) => [processedProduct, ...prev]);
    } else {
      // When editing, prevent changing the SKU to one that is already taken by another product
      if (
        formData.sku !== editingOldSku &&
        products.some((p) => p.sku === formData.sku)
      ) {
        alert("This SKU is already taken by another product!");
        return;
      }

      // Search by old SKU and update with new details (including new SKU)
      setProducts((prev) =>
        prev.map((p) => (p.sku === editingOldSku ? processedProduct : p)),
      );
    }

    setShowModal(false);
  };

  // Delete product
  const handleDeleteProduct = (sku) => {
    if (window.confirm("Are you sure you want to delete this product from the inventory?")) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    runExportCSV(products);
  };

  // CSV Import
  const handleImportCSVChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const { importedProducts, skippedCount } = parseCSV(text, products);

        if (importedProducts.length > 0) {
          setProducts((prev) => [...importedProducts, ...prev]);
          alert(
            `Successfully imported ${importedProducts.length} unique products!${
              skippedCount > 0 ? ` (Skipped ${skippedCount} duplicate SKU codes)` : ""
            }`
          );
        } else {
          alert("No new unique products found to import.");
        }
      } catch (err) {
        console.error(err);
        alert(err.message || "Error parsing CSV file. Please make sure the format is valid.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Open Barcode printing page modal (single product only)
  const handleBarcodeModalOpen = (product) => {
    if (!product) {
      alert("Please click the barcode icon on a specific product line to print its barcode!");
      return;
    }
    setBarcodeModalProduct(product);
    setShowBarcodeModal(true);
  };

  // Filtering and search
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query));
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    "Groceries",
    "Cosmetics",
    "Beverages",
    "Stationery",
    "Vegetables",
  ];
  const taxRates = [0, 5, 12, 18, 28]; // ➡️ General GST tax rates

  return (
    <div className="p-6 space-y-6 bg-pos-bg overflow-x-hidden min-h-screen text-slate-800">
      {/* CARD 1: PRODUCT LIST TITLE CARD */}
      <div className="bg-pos-card border border-pos-border rounded p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-brand-primary uppercase flex items-center gap-2">
    
            Product List
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Manage your master catalogue of products, SKU codes, pricing, taxes, of your POS inventory.
          </p>
        </div>
        
        {/* Bulk Actions Box */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto shrink-0">
          {/* File Input for CSV parsing */}
          <input 
            type="file" 
            ref={csvInputRef} 
            onChange={handleImportCSVChange} 
            accept=".csv" 
            className="hidden" 
          />

          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex-1 sm:flex-initial p-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Import Products via CSV"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial p-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Export Products to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto p-3 px-5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer active:scale-95 transition-transform duration-150 shrink-0"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* CARD 2: FILTER & VIEW PORT DOCK */}
      <div className="bg-pos-card border border-pos-border rounded p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input Box */}
        <div className="relative col-span-1 md:col-span-6">
          <Search
            size={18}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-10 pr-4 py-3.5 focus:outline-none focus:border-brand-primary font-semibold text-text-primary"
          />
        </div>

        {/* Category Filter ("All") */}
        <div className="col-span-1 md:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs font-bold text-text-secondary bg-pos-bg border border-pos-border rounded px-4 py-3.5 focus:outline-none focus:border-brand-primary cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-sm font-semibold">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle switch */}
        <div className="col-span-1 md:col-span-2 flex justify-end md:justify-center">
          <div className="border border-pos-border rounded flex bg-pos-bg p-1 overflow-hidden select-none w-full max-w-[140px] md:max-w-none">
            <button
              onClick={() => setViewMode("table")}
              className={`relative flex-1 p-2 rounded cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center gap-1 ${
                viewMode === "table"
                  ? "bg-white text-brand-primary font-bold shadow-xs border border-pos-border/40"
                  : "text-slate-600 hover:text-brand-primary"
              }`}
              style={{ height: "32px" }}
              title="Table View"
            >
              <List size={16} />
              <span className="text-[11px] font-bold hidden xl:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`relative flex-1 p-2 rounded cursor-pointer z-10 transition-all duration-300 flex items-center justify-center gap-1 ${
                viewMode === "card"
                  ? "bg-white text-brand-primary font-bold shadow-xs border border-pos-border/40"
                  : "text-slate-600 hover:text-brand-primary"
              }`}
              style={{ height: "32px" }}
              title="Card View"
            >
              <LayoutGrid size={16} />
              <span className="text-[11px] font-bold hidden xl:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN PRODUCTS DISPLAY */}
      <div className="space-y-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-pos-border rounded p-20 text-center text-slate-400">
            <Tag size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">
              No products found in the inventory!
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW WITH CENTERED ALIGNMENT */
          <div className="bg-pos-card border border-pos-border rounded overflow-hidden shadow-sm">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-pos-border text-white uppercase text-xs font-semibold tracking-wider bg-emerald-600">
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Image</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Product Name</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">SKU</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Category</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Cost (₹)</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Selling (₹)</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Margin</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Disc</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Tax (GST)</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Unit</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border text-xs">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.sku}
                    className="hover:bg-slate-50/80 transition-colors text-text-secondary text-[14px]"
                  >
                    <td className="py-2.5 px-4 flex justify-center items-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded border border-pos-border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded border border-pos-border flex items-center justify-center text-slate-400">
                          <Tag size={14} />
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-center">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="font-mono font-bold text-text-primary">{p.sku}</div>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block bg-brand-primary text-white font-bold px-2 py-1 rounded-full text-[12px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold">
                      ₹{p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold">
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block bg-emerald-50 text-brand-primary font-bold px-1.5 py-0.5 rounded-full font-mono text-[14px]">
                        {p.margin}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block font-bold px-1.5 py-0.5 rounded-full font-mono text-[14px] ${
                          p.discount > 0
                            ? "bg-rose-50 text-rose-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {p.discount || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {/* ➡️ Show tax rate in table */}
                      <span
                        className={`inline-block font-bold px-1.5 py-0.5 rounded-full font-mono text-[14px] ${
                          p.tax > 0
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {p.tax || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold">
                      {p.unit}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleBarcodeModalOpen(p)}
                          className="text-text-secondary hover:text-brand-primary p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Generate & Print Barcode"
                        >
                          <Barcode size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-text-secondary hover:text-brand-primary p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.sku)}
                          className="text-text-secondary hover:text-brand-danger p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.sku}
                className="bg-white border border-pos-border rounded p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative w-full h-32 bg-slate-50 rounded border border-pos-border overflow-hidden mb-3 flex items-center justify-center">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Tag size={28} className="text-slate-300" />
                    )}
                    <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.discount > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {p.discount}% OFF
                        </span>
                      )}
                      {/* ➡️ Tax badge in card */}
                      {p.tax > 0 && (
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          GST {p.tax}%
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary truncate">
                    {p.name}
                  </h4>
                  <div className="text-[11px] text-text-secondary mt-1 space-y-0.5">
                    <div className="flex justify-between items-center font-mono">
                      <span>SKU: {p.sku}</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Unit: {p.unit}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-pos-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-secondary block font-semibold">
                      Selling Price
                    </span>
                    <span className="text-sm font-black text-brand-primary font-mono">
                      ₹{p.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleBarcodeModalOpen(p)}
                      className="text-text-secondary hover:text-brand-primary p-1 rounded transition-colors cursor-pointer hover:bg-slate-50"
                      title="Print Product Barcode"
                    >
                      <Barcode size={13} />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="text-text-secondary hover:text-brand-primary p-1 rounded transition-colors cursor-pointer hover:bg-slate-50"
                      title="Edit Product"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.sku)}
                      className="text-text-secondary hover:text-brand-danger p-1 rounded transition-colors cursor-pointer hover:bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-pos-border rounded max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-pos-border pb-3 text-slate-700">
              {modalMode === "add" ? "Add New Product" : "Edit Product Details"}
            </h3>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-4 mt-4 text-sm font-medium text-text-secondary"
            >
              <div className="space-y-1">
                <label className="block font-bold">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Aashirvaad Wheat Flour"
                  className="w-full bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">SKU Code</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="001"
                    className="w-full border border-pos-border rounded px-3 py-2.5 text-text-primary font-mono font-bold focus:outline-none bg-pos-bg focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Stock Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-text-primary focus:outline-none"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="litre">Litre (ltr)</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold">Barcode</label>
                    <button
                      type="button"
                      onClick={() => {
                        const namePart = formData.name 
                          ? formData.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) 
                          : "PRD";
                        const randomPart = Math.floor(1000 + Math.random() * 9000);
                        const autoBarcode = `${namePart}-${randomPart}`;
                        setFormData((prev) => ({ ...prev, barcode: autoBarcode }));
                      }}
                      className="text-[11px] text-brand-primary hover:underline font-bold"
                    >
                      Auto-Gen
                    </button>
                  </div>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Auto or enter manual"
                    className="w-full border border-pos-border rounded px-3 py-2.5 text-text-primary font-mono font-bold focus:outline-none bg-pos-bg focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-pos-bg border border-pos-border rounded px-3 py-2.5 font-bold text-slate-700 focus:outline-none"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* ➡️ Responsive Flex/Grid structure for 5-Column alignment (Cost, Sell, Disc, Tax, Margin) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-pos-bg/50 border border-pos-border p-3 rounded-xl items-center">
                <div className="space-y-1">
                  <label className="block font-bold text-[11px] uppercase tracking-tighter">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-white border border-pos-border rounded text-text-primary px-1.5 py-1.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[11px] uppercase tracking-tighter">
                    Sell (₹) *
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    required
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-white border border-pos-border text-text-primary rounded px-1.5 py-1.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[11px] uppercase tracking-tighter text-rose-600">
                    Disc (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-white border border-pos-border text-rose-700 rounded px-1.5 py-1.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                {/* ➡️ New Tax Dropdown */}
                <div className="space-y-1">
                  <label className="block font-bold text-[11px] uppercase tracking-tighter text-blue-600">
                    Tax (GST %)
                  </label>
                  <select
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-pos-border text-blue-700 rounded px-1 py-1.5 font-mono font-bold focus:outline-none"
                  >
                    {taxRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 text-center col-span-2 sm:col-span-1">
                  <span className="block font-bold text-[11px] uppercase text-text-secondary tracking-tighter">
                    Margin
                  </span>
                  <span className="text-xs font-black font-mono text-brand-primary block pt-1">
                    {formData.margin}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-pos-bg border border-pos-border rounded px-3 py-2 text-slate-500 focus:outline-none file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-[12px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-pos-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-text-primary font-bold py-2.5 rounded shadow-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 rounded shadow-md cursor-pointer"
                >
                  {modalMode === "add" ? "Save Product" : "Update Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARCODE GENERATOR & PRINT SHEETS MODAL */}
      <BarcodeModal
        isOpen={showBarcodeModal}
        onClose={() => {
          setShowBarcodeModal(false);
          setBarcodeModalProduct(null);
        }}
        product={barcodeModalProduct}
      />
    </div>
  );
};

export default Products;