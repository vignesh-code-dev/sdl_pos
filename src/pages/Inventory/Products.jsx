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
  // LocalStorage-ல் இருந்து ஏற்கனவே இருக்கும் பொருட்களை எடுக்கிறோம்
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

  // ஸ்டேட்டுகள்
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  // ஃபார்ம் ஸ்டேட் (discount மற்றும் tax சேர்க்கப்பட்டுள்ளது)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Groceries",
    costPrice: "",
    sellingPrice: "",
    margin: "0",
    discount: "0",
    tax: "0", // ➡️ புதிய வரி (Tax %) ஃபீல்டு
    unit: "pcs",
    image: "",
  });

  // தயாரிப்புகள் மாறும்போதெல்லாம் அதை localStorage-ல் சேமிக்கிறோம்
  useEffect(() => {
    localStorage.setItem("billmate_products", JSON.stringify(products));
  }, [products]);

  // Profit Margin (%) தானாகவே கணக்கிடும் லாஜிக்
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

  // இன்புட் மாற்றங்களை நிர்வகிக்க
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // இமேஜ் அப்லோடு லாஜிக் (Base64)
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

  // புது பொருளை ஆட் செய்ய ஓபன் பண்ணும் ஃபங்க்ஷன்
  const openAddModal = () => {
    setModalMode("add");
    setEditingOldSku(""); // Reset old SKU
    setFormData({
      name: "",
      sku: "",
      category: "Groceries",
      costPrice: "",
      sellingPrice: "",
      margin: "0",
      discount: "0",
      tax: "0", // ➡️ ரீசெட் செய்யும் போது 0% வரி
      unit: "pcs",
      image: "",
    });
    setShowModal(true);
  };

  // ஏற்கனவே இருக்கும் பொருளை எடிட் செய்ய ஓபன் பண்ணும் ஃபங்க்ஷன்
  const openEditModal = (product) => {
    setModalMode("edit");
    setEditingOldSku(product.sku); // பழைய SKU-வை இங்கே சேமிக்கிறோம்
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
      tax: (product.tax !== undefined ? product.tax : 0).toString(), // ➡️ எடிட் செய்யும்போது வரியை ஏற்றுகிறது
      unit: product.unit,
      image: product.image || "",
    });
    setShowModal(true);
  };

  // ஃபார்ம் சப்மிட் செய்யும் போது இயங்கும் முதன்மை லாஜிக்
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
      tax: parseFloat(formData.tax) || 0, // ➡️ நம்பர் ஆக மாற்றி சேமிக்கப்படுகிறது
    };

    if (modalMode === "add") {
      // புதிய பொருளை சேர்க்கும் போது மட்டும் SKU ஏற்கனவே இருக்கிறதா என்று பார்ப்பது
      if (products.some((p) => p.sku === formData.sku)) {
        alert("இந்த SKU குறியீடு ஏற்கனவே பயன்படுத்தப்பட்டுள்ளது!");
        return;
      }
      setProducts((prev) => [processedProduct, ...prev]);
    } else {
      // எடிட் செய்யும் போது, மாற்றும் புதிய SKU வேறொரு பொருளுக்கு ஏற்கனவே இருந்தால் தடுக்க வேண்டும்
      if (
        formData.sku !== editingOldSku &&
        products.some((p) => p.sku === formData.sku)
      ) {
        alert("This SKU is already taken by another product!");
        return;
      }

      // பழைய SKU-வை வைத்து தேடி, புதிய விவரங்களோடு (புதிய SKU உட்பட) அப்டேட் செய்கிறோம்
      setProducts((prev) =>
        prev.map((p) => (p.sku === editingOldSku ? processedProduct : p)),
      );
    }

    setShowModal(false);
  };

  // தயாரிப்பை நீக்குதல்
  const handleDeleteProduct = (sku) => {
    if (window.confirm("இந்த தயாரிப்பை இன்வென்டரியில் இருந்து நீக்கலாமா?")) {
      setProducts((prev) => prev.filter((p) => p.sku !== sku));
    }
  };

  // பில்டரிங் மற்றும் தேடல்
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
  const taxRates = [0, 5, 12, 18, 28]; // ➡️ பொதுவான GST வரி விகிதங்கள்

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900">
      {/* TOP ACTIONS BAR */}
      <div className="bg-white border border-pos-border rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-sm mb-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="தயாரிப்பு பெயர் அல்லது SKU மூலம் தேடுக..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary font-medium"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-pos-bg w-[150px] border border-pos-border rounded px-3 py-3 font-bold text-text-secondary focus:outline-none"
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
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded shadow-sm transition-all duration-300 ease-out z-0 ${
                viewMode === "card" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              onClick={() => setViewMode("table")}
              className={`relative p-2 rounded cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center ${
                viewMode === "table"
                  ? "text-white bg-brand-primary font-semibold"
                  : "text-slate-600 hover:text-brand-primary"
              }`}
              style={{ width: "36px", height: "32px" }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`relative p-2 rounded cursor-pointer z-10 transition-colors duration-300 flex items-center justify-center ${
                viewMode === "card"
                  ? "bg-brand-primary text-white font-semibold"
                  : "text-slate-600 hover:text-brand-primary"
              }`}
              style={{ width: "36px", height: "32px" }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="p-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer active:scale-95 transition-transform duration-150"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* MAIN PRODUCTS DISPLAY */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-pos-border rounded p-20 text-center text-slate-400">
            <Tag size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">
              சரக்கு பட்டியலில் எந்த பொருட்களும் இல்லை!
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW WITH CENTERED ALIGNMENT */
          <div className="bg-white border border-pos-border rounded overflow-hidden shadow-sm">
            <table className="w-full text-center border-collapse">
              <thead className="bg-brand-primary text-white text-[12px] font-bold uppercase tracking-wider border-b border-pos-border">
                <tr>
                  <th className="py-3 px-4 text-center">Image</th>
                  <th className="py-3 px-4 text-center">Product Name</th>
                  <th className="py-3 px-4 text-center">SKU</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-center">Cost (₹)</th>
                  <th className="py-3 px-4 text-center">Selling (₹)</th>
                  <th className="py-3 px-4 text-center">Margin</th>
                  <th className="py-3 px-4 text-center">Disc</th>
                  <th className="py-3 px-4 text-center">Tax (GST)</th>{" "}
                  {/* ➡️ டேபிளில் வரி தலைப்பு */}
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-4 text-center">Actions</th>
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
                    <td className="py-2.5 px-4 font-mono font-bold text-center">
                      {p.sku}
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
                      {/* ➡️ டேபிளில் வரி விகிதத்தைக் காட்டுதல் */}
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
                          onClick={() => openEditModal(p)}
                          className="text-text-secondary hover:text-brand-primary p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.sku)}
                          className="text-text-secondary hover:text-brand-danger p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
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
                      {/* ➡️ கார்டில் வரி பேட்ஜ் */}
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
                  <div className=" flex items-center justify-between text-[10px] text-text-secondary mt-1">
                    <p className="font-mono mt-0.5">SKU: {p.sku}</p>
                    <p>Category: {p.category}</p>
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
                      onClick={() => openEditModal(p)}
                      className="text-text-secondary hover:text-brand-primary p-1 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.sku)}
                      className="text-text-secondary hover:text-brand-danger p-1 rounded transition-colors cursor-pointer"
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
                  placeholder="ஆசிர்வாத் கோதுமை மாவு"
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

              {/* ➡️ 5-Column-க்கு இணையான Responsive Flex/Grid அமைப்பு (Cost, Sell, Disc, Tax, Margin) */}
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
                {/* ➡️ புதிய வரி (Tax Dropdown) */}
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
    </div>
  );
};

export default Products;