import React, { useState, useEffect } from "react";
import {
  Plus,
  LayoutGrid,
  List,
  Download,
  Trash2,
  Edit3,
  Search,
  Tag,
  Package,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState(() => {
    try {
      const savedProducts = localStorage.getItem("billmate_products");
      return savedProducts ? JSON.parse(savedProducts) : [];
    } catch (error) {
      console.error("Error parsing products from localStorage:", error);
      localStorage.removeItem("billmate_products");
      return [];
    }
  });

  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingOldSku, setEditingOldSku] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Groceries",
    costPrice: "",
    sellingPrice: "",
    margin: "0",
    discount: "0",
    tax: "0",
    unit: "pcs",
    image: "",
  });

  useEffect(() => {
    localStorage.setItem("billmate_products", JSON.stringify(products));
  }, [products]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const openAddModal = () => {
    setModalMode("add");
    setEditingOldSku("");
    setFormData({
      name: "",
      sku: "",
      category: "Groceries",
      costPrice: "",
      sellingPrice: "",
      margin: "0",
      discount: "0",
      tax: "0",
      unit: "pcs",
      image: "",
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingOldSku(product.sku);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      margin: product.margin.toString(),
      discount: (product.discount !== undefined
        ? product.discount
        : 0
      ).toString(),
      tax: (product.tax !== undefined ? product.tax : 0).toString(),
      unit: product.unit,
      image: product.image || "",
    });
    setShowModal(true);
  };
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

    const processedProduct = {
      ...formData,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      discount: cleanDiscount,
      tax: parseFloat(formData.tax) || 0,
    };

    if (modalMode === "add") {
      if (products.some((p) => p.sku === formData.sku)) {
        alert("This SKU is already taken by another product!");
        return;
      }
      setProducts((prev) => [processedProduct, ...prev]);
    } else {
      if (
        formData.sku !== editingOldSku &&
        products.some((p) => p.sku === formData.sku)
      ) {
        alert("This SKU is already taken by another product!");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.sku === editingOldSku ? processedProduct : p)),
      );
    }
    setShowModal(false);
  };

  const handleDeleteProduct = (sku) => {
    if (
      window.confirm(
        "Are you sure you want to remove this product from inventory?",
      )
    ) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.includes(searchQuery);
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
  const taxRates = [0, 5, 12, 18, 28];

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg text-slate-900 font-sans overflow-hidden">
      {/* 🆕 NEW PAGE TITLE BAR */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-500 flex items-center gap-2">
            <Package size={22} className="text-brand-500" />
            Products List
          </h2>
        </div>
        <div className="bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-xs font-black">
          Total: {filteredProducts.length} Items
        </div>
      </div>

      {/* TOP ACTIONS / SEARCH BAR */}
      <div className="bg-white border border-pos-border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-xs mb-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by Product Name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-brand-500/50 focus:outline-none font-medium"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-pos-bg w-[150px] border border-pos-border rounded px-3 py-3 font-bold text-text-secondary focus:outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-sm">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* View Mode Toggle Switch */}
          <div className="relative border border-pos-border rounded flex bg-pos-bg p-1 overflow-hidden select-none">
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded shadow-xs transition-all duration-300 ease-out z-0 ${
                viewMode === "card" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              onClick={() => setViewMode("table")}
              className={`relative p-2 rounded cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center ${
                viewMode === "table"
                  ? "text-brand-primary font-semibold"
                  : "text-slate-600"
              }`}
              style={{ width: "36px", height: "32px" }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`relative p-2 rounded cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center ${
                viewMode === "card"
                  ? "text-brand-primary font-semibold"
                  : "text-slate-600"
              }`}
              style={{ width: "36px", height: "32px" }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-sm font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* MAIN Display Area - Handled Container for Scroll */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-pos-border rounded p-20 text-center text-slate-400">
            <Tag size={38} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">No products found.</p>
          </div>
        ) : viewMode === "table" ? (
          /* STICKY TABLE VIEW IMPLEMENTATION */
          <div className="bg-white border border-pos-border rounded shadow-xs overflow-hidden max-h-full flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-center border-collapse">
                {/* Fixed Sticky Header Class Attached Below */}
                <thead className="bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider border-b border-pos-border sticky top-0 z-20 shadow-xs">
                  <tr>
                    <th className="py-3.5 px-4">Image</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Cost (₹)</th>
                    <th className="py-3.5 px-4">Selling (₹)</th>
                    <th className="py-3.5 px-4">Margin</th>
                    <th className="py-3.5 px-4">Disc</th>
                    <th className="py-3.5 px-4">Tax (GST)</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pos-border bg-white">
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.sku}
                      className="hover:bg-brand-500/10 transition-colors text-text-secondary text-sm font-medium "
                    >
                      <td className="py-2.5 px-4 flex justify-center items-center">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="w-9 h-9 object-cover rounded border border-pos-border"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-slate-100 rounded border border-pos-border flex items-center justify-center text-slate-400">
                            <Tag size={13} />
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4">{p.name}</td>
                      <td className="py-2.5 px-4 font-mono">{p.sku}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        ₹{p.costPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono">
                          {p.margin}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-mono ${p.discount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"}`}
                        >
                          {p.discount || 0}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-mono ${p.tax > 0 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                        >
                          {p.tax || 0}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">{p.unit}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="text-text-primary w-9 h-9 hover:text-info p-1.5 rounded hover:bg-info/10 transition-colors cursor-pointer"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.sku)}
                            className="text-text-primary w-9 h-9 hover:text-danger p-1.5 rounded hover:bg-danger/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CARD VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map((p) => (
              <div
                key={p.sku}
                className="bg-white border border-pos-border rounded p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
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

                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.discount > 0 && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {p.discount}% OFF
                        </span>
                      )}
                      {p.tax > 0 && (
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          GST {p.tax}%
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {p.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-text-secondary mt-1">
                    <p className="font-mono">SKU: {p.sku}</p>
                    <p className="font-semibold">{p.category}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-pos-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-secondary block font-bold uppercase">
                      Selling Price
                    </span>
                    <span className="text-sm font-black text-brand-primary font-mono">
                      ₹{p.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="text-slate-400 hover:text-brand-primary p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.sku)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* POPUP MODAL (Add / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-pos-border rounded max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <h3 className="text-xs font-black uppercase tracking-wider border-b border-pos-border pb-3 text-slate-700">
              {modalMode === "add" ? "Add New Product" : "Edit Product Details"}
            </h3>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-4 mt-4 text-sm font-medium text-text-secondary"
            >
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Organic Honey"
                  className="w-full bg-pos-bg border border-pos-border text-sm rounded px-3 py-2 text-text-primary font-medium focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="001"
                    className="w-full border border-pos-border rounded px-3 py-2 text-text-primary font-mono font-bold focus:outline-none bg-pos-bg focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    Stock Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full bg-pos-bg border border-pos-border rounded px-3 py-2 font-bold text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="Pcs">Pieces (pcs)</option>
                    <option value="Kg">Kilogram (kg)</option>
                    <option value="Ltr">Litre (ltr)</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-pos-bg border border-pos-border rounded px-3 py-2 font-bold text-text-primary focus:outline-none cursor-pointer"
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

              {/* Pricing Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-pos-bg/50 border border-pos-border p-3 rounded items-center">
                <div className="space-y-1">
                  <label className="block font-bold text-[10px] uppercase text-slate-500 tracking-tighter">
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
                  <label className="block font-bold text-[10px] uppercase text-slate-500 tracking-tighter">
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
                  <label className="block font-bold text-[10px] uppercase text-rose-600 tracking-tighter">
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
                <div className="space-y-1">
                  <label className="block font-bold text-[10px] uppercase text-blue-600 tracking-tighter">
                    Tax (GST)
                  </label>
                  <select
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-pos-border text-blue-700 rounded px-1 py-1.5 font-mono font-bold focus:outline-none cursor-pointer"
                  >
                    {taxRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 text-center col-span-2 sm:col-span-1">
                  <span className="block font-bold text-[10px] uppercase text-text-secondary tracking-tighter">
                    Margin
                  </span>
                  <span className="text-xs font-black font-mono text-brand-primary block pt-1">
                    {formData.margin}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-pos-bg border border-pos-border rounded px-3 py-1.5 text-slate-500 focus:outline-none text-xs file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-pos-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-text-primary py-2.5 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded cursor-pointer"
                >
                  {modalMode === "add" ? "Save Product" : "Update Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
