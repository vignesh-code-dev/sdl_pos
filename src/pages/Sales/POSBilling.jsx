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
  import InvoiceModal from "../../components/invoices/InvoiceModal";
  import AddCustomerModal from "../../components/people/AddCustomerModal";

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
      let activeProducts = [];
      if (!savedProducts || JSON.parse(savedProducts).length === 0) {
        const initialSeededProducts = [
          { name: "Water Bottle 1L", sku: "103", category: "Beverages", costPrice: 10, sellingPrice: 20, margin: 100, discount: 0, tax: 0, unit: "LITRE" },
          { name: "Coca Cola 500ml", sku: "104", category: "Beverages", costPrice: 25, sellingPrice: 45, margin: 80, discount: 0, tax: 0, unit: "PCS" },
          { name: "Dairy Milk 13g", sku: "SKU1234", category: "Confectionery", costPrice: 10, sellingPrice: 20, margin: 50, discount: 0, tax: 0, unit: "pcs" },
          { name: "Lays Classic 25g", sku: "SKU3697", category: "Snacks", costPrice: 5, sellingPrice: 10, margin: 100, discount: 0, tax: 0, unit: "pcs" },
          { name: "Bisleri 500ml", sku: "SKU1353", category: "Beverages", costPrice: 12, sellingPrice: 18, margin: 50, discount: 0, tax: 0, unit: "pcs" },
          { name: "Parle-G 55g", sku: "SKU6789", category: "Biscuits", costPrice: 6, sellingPrice: 10, margin: 66.7, discount: 0, tax: 0, unit: "pcs" },
          { name: "Ponni Rice", sku: "RICE001", category: "Groceries", costPrice: 45, sellingPrice: 60, margin: 25, discount: 0, tax: 0, unit: "kg" },
          { name: "Toor Dal", sku: "DAL001", category: "Groceries", costPrice: 90, sellingPrice: 120, margin: 25, discount: 0, tax: 0, unit: "kg" },
          { name: "Organic Apples", sku: "FRUIT01", category: "Fruits", costPrice: 110, sellingPrice: 150, margin: 26.7, discount: 0, tax: 0, unit: "kg" }
        ];
        localStorage.setItem("billmate_products", JSON.stringify(initialSeededProducts));
        activeProducts = initialSeededProducts;
        setProducts(initialSeededProducts);
      } else {
        activeProducts = JSON.parse(savedProducts);
        setProducts(activeProducts);
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

      // Prepopulate starting cart if no cart was previously chosen
      let savedCart = localStorage.getItem("billmate_last_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } 

      if (searchInputRef.current) searchInputRef.current.focus();
    }, []);

    const isDecimalUnit = (unit) => {
      if (!unit) return false;
      const u = unit.toLowerCase().trim();
      return u === "kg" || u === "kilogram" || u === "liter" || u === "litre" || u === "ltr";
    };

    const parseSearchInput = (input) => {
      const trimmed = input.trim();
      if (!trimmed) return { targetSku: "", targetQty: 1 };
      
      if (trimmed.includes("*")) {
        const parts = trimmed.split("*");
        if (parts.length >= 2) {
          const part0 = parts[0].trim();
          const part1 = parts[1].trim();
          
          // 1. If one of them is an exact SKU or name match in products, that's the SKU!
          const product0 = products.find(p => p.sku.toLowerCase() === part0.toLowerCase() || p.name.toLowerCase() === part0.toLowerCase());
          const product1 = products.find(p => p.sku.toLowerCase() === part1.toLowerCase() || p.name.toLowerCase() === part1.toLowerCase());
          
          if (product0 && !product1) {
            const isDec = isDecimalUnit(product0.unit);
            return { targetSku: part0, targetQty: isDec ? (parseFloat(part1) || 1) : (parseInt(part1) || 1) };
          }
          if (product1 && !product0) {
            const isDec = isDecimalUnit(product1.unit);
            return { targetSku: part1, targetQty: isDec ? (parseFloat(part0) || 1) : (parseInt(part0) || 1) };
          }
          
          // 2. If one of them is a partial SKU/name match (includes)
          const partial0 = products.find(p => p.sku.toLowerCase().includes(part0.toLowerCase()) || p.name.toLowerCase().includes(part0.toLowerCase()));
          const partial1 = products.find(p => p.sku.toLowerCase().includes(part1.toLowerCase()) || p.name.toLowerCase().includes(part1.toLowerCase()));
          
          if (partial0 && !partial1) {
            const isDec = isDecimalUnit(partial0.unit);
            return { targetSku: part0, targetQty: isDec ? (parseFloat(part1) || 1) : (parseInt(part1) || 1) };
          }
          if (partial1 && !partial0) {
            const isDec = isDecimalUnit(partial1.unit);
            return { targetSku: part1, targetQty: isDec ? (parseFloat(part0) || 1) : (parseInt(part0) || 1) };
          }
          
          // 3. Fallback: Check if one of them is number (integer or decimal) and the other has length advantages, or look at standard order.
          const part0IsNum = /^\d+(\.\d+)?$/.test(part0);
          const part1IsNum = /^\d+(\.\d+)?$/.test(part1);
          
          if (part0IsNum && !part1IsNum) {
            const matchedProd = products.find(p => p.sku.toLowerCase().includes(part1.toLowerCase()) || p.name.toLowerCase().includes(part1.toLowerCase()));
            const isDec = isDecimalUnit(matchedProd?.unit);
            return { targetSku: part1, targetQty: isDec ? (parseFloat(part0) || 1) : (parseInt(part0) || 1) };
          }
          if (part1IsNum && !part0IsNum) {
            const matchedProd = products.find(p => p.sku.toLowerCase().includes(part0.toLowerCase()) || p.name.toLowerCase().includes(part0.toLowerCase()));
            const isDec = isDecimalUnit(matchedProd?.unit);
            return { targetSku: part0, targetQty: isDec ? (parseFloat(part1) || 1) : (parseInt(part1) || 1) };
          }
          
          if (part0IsNum && part1IsNum) {
            const num0 = parseFloat(part0);
            const num1 = parseFloat(part1);
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
      const isDecimal = isDecimalUnit(product.unit || product.unitType);
      const qtyNum = isDecimal ? (parseFloat(qty) || 1) : (parseInt(qty) || 1);
      setCart(prevCart => {
        const existingIdx = prevCart.findIndex(item => item.sku === product.sku);
        const currentRate = parseFloat(product.sellingPrice) || parseFloat(product.rate) || 0;
        const currentTax = parseFloat(product.tax) || 0;
        const currentDiscount = parseFloat(product.discount) || 0;
        if (existingIdx > -1) {
          const updated = prevCart.map((item, idx) => {
            if (idx === existingIdx) {
              const currentQty = parseFloat(item.quantity) || 0;
              const nextQty = currentQty + qtyNum;
              return {
                ...item,
                quantity: isDecimal ? parseFloat(nextQty.toFixed(3)) : Math.round(nextQty)
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
          const isDecimal = isDecimalUnit(item.unit || item.unitType);
          const currentQty = parseFloat(item.quantity) || 0;
          const actualDelta = isDecimal ? (delta === 1 ? 0.1 : delta === -1 ? -0.1 : delta) : delta;
          const updatedQty = currentQty + actualDelta;
          const minQty = isDecimal ? 0.001 : 1;
          if (updatedQty >= minQty) {
            return {
              ...item,
              quantity: isDecimal ? parseFloat(updatedQty.toFixed(3)) : Math.round(updatedQty)
            };
          }
        }
        return item;
      }));
    };

    const handleQtyDirectChange = (sku, val) => {
      setCart(prev => prev.map(item => {
        if (item.sku === sku) {
          const isDecimal = isDecimalUnit(item.unit || item.unitType);
          if (isDecimal) {
            return { ...item, quantity: val };
          } else {
            const numeric = parseInt(val) || 0;
            return { ...item, quantity: Math.max(0, numeric) };
          }
        }
        return item;
      }));
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
      const qty = parseFloat(item.quantity) || 0;
      const base = item.rate * qty;
      const afterDiscount = base - base * (item.discount / 100);
      const taxAmount = afterDiscount * (item.tax / 100);
      return afterDiscount + taxAmount;
    };

    const subtotal = cart.reduce((sum, item) => sum + item.rate * (parseFloat(item.quantity) || 0), 0);
    const totalLineDiscount = cart.reduce((sum, item) => sum + (item.rate * (parseFloat(item.quantity) || 0) * (item.discount / 100)), 0);
    const totalTax = cart.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const base = (item.rate * qty) - (item.rate * qty * (item.discount / 100));
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
        customerName: customerRefName, customerMobile: customerMobile || "Walk-In",
        items: cart.map(item => ({ ...item, quantity: parseFloat(item.quantity) || 0 })),
        subtotal, totalLineDiscount, totalTax, globalDiscount, grandTotal,
        paidAmount: paymentMethod === "CREDIT" ? 0 : grandTotal,
        balance: paymentMethod === "CREDIT" ? grandTotal : 0,
        status: "Active", returns: [],
        operator: "admin", paymentMethod
      };

      if (paymentMethod === "CREDIT") {
        try {
          const rawAccounts = localStorage.getItem("billmate_deposit_accounts");
          let accountsList = rawAccounts ? JSON.parse(rawAccounts) : [];
          const identifier = customerMobile || "Walk-In";
          let targetIndex = accountsList.findIndex(
            acc => acc.customerMobile === identifier || 
            (receiptObj.customerMobile && acc.customerMobile === receiptObj.customerMobile)
          );
          
          const txObj = {
            id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
            date: formattedDate,
            type: "CREDIT",
            amount: grandTotal,
            description: `POS purchase on Credit (${receiptObj.id})`
          };

          if (targetIndex !== -1) {
            const acc = accountsList[targetIndex];
            acc.creditGiven = (acc.creditGiven || 0) + grandTotal;
            acc.outstanding = (acc.outstanding || 0) + grandTotal;
            acc.transactions = [txObj, ...(acc.transactions || [])];
            accountsList[targetIndex] = acc;
          } else {
            // Create a default account if not found
            const newAcc = {
              customerId: `C-${Date.now()}`,
              customerName: customerRefName || "Walk-In Client",
              customerMobile: identifier,
              creditLimit: 20000,
              creditGiven: grandTotal,
              paymentsReceived: 0,
              outstanding: grandTotal,
              transactions: [txObj]
            };
            accountsList.push(newAcc);
          }
          localStorage.setItem("billmate_deposit_accounts", JSON.stringify(accountsList));
        } catch (e) {
          console.error("Failed to sync credit account transaction", e);
        }
      }

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
    const totalQty = cart.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0);
    const totalDiscount = totalLineDiscount + globalDiscount;

    const hasMixedUnits = (() => {
      if (cart.length === 0) return false;
      const firstUnit = (cart[0].unit || "pcs").toLowerCase().trim();
      return cart.some(item => {
        const u = (item.unit || "pcs").toLowerCase().trim();
        return u !== firstUnit;
      });
    })();

    const paymentOptions = [
      { value: "CASH", label: "Cash", icon: <Wallet size={16} /> },
      { value: "CARD", label: "Card", icon: <CreditCard size={16} /> },
      { value: "UPI", label: "UPI", icon: <Smartphone size={16} /> },
      { value: "BANK", label: "Bank Transfer", icon: <Building2 size={16} /> },
       { value: "CREDIT", label: "Credit", icon: <Receipt size={16} /> },
    ];

    return (
      <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
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
          <div className="flex flex-col flex-1 overflow-hidden gap-4">
            {/* Search Bar */}
            <form onSubmit={handleProductSearchSubmit} className="relative flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={14} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onKeyDown={handleSearchKeys}
                  onChange={(e) => { setSearchInput(e.target.value); setFocusedSuggestionIndex(-1); }}
                  placeholder="Type product name, SKU or scan barcode..."
                  className="w-full h-9 bg-white border border-gray-200 rounded pl-10 pr-16 text-sm text-gray-700 placeholder-gray-400 font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all shadow-2xs"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchInput && (
                    <button type="button" onClick={() => { setSearchInput(""); setFocusedSuggestionIndex(-1); }}
                      className="text-gray-400 hover:text-gray-600 p-1 bg-transparent border-0 cursor-pointer">
                      <X size={13} />
                    </button>
                  )}
                  <div className="h-6 w-6 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-500">
                    <Barcode size={13} />
                  </div>
                </div>
              </div>
              <button type="submit"
                className="h-9 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-2 cursor-pointer border-0 transition-colors shadow-xs">
                <Search size={13} />
                Search
              </button>
  
              {/* Autocomplete dropdown */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-13 left-0 right-24 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-200">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Suggestions</span>
                    <span className="text-[9px] text-gray-400">↑↓ Enter to select</span>
                  </div>
                  {filteredSuggestions.map((p, idx) => (
                    <div key={p.sku}
                      onClick={() => { addItemToCart(p, suggestQty); setSearchInput(""); setFocusedSuggestionIndex(-1); }}
                      onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                      className={`px-3 py-2.5 cursor-pointer flex items-center justify-between border-b border-gray-100 transition-colors ${focusedSuggestionIndex === idx ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-xs  text-gray-700">{p.sku}</div>
                        <div className="text-xs font-bold text-gray-700 truncate">{p.name}</div>
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold ml-2">₹{parseFloat(p.sellingPrice || p.rate || 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </form>
  
            {/* Cart Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded p-4 border border-gray-150 shadow-2xs">
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">ITEMS</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</div>
              </div>
              <div className="bg-white rounded p-4 border border-gray-150 shadow-2xs">
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">QUANTITY</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{Number(totalQty.toFixed(3))}</div>
              </div>
              <div className="bg-white rounded p-4 border border-gray-150 shadow-2xs">
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">SUBTOTAL</div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">₹{subtotal.toFixed(2)}</div>
              </div>
              <div className="bg-white rounded p-4 border border-gray-150 shadow-2xs">
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">DISCOUNT</div>
                <div className="text-3xl font-bold text-red-600 mt-1">₹{totalDiscount.toFixed(2)}</div>
              </div>
            </div>
              
            {/* Cart Table */}
            <div className="flex-1 bg-white border border-gray-200 rounded overflow-hidden flex flex-col shadow-3xs">
              {/* Header with solid primary green background to match image */}
              <div className="bg-emerald-600 px-4 py-3.5 grid grid-cols-12 gap-4 text-[12px] font-bold text-white uppercase tracking-wider items-center">
                <div className="col-span-1 text-center">S.No</div>
                <div className="col-span-3 text-left">PRODUCT DETAILS</div>
                <div className="col-span-1 text-center">RATE ₹</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-1 text-center">UNIT</div>
                <div className="col-span-1 text-center">DISC %</div>
                <div className="col-span-1 text-center">TAX ₹</div>
                <div className="col-span-1 text-right">AMOUNT</div>
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
                        <div className="col-span-1 text-[15px] text-gray-800 font-bold text-center">{idx + 1}</div>
                        <div className="col-span-3 text-left">
                          <div className="text-[16px] font-bold text-slate-800 leading-tight">{item.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">{item.sku}</div>
                        </div>
                        <div className="col-span-1 text-center text-[16px] font-bold text-slate-700">{item.rate.toFixed(2)}</div>
                        <div className="col-span-2">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center border border-gray-250 rounded bg-white h-8 overflow-hidden shadow-2xs hover:border-gray-400 transition-colors">
                              <button type="button" onClick={() => updateQuantity(item.sku, -1)}
                                className="w-7 h-full flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors border-r border-gray-250 cursor-pointer text-xs font-semibold">
                                <Minus size={10} strokeWidth={3} />
                              </button>
                              <input type="number" 
                                min={isDecimalUnit(item.unit || item.unitType) ? "0.001" : "1"} 
                                step={isDecimalUnit(item.unit || item.unitType) ? "any" : "1"} 
                                value={item.quantity}
                                onChange={(e) => handleQtyDirectChange(item.sku, e.target.value)}
                                className="w-8 text-center text-[14px] font-bold text-gray-800 bg-transparent border-0 outline-none p-0 focus:ring-0 select-all" />
                              <button type="button" onClick={() => updateQuantity(item.sku, 1)}
                                className="w-7 h-full flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors border-l border-gray-250 cursor-pointer text-xs font-semibold">
                                <Plus size={10} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-1 text-center text-[14px] font-bold text-slate-500 uppercase tracking-wider">{item.unit || "PCS"}</div>
                        <div className="col-span-1 text-center flex justify-center">
                          <input type="number" min="0" max="100" value={item.discount || 0}
                            onChange={(e) => updateLineDiscount(item.sku, e.target.value)}
                            className="w-12 text-center text-[14px] text-red-600 font-extrabold bg-white border border-red-300 rounded py-1 px-1 outline-none focus:border-red-500 transition-colors" />
                        </div>
                        <div className="col-span-1 text-center text-[16px] text-slate-700 font-bold">{(item.tax || 0).toFixed(2)}</div>
                        <div className="col-span-1 pr-1 text-right text-[16px] font-bold text-slate-800">{calculateLineTotal(item).toFixed(2)}</div>
                        <div className="col-span-1 text-center">
                          <div className="flex items-center justify-center">
                            <button type="button" onClick={() => removeItem(item.sku)}
                              className="w-7 h-7 rounded border border-red-300 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                              title="Remove Item">
                              <X size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom bar with Clear Cart and Stats always layout-aligned */}
              <div className="p-4 px-6 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
                <button type="button" onClick={() => setCart([])}
                  disabled={cart.length === 0}
                  className="h-10 px-4 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 border border-red-200 hover:border-red-300 rounded-lg text-red-600 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs">
                  <Trash2 size={13} className="text-red-500" strokeWidth={2.5} />
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - CHECKOUT */}
          <div className="w-[350px] bg-white border border-gray-200 rounded flex flex-col overflow-hidden shadow-3xs shrink-0">
            <div className="flex-1 overflow-y-auto pos-scroll p-4 space-y-4">
              {/* Customer Section */}
              <div>
                <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase">
                    <User size={14} className="text-emerald-600" />
                    CUSTOMER DETAILS
                  </div>
                  {/* Clean inline outline + New button */}
                  <button
                    type="button"
                    onClick={handleOpenAddCustomerModal}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-500 hover:border-emerald-600 text-[10px] font-extrabold rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-3xs"
                  >
                    <span>+ NEW CUSTOMER</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Mobile Number Input */}
                  <div>
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
                        placeholder="Search customer by mobile number..."
                        className="w-full h-10 bg-slate-50 hover:bg-slate-100/60 border border-gray-200 rounded pl-9 pr-14 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50/55 transition-all font-sans" />
                      {customerMobile.length === 10 && !isNewCustomer && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Linked</span>
                      )}
                      {customerMobile.length === 10 && isNewCustomer && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded uppercase">New</span>
                      )}
                    </div>
                  </div>
                  {/* Customer Name Input (Shown ONLY if 10-digit mobile is registered in customer database) */}
                  {customerMobile.length === 10 && !isNewCustomer && customerName && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <div className="w-full h-9 bg-emerald-50/50 border border-emerald-100 rounded pl-9 pr-4 flex items-center justify-between text-[13px] font-bold text-slate-800">
                          <span className="truncate">{customerName}</span>
                          <span className=" absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] rounded text-emerald-700 font-extrabold uppercase border bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 ">Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Name Input (Shown ONLY if 10-digit mobile is new / not registered yet) */}
                  {customerMobile.length === 10 && isNewCustomer && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter new customer name..."
                          className="w-full h-10 bg-slate-50 hover:bg-slate-100/60 border border-gray-200 rounded pl-9 pr-4 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50/55 transition-all font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Payment Method */}
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase  mb-2 border-b border-slate-100 pb-2">
                  <CreditCard size={14} className="text-emerald-600" />
                  PAYMENT METHOD <span className="text-red-500 font-black text-xs">*</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {paymentOptions.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => { setPaymentMethod(opt.value); setPaymentMethodError(false); }}
                      className={`flex items-center justify-start gap-3 px-3 py-3 rounded text-[11px] font-extrabold border cursor-pointer transition-all
                        ${paymentMethod === opt.value
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-3xs"
                          : "border-gray-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-700 shadow-5xs"
                        }`}>
                      <span className={paymentMethod === opt.value ? "text-emerald-600" : "text-slate-400"}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                {paymentMethodError && (
                  <p className="text-[11px] text-red-500 bg-red-50 border border-red-100 rounded px-2.5 py-1.5 mt-2 font-semibold">
                    * Payment method is required.
                  </p>
                )}
              </div>

              {/* Discount */}
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                  <Percent size={14} className="text-emerald-600" />
                  DISCOUNT
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Flat Invoice Discount (₹)</label>
                  <input type="number" min="0" value={globalDiscount || ""}
                    onChange={(e) => setGlobalDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full h-10 text-left bg-slate-50 hover:bg-slate-100/60 border border-gray-200 rounded px-3.5 text-xs font-extrabold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/55 transition-all" />
                </div>
              </div>

              {/* Totals */}
              <div className="bg-slate-50/80 rounded p-4 space-y-2 border border-slate-150">
                <div className="flex justify-between items-center text-[15px] font-semibold text-slate-500">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-[14px] text-slate-800">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] font-semibold text-slate-500">
                  <span>Tax (Integrated GST)</span>
                  <span className="font-bold text-[14px] text-slate-800">₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] font-semibold text-slate-500">
                  <span>Discounts</span>
                  <span className="font-bold text-[14px] text-red-600">-₹{totalLineDiscount.toFixed(2)}</span>
                </div>
                
                {globalDiscount > 0 && (
                  <div className="flex justify-between items-center text-[15px] font-semibold text-slate-500 border-t border-slate-200/60 pt-2">
                    <span>Flat Savings</span>
                    <span className="font-extrabold text-red-600">-₹{globalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-slate-250 pt-3 ">
                  <span className="text-[16px] font-black text-slate-700 uppercase">GRAND PAYABLE</span>
                  <span className="text-[18px] font-black text-emerald-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="p-3.5 border-t border-gray-100 bg-slate-50/20">
              <button type="button" onClick={handleCompleteSale}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[13px] font-black flex items-center justify-center gap-2 cursor-pointer border-0 transition-colors shadow-xl uppercase tracking-wider">
                <CheckCircle size={16} strokeWidth={2.5} /> Complete Checkout
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
