import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  UserPlus,
  CheckCircle,
  Barcode,
  Percent,
  Receipt,
  Printer,
  X,
  User,
  ShoppingBag,
  ChevronDown,
  CreditCard,
  Package,
  Edit2,
  PauseCircle,
  Wallet,
  Building2,
  Smartphone,
  Download,
} from "lucide-react";
import { downloadInvoiceHTML } from "../../utils/invoiceDownload";
import InvoiceModal from "../../components/InvoiceModal";
import AddCustomerModal from "../../components/AddCustomerModal";

const POSBilling = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethodError, setPaymentMethodError] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Custom Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };



  // New Customer Addition states inside POS desk
  const [showAddCustModal, setShowAddCustModal] = useState(false);

  const handleOpenAddCustomerModal = () => {
    setShowAddCustModal(true);
  };

  const handleSaveNewCustomer = (newCustomerObj) => {
    const updated = [newCustomerObj, ...customers];
    setCustomers(updated);
    localStorage.setItem("billmate_customers", JSON.stringify(updated));

    // Choose this new customer
    setCustomerMobile(newCustomerObj.mobile);
    setCustomerName(newCustomerObj.name);
    setIsNewCustomer(false);
    setShowAddCustModal(false);
    showToast("New customer registered & matched!", "success");
  };

  const searchInputRef = useRef(null);

  useEffect(() => {
    let savedProducts = localStorage.getItem("billmate_products");
    if (!savedProducts || JSON.parse(savedProducts).length === 0) {
      const initialSeededProducts = [
        { name: "Coca Cola 250ml", sku: "SKU1245", category: "Beverages", costPrice: 15, sellingPrice: 40, margin: 25, discount: 0, tax: 0, unit: "pcs" },
        { name: "Dairy Milk 13g", sku: "SKU1234", category: "Confectionery", costPrice: 10, sellingPrice: 20, margin: 50, discount: 0, tax: 0, unit: "pcs" },
        { name: "Lays Classic 25g", sku: "SKU3697", category: "Snacks", costPrice: 5, sellingPrice: 10, margin: 100, discount: 0, tax: 0, unit: "pcs" },
        { name: "Bisleri 500ml", sku: "SKU1353", category: "Beverages", costPrice: 12, sellingPrice: 18, margin: 50, discount: 0, tax: 0, unit: "pcs" },
        { name: "Parle-G 55g", sku: "SKU6789", category: "Biscuits", costPrice: 6, sellingPrice: 10, margin: 66.7, discount: 0, tax: 0, unit: "pcs" },
      ];
      localStorage.setItem("billmate_products", JSON.stringify(initialSeededProducts));
      setProducts(initialSeededProducts);
    } else {
      setProducts(JSON.parse(savedProducts));
    }

    let savedCustomers = localStorage.getItem("billmate_customers");
    if (!savedCustomers || JSON.parse(savedCustomers).length === 0) {
      const initialSeededCustomers = [
        { id: "C-1", name: "Rahul Sharma", mobile: "9876543210", email: "rahul@gmail.com", createdAt: "2026-01-15" },
        { id: "C-2", name: "Priya Patel", mobile: "8765432109", email: "priya@gmail.com", createdAt: "2026-02-18" },
        { id: "C-3", name: "Amit Kumar", mobile: "7654321098", email: "amit@gmail.com", createdAt: "2026-03-05" }
      ];
      localStorage.setItem("billmate_customers", JSON.stringify(initialSeededCustomers));
      setCustomers(initialSeededCustomers);
    } else {
      setCustomers(JSON.parse(savedCustomers));
    }

    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const parseSearchInput = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return { targetSku: "", targetQty: 1 };
    
    if (trimmed.includes("*")) {
      const parts = trimmed.split("*");
      if (parts.length >= 2) {
        const part0 = parts[0].trim();
        const part1 = parts[1].trim();
        
        // 1. If one of them is an exact SKU or name match in products, that's the SKU!
        const isPart0Product = products.some(p => p.sku.toLowerCase() === part0.toLowerCase() || p.name.toLowerCase() === part0.toLowerCase());
        const isPart1Product = products.some(p => p.sku.toLowerCase() === part1.toLowerCase() || p.name.toLowerCase() === part1.toLowerCase());
        
        if (isPart0Product && !isPart1Product) {
          return { targetSku: part0, targetQty: parseInt(part1) || 1 };
        }
        if (isPart1Product && !isPart0Product) {
          return { targetSku: part1, targetQty: parseInt(part0) || 1 };
        }
        
        // 2. If one of them is a partial SKU/name match (includes)
        const isPart0Partial = products.some(p => p.sku.toLowerCase().includes(part0.toLowerCase()) || p.name.toLowerCase().includes(part0.toLowerCase()));
        const isPart1Partial = products.some(p => p.sku.toLowerCase().includes(part1.toLowerCase()) || p.name.toLowerCase().includes(part1.toLowerCase()));
        
        if (isPart0Partial && !isPart1Partial) {
          return { targetSku: part0, targetQty: parseInt(part1) || 1 };
        }
        if (isPart1Partial && !isPart0Partial) {
          return { targetSku: part1, targetQty: parseInt(part0) || 1 };
        }
        
        // 3. Fallback: Check if one of them is number and the other has length advantages, or look at standard order.
        const part0IsNum = /^\d+$/.test(part0);
        const part1IsNum = /^\d+$/.test(part1);
        
        if (part0IsNum && !part1IsNum) {
          return { targetSku: part1, targetQty: parseInt(part0) || 1 };
        }
        if (part1IsNum && !part0IsNum) {
          return { targetSku: part0, targetQty: parseInt(part1) || 1 };
        }
        
        if (part0IsNum && part1IsNum) {
          const num0 = parseInt(part0);
          const num1 = parseInt(part1);
          if (num0 > num1) {
            return { targetSku: part0, targetQty: num1 };
          } else {
            return { targetSku: part1, targetQty: num0 };
          }
        }
        
        return { targetSku: part0, targetQty: parseInt(part1) || 1 };
      }
    }
    
    return { targetSku: trimmed, targetQty: 1 };
  };

  const { targetSku: suggestSku, targetQty: suggestQty } = parseSearchInput(searchInput);
  const filterVal = suggestSku.toLowerCase();
  const filteredSuggestions = filterVal
    ? products.filter(p => p.sku.toLowerCase().includes(filterVal) || p.name.toLowerCase().includes(filterVal)).slice(0, 6)
    : [];

  const handleSearchKeys = (e) => {
    if (filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => prev > 0 ? prev - 1 : filteredSuggestions.length - 1);
      } else if (e.key === "Enter") {
        if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < filteredSuggestions.length) {
          e.preventDefault();
          addItemToCart(filteredSuggestions[focusedSuggestionIndex], suggestQty);
          setSearchInput("");
          setFocusedSuggestionIndex(-1);
        }
      } else if (e.key === "Escape") {
        setFocusedSuggestionIndex(-1);
      }
    }
  };

  const addItemToCart = (product, qty) => {
   const qtyNum = parseInt(qty) || 1;
    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(item => item.sku === product.sku);
      const currentRate = parseFloat(product.sellingPrice) || parseFloat(product.rate) || 0;
      const currentTax = parseFloat(product.tax) || 0;
      const currentDiscount = parseFloat(product.discount) || 0;
      if (existingIdx > -1) {
        const updated = prevCart.map((item, idx) => {
          if (idx === existingIdx) {
            const currentQty = parseInt(item.quantity) || 0;
            return {
              ...item,
              quantity: currentQty + qtyNum
            };
          }
          return item;
        });
        return updated;
      } else {
        return [...prevCart, { ...product, rate: currentRate, tax: currentTax, quantity: qtyNum, discount: currentDiscount }];
      }
    });
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleProductSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const { targetSku, targetQty } = parseSearchInput(searchInput);
    
    // Support exact match first
    let product = products.find(p => p.sku.toLowerCase() === targetSku.toLowerCase() || p.name.toLowerCase() === targetSku.toLowerCase());
    
    // If no exact match, but we have partial matches, let's check contains
    if (!product) {
      const partials = products.filter(p => p.sku.toLowerCase().includes(targetSku.toLowerCase()) || p.name.toLowerCase().includes(targetSku.toLowerCase()));
      if (partials.length === 1) {
        product = partials[0];
      } else if (partials.length > 1) {
        const matchNoSkuPrefix = partials.find(p => p.sku.toLowerCase().replace(/^sku/, "") === targetSku.toLowerCase());
        if (matchNoSkuPrefix) {
          product = matchNoSkuPrefix;
        } else {
          product = partials[0];
        }
      }
    }
    
    if (product) {
      addItemToCart(product, targetQty);
      setSearchInput("");
      setFocusedSuggestionIndex(-1);
    } else {
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < filteredSuggestions.length) {
        addItemToCart(filteredSuggestions[focusedSuggestionIndex], targetQty);
        setSearchInput("");
        setFocusedSuggestionIndex(-1);
      } else if (filteredSuggestions.length === 1) {
        addItemToCart(filteredSuggestions[0], targetQty);
        setSearchInput("");
        setFocusedSuggestionIndex(-1);
      } else {
        showToast(`Product with SKU or Barcode '${targetSku}' was not found in database.`, "warning");
      }
    }
  };

  const updateQuantity = (sku, delta) => {
    setCart(prev => prev.map(item => {
      if (item.sku === sku) {
        const currentQty = parseInt(item.quantity) || 0;
        const updatedQty = currentQty + delta;
        return updatedQty > 0 ? { ...item, quantity: updatedQty } : item;
      }
      return item;
    }));
  };

  const handleQtyDirectChange = (sku, val) => {
    const numeric = parseInt(val) || 1;
    setCart(prev => prev.map(item => item.sku === sku ? { ...item, quantity: Math.max(1, numeric) } : item));
  };

  const updateLineDiscount = (sku, val) => {
    const rawVal = parseFloat(val);
    const disc = isNaN(rawVal) ? 0 : Math.min(100, Math.max(0, rawVal));
    setCart(prev => prev.map(item => item.sku === sku ? { ...item, discount: disc } : item));
  };

  const removeItem = (sku) => {
    setCart(prev => prev.filter(item => item.sku !== sku));
  };

  const calculateLineTotal = (item) => {
    const base = item.rate * item.quantity;
    const afterDiscount = base - base * (item.discount / 100);
    const taxAmount = afterDiscount * (item.tax / 100);
    return afterDiscount + taxAmount;
  };

  const subtotal = cart.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const totalLineDiscount = cart.reduce((sum, item) => sum + (item.rate * item.quantity * (item.discount / 100)), 0);
  const totalTax = cart.reduce((sum, item) => {
    const base = (item.rate * item.quantity) - (item.rate * item.quantity * (item.discount / 100));
    return sum + (base * (item.tax / 100));
  }, 0);
  const grandTotal = Math.max(0, subtotal - totalLineDiscount + totalTax - globalDiscount);

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      showToast("The shopping cart is empty! Please scan or search products first.", "warning");
      return;
    }
    if (!paymentMethod) {
      setPaymentMethodError(true);
      showToast("Please select a Payment Method before completing the sale.", "warning");
      return;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const docNo = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-${currentYear}${currentMonth}-${docNo}`;
    const formattedDate = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    let customerRefName = customerName.trim();
    if (customerMobile.length === 10) {
      const match = customers.find(c => c.mobile === customerMobile);
      if (match) {
        customerRefName = match.name;
      } else {
        if (!customerRefName) customerRefName = "Walk-in";
        const newCustomerObj = { id: `C-${Date.now()}`, name: customerRefName, mobile: customerMobile, createdAt: new Date().toISOString().split("T")[0] };
        const updatedCusts = [...customers, newCustomerObj];
        setCustomers(updatedCusts);
        localStorage.setItem("billmate_customers", JSON.stringify(updatedCusts));
      }
    } else {
      customerRefName = customerRefName || "Walk-in";
    }
    const receiptObj = {
      id: invoiceId, date: formattedDate, shopName: "SDL BillMate POS Supermarket",
      customerName: customerRefName, customerMobile: customerMobile || "Walk-In", items: [...cart],
      subtotal, totalLineDiscount, totalTax, globalDiscount, grandTotal,
      paidAmount: grandTotal, balance: 0, status: "Active", returns: [],
      operator: "admin", paymentMethod
    };
    try {
      const invoices = JSON.parse(localStorage.getItem("billmate_invoices") || "[]");
      const updatedInvoices = [receiptObj, ...invoices].slice(0, 50);
      localStorage.setItem("billmate_invoices", JSON.stringify(updatedInvoices));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        localStorage.removeItem("billmate_invoices");
        localStorage.setItem("billmate_invoices", JSON.stringify([receiptObj]));
      }
    }
    setActiveInvoice(receiptObj);
    setShowInvoiceModal(true);
  };

  const resetBillingStateComplete = () => {
    setCart([]); setSearchInput(""); setCustomerMobile(""); setCustomerName(""); setIsNewCustomer(false);
    setGlobalDiscount(0); setPaymentMethod(""); setPaymentMethodError(false); setFocusedSuggestionIndex(-1);
    setActiveInvoice(null); setShowInvoiceModal(false);
    setTimeout(() => { if (searchInputRef.current) searchInputRef.current.focus(); }, 100);
  };

  const totalItems = cart.length;
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const totalDiscount = totalLineDiscount + globalDiscount;

  const paymentOptions = [
    { value: "CASH", label: "Cash", icon: <Wallet size={16} /> },
    { value: "CARD", label: "Card", icon: <CreditCard size={16} /> },
    { value: "UPI", label: "UPI", icon: <Smartphone size={16} /> },
    { value: "BANK", label: "Bank Transfer", icon: <Building2 size={16} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body, input, button, select, textarea { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .pos-scroll::-webkit-scrollbar { width: 6px; }
        .pos-scroll::-webkit-scrollbar-track { background: transparent; }
        .pos-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .pos-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .cart-row:hover td { background-color: #f9fafb; }
        @media print {
          body * { visibility: hidden !important; background: #fff !important; }
          #thermal-print-area, #thermal-print-area * { visibility: visible !important; color: #000 !important; }
          #thermal-print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: 400px !important; margin: 0 auto !important; padding: 10px !important; font-size: 11px !important; line-height: 1.4 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* MAIN BODY */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* LEFT PANEL - CART */}
        <div className="flex flex-col flex-1 overflow-hidden gap-3">
          {/* Search Bar */}
          <form onSubmit={handleProductSearchSubmit} className="relative flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Barcode size={18} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onKeyDown={handleSearchKeys}
                onChange={(e) => { setSearchInput(e.target.value); setFocusedSuggestionIndex(-1); }}
                placeholder="Type product name, SKU or scan barcode..."
                className="w-full h-10 bg-white border border-gray-200 rounded-lg pl-10 pr-9 text-sm text-gray-700 placeholder-gray-400 font-medium outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setFocusedSuggestionIndex(-1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-transparent border-0">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit"
              className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer border-0 transition-colors shadow-sm">
              <Search size={16} />
              Search
            </button>

            {/* Autocomplete dropdown */}
            {filteredSuggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-200">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Suggestions</span>
                  <span className="text-[9px] text-gray-400">↑↓ Enter to select</span>
                </div>
                {filteredSuggestions.map((p, idx) => (
                  <div key={p.sku}
                    onClick={() => { addItemToCart(p, suggestQty); setSearchInput(""); setFocusedSuggestionIndex(-1); }}
                    onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                    className={`px-3 py-2.5 cursor-pointer flex items-center justify-between border-b border-gray-100 transition-colors ${focusedSuggestionIndex === idx ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-xs font-bold text-gray-700">{p.sku}</div>
                      <div className="text-xs text-gray-600 truncate">{p.name}</div>
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold ml-2">₹{parseFloat(p.sellingPrice || p.rate || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Cart Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Items</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{totalItems}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Quantity</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{totalQty}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Subtotal</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">₹{subtotal.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Discount</div>
              <div className="text-xl font-bold text-red-600 mt-1">₹{totalDiscount.toFixed(2)}</div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-xs">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3.5 grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3 text-left">PRODUCT DETAILS</div>
              <div className="col-span-1 text-center">RATE (₹)</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-1 text-center">UNIT</div>
              <div className="col-span-1 text-center">DISC %</div>
              <div className="col-span-1 text-center">TAX</div>
              <div className="col-span-1 pr-1 text-right">AMOUNT</div>
              <div className="col-span-1 text-center">ACTION</div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto pos-scroll">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <ShoppingCart size={20} />
                  </div>
                  <div className="text-sm font-semibold text-gray-600">Cart is Empty</div>
                  <div className="text-xs text-gray-400 mt-1">Scan or search for products</div>
                </div>
              ) : (
                <div>
                  {cart.map((item, idx) => (
                    <div key={item.sku} className="cart-row border-b border-gray-100 last:border-b-0 px-6 py-4.5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/40 transition-colors">
                      <div className="col-span-1 text-xs text-gray-400 font-semibold text-center">{idx + 1}</div>
                      <div className="col-span-3 text-left">
                        <div className="text-[14px] font-semibold text-gray-800 leading-tight">{item.name}</div>
                        <div className="text-[12px] text-gray-500 mt-1 font-mono uppercase tracking-wider">{item.sku}</div>
                      </div>
                      <div className="col-span-1 text-center text-[14px] font-medium text-gray-700">{item.rate.toFixed(2)}</div>
                      <div className="col-span-2">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8 overflow-hidden shadow-xs hover:border-gray-300 transition-colors">
                            <button type="button" onClick={() => updateQuantity(item.sku, -1)}
                              className="w-7 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors border-r border-gray-200 cursor-pointer text-xs font-medium">
                              <Minus size={10} strokeWidth={2.5} />
                            </button>
                            <input type="number" min="1" value={item.quantity}
                              onChange={(e) => handleQtyDirectChange(item.sku, e.target.value)}
                              className="w-8 text-center text-xs font-semibold text-gray-800 bg-transparent border-0 outline-none p-0 focus:ring-0 select-all" />
                            <button type="button" onClick={() => updateQuantity(item.sku, 1)}
                              className="w-7 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors border-l border-gray-200 cursor-pointer text-xs font-medium">
                              <Plus size={10} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wide">{item.unit || "PCS"}</div>
                      <div className="col-span-1 text-center">
                        <input type="number" min="0" max="100" value={item.discount || 0}
                          onChange={(e) => updateLineDiscount(item.sku, e.target.value)}
                          className="w-12 text-center text-xs text-red-600 font-semibold bg-red-50/50 border rounded py-1 px-1 outline-none focus:border-red-300 focus:bg-white transition-colors text-[11px]" />
                      </div>
                      <div className="col-span-1 text-center text-[14px] text-gray-800 font-medium">{(item.tax || 0).toFixed(2)}</div>
                      <div className="col-span-1 pr-1 text-right text-[14px] font-bold text-gray-800">{calculateLineTotal(item).toFixed(2)}</div>
                      <div className="col-span-1 text-center">
                        <div className="flex items-center justify-center">
                          <button type="button" onClick={() => removeItem(item.sku)}
                            className="w-12 h-7 rounded border border-red-150 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 flex items-center justify-center cursor-pointer transition-all shadow-xs"
                            title="Remove Item">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Cart */}
            {cart.length > 0 && (
              <div className="p-4 px-6 bg-white border-t border-gray-100 flex justify-start shrink-0">
                <button type="button" onClick={() => setCart([])}
                  className="h-10 px-4 bg-white hover:bg-red-50/40 border border-red-200 hover:border-red-300 rounded-lg text-red-500 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
                  <Trash2 size={14} className="text-red-500" strokeWidth={2.5} />
                  <span>Clear Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - CHECKOUT */}
        <div className="w-80 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-xs">
          <div className="flex-1 overflow-y-auto pos-scroll p-4 space-y-4">
            {/* Customer Section */}
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-700 uppercase tracking-wide">
                  <User size={13} className="text-emerald-500" />
                  Customer Lookup
                </div>
                {/* Responsive New Customer button on customer check desk */}
                <button
                  type="button"
                  onClick={handleOpenAddCustomerModal}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold rounded flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:shadow-1xs"
                >
                  <UserPlus size={11} className="text-emerald-600" />
                  <span>+ New Cust</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Mobile Number Input */}
                <div>
                  <label className="text-[10px] icon-label font-semibold text-gray-400 uppercase tracking-wide block mb-1">Mobile Number Lookup</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" maxLength={10} value={customerMobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setCustomerMobile(val);
                        const found = customers.find(c => c.mobile === val);
                        if (found) {
                          setCustomerName(found.name);
                          setIsNewCustomer(false);
                        } else {
                          setCustomerName("");
                          setIsNewCustomer(true);
                        }
                      }}
                      placeholder="Type 10-digit number"
                      className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-16 text-xs font-semibold text-gray-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-mono" />
                    {customerMobile.length === 10 && !isNewCustomer && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-sans">Linked</span>
                    )}
                    {customerMobile.length === 10 && isNewCustomer && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded uppercase font-sans">Unknown</span>
                    )}
                  </div>
                </div>

                {/* Customer Name Input (Shown ONLY if 10-digit mobile is registered in customer database) */}
                {customerMobile.length === 10 && !isNewCustomer && customerName && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide block mb-1">Linked Customer Name</label>
                    <div className="w-full h-9 bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 flex items-center justify-between text-xs font-bold text-gray-800">
                      <span className="truncate">{customerName}</span>
                      <span className="text-[9px] text-emerald-600 font-normal">Active Base</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
                <CreditCard size={13} className="text-emerald-500" />
                Payment Method <span className="text-red-500 text-sm">*</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => { setPaymentMethod(opt.value); setPaymentMethodError(false); }}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border-2 cursor-pointer transition-all
                      ${paymentMethod === opt.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                      }`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {paymentMethodError && (
                <p className="text-[11px] text-red-500 bg-red-50 border border-red-100 rounded-md px-2.5 py-1.5 mt-2 font-medium">
                  * Payment method is required.
                </p>
              )}
            </div>

            {/* Discount */}
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
                <Percent size={13} className="text-emerald-500" />
                Discount
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Flat Invoice Discount (₹)</span>
                <input type="number" min="0" value={globalDiscount || ""}
                  onChange={(e) => setGlobalDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-20 h-8 text-right bg-gray-50 border border-gray-200 rounded px-2.5 text-xs text-gray-800 outline-none focus:border-emerald-400 transition-colors" />
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Item Subtotal</span>
                <span className="text-xs font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Discounts</span>
                <span className="text-xs font-semibold text-emerald-600">-₹{totalLineDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Tax (Integrated GST)</span>
                <span className="text-xs font-semibold text-gray-800">₹{totalTax.toFixed(2)}</span>
              </div>
              {globalDiscount > 0 && (
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                  <span className="text-xs text-gray-600">Flat Savings</span>
                  <span className="text-xs font-semibold text-emerald-600">-₹{globalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-gray-300 pt-3 mt-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Grand Payable</span>
                <span className="text-2xl font-bold text-emerald-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="p-3 border-t border-gray-200 flex flex-col gap-2 bg-gray-50">
            <button type="button" onClick={handleCompleteSale}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors shadow-sm">
              <CheckCircle size={16} /> Complete Checkout Sale
            </button>
          </div>
        </div>
      </div>

      {/* INVOICE MODAL */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        invoice={activeInvoice}
        onClose={resetBillingStateComplete}
        onCloseAction={resetBillingStateComplete}
        title="Sales Invoice Created"
        closeActionText="New Transaction"
        showToast={showToast}
      />

      {/* CUSTOMER DIRECT REGISTER MODAL */}
      <AddCustomerModal
        isOpen={showAddCustModal}
        onClose={() => setShowAddCustModal(false)}
        initialMobile={customerMobile}
        existingCustomers={customers}
        onSaveCustomer={handleSaveNewCustomer}
      />

      {/* Custom Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[250] max-w-sm bg-slate-900 border border-slate-800 text-white px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 no-print">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            toast.type === "success" ? "bg-emerald-500" :
            toast.type === "warning" ? "bg-amber-500" :
            toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
          }`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

    </div>
  );
};

export default POSBilling;
