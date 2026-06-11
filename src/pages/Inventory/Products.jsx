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
} from "lucide-react";

const Products = () => {
  // Retrieve existing products from localStorage
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("billmate_products");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // States
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  // Form state (discount and tax included)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Groceries",
    costPrice: "",
    sellingPrice: "",
    margin: "0",
    discount: "0",
    tax: "0", // ➡️ New tax (Tax %) field
    unit: "pcs",
    image: "",
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
    setFormData({
      name: "",
      sku: "",
      category: "Groceries",
      costPrice: "",
      sellingPrice: "",
      margin: "0",
      discount: "0",
      tax: "0", // ➡️ 0% tax on reset
      unit: "pcs",
      image: "",
    });
    setShowModal(true);
  };

  // Function to open edit product modal
  const openEditModal = (product) => {
    setModalMode("edit");
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
      tax: (product.tax !== undefined ? product.tax : 0).toString(), // ➡️ Loads tax when editing
      unit: product.unit,
      image: product.image || "",
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

    const processedProduct = {
      ...formData,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      margin: parseFloat(formData.margin) || 0,
      discount: cleanDiscount,
      tax: parseFloat(formData.tax) || 0, // ➡️ Converted to number and saved
    };

    if (modalMode === "add") {
      if (products.some((p) => p.sku === formData.sku)) {
        alert("This SKU code is already in use!");
        return;
      }
      setProducts((prev) => [processedProduct, ...prev]);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.sku === formData.sku ? processedProduct : p)),
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

  // Filtering and search
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
  const taxRates = [0, 5, 12, 18, 28]; // ➡️ General GST tax rates

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900">
      {/* TOP ACTIONS BAR */}
      <div className="bg-white border border-pos-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm mb-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary font-medium"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-pos-bg border border-pos-border rounded-xl px-3 py-3 font-bold text-slate-600 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="border border-pos-border rounded-xl p-1 flex bg-pos-bg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg cursor-pointer ${viewMode === "table" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400"}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg cursor-pointer ${viewMode === "card" ? "bg-white text-brand-primary shadow-sm" : "text-slate-400"}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="p-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* MAIN PRODUCTS DISPLAY */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-pos-border rounded-2xl p-20 text-center text-slate-400">
            <Tag size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">
              No products found in the database.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="bg-white border border-pos-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-pos-border">
                <tr>
                  <th className="py-3 px-5">Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Cost (₹)</th>
                  <th className="py-3 px-4 text-right">Selling (₹)</th>
                  <th className="py-3 px-4 text-center">Margin</th>
                  <th className="py-3 px-4 text-center">Disc</th>
                  <th className="py-3 px-4 text-center">Tax (GST)</th>
                  {/* ➡️ Tax header in table */}
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border text-xs">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.sku}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-5">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt=""
                          className="w-9 h-9 object-cover rounded-lg border border-pos-border"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-slate-100 rounded-lg border border-pos-border flex items-center justify-center text-slate-400">
                          <Tag size={14} />
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 font-bold">
                      {p.sku}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-500">
                      ₹{p.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-emerald-50 text-brand-primary font-bold px-1.5 py-0.5 rounded font-mono text-[10px]">
                        {p.margin}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded font-mono text-[10px] ${p.discount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"}`}
                      >
                        {p.discount || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {/* ➡️ Show tax rate in table */}
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded font-mono text-[10px] ${p.tax > 0 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                      >
                        {p.tax || 0}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {p.unit}
                    </td>
                    <td className="py-2.5 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-slate-400 hover:text-brand-primary p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.sku)}
                          className="text-slate-400 hover:text-brand-danger p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
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
                className="bg-white border border-pos-border rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative w-full h-32 bg-slate-50 rounded-xl border border-pos-border overflow-hidden mb-3 flex items-center justify-center">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Tag size={28} className="text-slate-300" />
                    )}
                    <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.discount > 0 && (
                        <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          {p.discount}% OFF
                        </span>
                      )}
                      {/* ➡️ Tax badge in card */}
                      {p.tax > 0 && (
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          GST {p.tax}%
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    SKU: {p.sku} • {p.unit}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-pos-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Selling Price
                    </span>
                    <span className="text-sm font-black text-brand-primary font-mono">
                      ₹{p.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => openEditModal(p)}
                      className="text-slate-400 hover:text-brand-primary p-1 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.sku)}
                      className="text-slate-300 hover:text-brand-danger p-1 rounded transition-colors cursor-pointer"
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
          <div className="bg-white border border-pos-border rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-pos-border pb-3 text-slate-700">
              {modalMode === "add" ? "Add New Product" : "Edit Product Details"}
            </h3>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-4 mt-4 text-xs font-medium text-slate-600"
            >
              <div className="space-y-1">
                <label className="block font-bold">Product Name *</label>
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
                  <label className="block font-bold">SKU Code *</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    disabled={modalMode === "edit"}
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="1001"
                    className={`w-full border border-pos-border rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold focus:outline-none ${modalMode === "edit" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-pos-bg focus:border-brand-primary"}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">Stock Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="litre">Litre (ltr)</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none"
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

              {/* ➡️ Responsive Flex/Grid structure for 5-Column alignment (Cost, Sell, Disc, Tax, Margin) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-pos-bg/50 border border-pos-border p-3 rounded-xl items-center">
                <div className="space-y-1">
                  <label className="block font-bold text-[9px] uppercase tracking-tighter">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-white border border-pos-border rounded-lg px-1.5 py-1.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[9px] uppercase tracking-tighter">
                    Sell (₹) *
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    required
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-white border border-pos-border rounded-lg px-1.5 py-1.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[9px] uppercase tracking-tighter text-rose-600">
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
                    className="w-full bg-white border border-pos-border text-rose-700 rounded-lg px-1.5 py-1.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                {/* ➡️ New Tax Dropdown */}
                <div className="space-y-1">
                  <label className="block font-bold text-[9px] uppercase tracking-tighter text-blue-600">
                    Tax (GST %)
                  </label>
                  <select
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-pos-border text-blue-700 rounded-lg px-1 py-1.5 font-mono font-bold focus:outline-none"
                  >
                    {taxRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 text-center col-span-2 sm:col-span-1">
                  <span className="block font-bold text-[9px] uppercase text-slate-400 tracking-tighter">
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
                  className="w-full bg-pos-bg border border-pos-border rounded-xl px-3 py-2 text-slate-500 focus:outline-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-pos-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
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
