import React, { useState, useEffect } from "react";
import {
  Users,
  PlusCircle,
  Search,
  Building2,
  Phone,
  User,
  ListFilter,
  X,
} from "lucide-react";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [supName, setSupName] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supBank, setSupBank] = useState("");
  const [supStatus, setSupStatus] = useState("Active");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [productInput, setProductInput] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [supSearch, setSupSearch] = useState("");

  useEffect(() => {
    const savedSuppliers = localStorage.getItem("billmate_suppliers");

    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    }
  }, []);

  const handleProductKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmedInput = productInput.trim().replace(/,$/, "");

      if (trimmedInput && !selectedProducts.includes(trimmedInput)) {
        setSelectedProducts([...selectedProducts, trimmedInput]);
      }
      setProductInput("");
    }
  };

  const removeProductTag = (indexToRemove) => {
    setSelectedProducts(
      selectedProducts.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!supName || !supPhone)
      return alert("Supplier Name and Phone Number are required!");

    const newSupplier = {
      id: Date.now(),
      name: supName,
      contact: supContact || "N/A",
      phone: supPhone,
      products: selectedProducts,
      bank: supBank || "N/A",
      status: supStatus,
    };

    const updated = [newSupplier, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem("billmate_suppliers", JSON.stringify(updated));

    setSupName("");
    setSupContact("");
    setSupPhone("");
    setSupBank("");
    setSupStatus("Active");
    setSelectedProducts([]);
    setProductInput("");
    setIsModalOpen(false); // Close Modal
  };

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "Active").length;
  const totalLinkedProducts = [...new Set(suppliers.flatMap((s) => s.products))]
    .length;
  const avgProductsPerSupplier =
    totalSuppliers > 0
      ? (
          suppliers.reduce((acc, curr) => acc + curr.products.length, 0) /
          totalSuppliers
        ).toFixed(1)
      : 0;

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(supSearch.toLowerCase()) ||
      s.phone.includes(supSearch) ||
      s.contact.toLowerCase().includes(supSearch.toLowerCase()) ||
      s.products.some((p) => p.toLowerCase().includes(supSearch.toLowerCase())),
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-brand-500 flex items-center gap-2">
          <Users className="text-brand-500" size={24} /> Supplier Management
        </h2>
      </div>

      {/* SUMMARY KPIs GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs ">
          <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
            Total Suppliers
          </span>
          <span className="text-4xl font-black text-slate-800 font-mono mt-1 block">
            {totalSuppliers}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs ">
          <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
            Active Suppliers
          </span>
          <span className="text-4xl font-black text-blue-600 font-mono mt-1 block">
            {activeSuppliers}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs ">
          <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
            Products Covered
          </span>
          <span className="text-4xl font-black text-indigo-600 font-mono mt-1 block">
            {totalLinkedProducts}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs ">
          <span className="text-base font-semibold uppercase tracking-wider text-text-secondary block">
            Avg Products / Supplier
          </span>
          <span className="text-4xl font-black text-amber-600 font-mono mt-1 block">
            {avgProductsPerSupplier}
          </span>
        </div>
      </div>

      {/* SUPPLIERS DIRECTORY TABLE (NOW FULL SCREEN WIDTH) */}
      <div className="w-full flex flex-col bg-white border border-slate-200 rounded shadow-xs overflow-hidden h-fit">
        {/* DIRECTORY CONTROLS (HEADER, CENTER SEARCH, RIGHT ADD BUTTON) */}
        <div className="p-4 border-b flex flex-col md:flex-row items-center gap-4 justify-between bg-slate-50/50 shrink-0">
          {/* Left Title */}
          <h3 className="text-xl font-semibold text-brand-500 uppercase tracking-wide flex items-center gap-1 w-full md:w-auto">
            <ListFilter size={14} className="text-brand-500" /> Vendor Records
            Directory
          </h3>

          {/* Center Search Bar */}
          <div className="relative w-full md:w-[400px]">
            <Search
              size={14}
              className="absolute left-3 top-4 text-slate-400"
            />
            <input
              type="text"
              value={supSearch}
              onChange={(e) => setSupSearch(e.target.value)}
              placeholder="Search by supplier name, contact, phone or product..."
              className="w-full text-sm bg-transparent border border-slate-300 rounded pl-8 pr-3 py-2.5 focus:outline-emerald-600 font-medium shadow-sm"
            />
          </div>

          {/* Right Add Supplier Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold uppercase tracking-wider py-2.5 px-4 rounded shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] shrink-0"
          >
            <PlusCircle size={15} /> Add New Supplier
          </button>
        </div>

        {/* TABLE CONTAINER WITH INTERNAL SCROLL */}
        <div className="overflow-x-auto max-h-[465px] overflow-y-auto">
          {filteredSuppliers.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">
              No matching supplier found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs min-w-[750px]">
              <thead className="bg-brand-500 text-white text-xs font-medium uppercase tracking-wider border-b border-pos-border">
                <tr>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Linked Products</th>
                  <th className="py-3 px-4">Bank Account Details</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-brand-500/10 transition-colors text-sm font-medium text-text-secondary"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-[13px]">
                        {sup.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {sup.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {sup.contact}
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {sup.products && sup.products.length > 0 ? (
                          sup.products.map((p, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] border border-slate-200 font-medium"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            No products mapped
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-pre-line text-[11px]">
                      {sup.bank}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                          sup.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {sup.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- ADD SUPPLIER POP-UP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded border border-slate-200 shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-brand-500 text-white p-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle size={16} className="text-emerald-400" /> Add New
                Supplier Record
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleAddSupplier}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Supplier / Agency Name *
                </label>
                <div className="relative">
                  <Building2
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="e.g., Sri Krishna Traders"
                    className="w-full border rounded pl-9 pr-3 py-2.5 focus:outline-emerald-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Contact Person Name
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g., Kumar (Manager)"
                    className="w-full border rounded pl-9 pr-3 py-2.5 focus:outline-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full border rounded pl-9 pr-3 py-2.5 focus:outline-emerald-600 font-medium"
                    required
                  />
                </div>
              </div>

              {/* DYNAMIC SUPPLIES TYPING FIELD */}
              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Supplying Products (Type & Press Enter)
                </label>
                <div className="border rounded p-2 bg-white focus-within:outline focus-within:outline-2 focus-within:outline-emerald-600 min-h-[42px]">
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selectedProducts.map((prod, index) => (
                      <span
                        key={index}
                        className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded text-[11px] border border-emerald-200 flex items-center gap-1"
                      >
                        {prod}
                        <button
                          type="button"
                          onClick={() => removeProductTag(index)}
                          className="hover:bg-emerald-200 rounded-full p-0.5 text-emerald-600 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    onKeyDown={handleProductKeyDown}
                    placeholder={
                      selectedProducts.length === 0
                        ? "e.g., Rice, Atta, Sugar"
                        : "Add more..."
                    }
                    className="w-full focus:outline-none py-0.5 px-1 font-medium bg-transparent text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Press Enter or Comma to add multiple products.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Bank Account Details
                </label>
                <textarea
                  value={supBank}
                  onChange={(e) => setSupBank(e.target.value)}
                  placeholder="Bank Name, Account No, IFSC Code, Branch"
                  rows="2"
                  className="w-full border rounded p-2.5 focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Supplier Status
                </label>
                <select
                  value={supStatus}
                  onChange={(e) => setSupStatus(e.target.value)}
                  className="w-full border rounded p-2.5 focus:outline-emerald-600 font-bold bg-white text-slate-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t font-semibold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded text-center cursor-pointer transition-all uppercase tracking-wider text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded text-center cursor-pointer transition-all uppercase tracking-wider text-[10px] shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;