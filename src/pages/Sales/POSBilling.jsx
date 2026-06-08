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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Authentication hook

const POSBilling = () => {
  const { userRole } = useAuth();

  // ஸ்டேட்டுகள்
  const [products, setProducts] = useState([]); // LocalStorage தயாரிப்புகளைச் சேமிக்க
  const [cart, setCart] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const searchInputRef = useRef(null);

  // ஸ்கிரீன் லோடு ஆனதும் LocalStorage-ல் இருந்து தயாரிப்புகளை எடுக்கிறது
  useEffect(() => {
    const savedProducts = localStorage.getItem("billmate_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts([]); // லோக்கல் ஸ்டோரேஜ் காலியாக இருந்தால் காலி அர்ரே
    }

    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  // தயாரிப்பை கார்ட்டில் சேர்க்கும் முதன்மை லாஜிக் (Supports SKU*QTY & Barcode)
  const handleProductSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    let targetSku = searchInput.trim();
    let targetQty = 1;

    // ஷார்ட்கட் செக்: SKU*QTY (உதா: 1001*3) இருக்கிறதா என பார்க்கிறது
    if (targetSku.includes("*")) {
      const parts = targetSku.split("*");
      targetSku = parts[0].trim();
      targetQty = parseInt(parts[1]) || 1;
    }

    // இப்பொது லோக்கல் ஸ்டோரேஜ் தயாரிப்புகளில் (products) தேடுகிறது
    const product = products.find(
      (p) =>
        p.sku === targetSku ||
        p.name.toLowerCase().includes(targetSku.toLowerCase()),
    );

    if (product) {
      addItemToCart(product, targetQty);
      setSearchInput(""); // இன்புட்டை கிளியர் செய்கிறது
    } else {
      alert(
        "தயாரிப்பு அல்லது SKU கண்டறியப்படவில்லை! இன்வென்டரியில் உள்ளதா என சரிபார்க்கவும்.",
      );
    }
  };

  const addItemToCart = (product, qty) => {
    setCart((prevCart) => {
      const existingItemIdx = prevCart.findIndex(
        (item) => item.sku === product.sku,
      );

      // இன்வென்டரி 'sellingPrice'-ஐ விலையாக எடுத்துக்கொள்கிறது (Fallback ஆக rate)
      const currentRate =
        product.sellingPrice !== undefined
          ? product.sellingPrice
          : product.rate || 0;
      const currentTax = product.tax !== undefined ? product.tax : 0;

      // ➡️ இன்வென்டரியில் செட் செய்த டிஸ்கவுண்டை எடுக்கிறது (இல்லை என்றால் 0)
      const currentDiscount =
        product.discount !== undefined ? product.discount : 0;

      if (existingItemIdx > -1) {
        // ஏற்கனவே இருந்தால் குவாண்டிட்டியை கூட்டுகிறது (Merge Quantity)
        const newCart = [...prevCart];
        newCart[existingItemIdx].quantity += qty;
        return newCart;
      } else {
        // புதிய தயாரிப்பு என்றால் கார்ட்டில் சேர்க்கிறது
        return [
          ...prevCart,
          {
            ...product,
            rate: currentRate, // பில்லிங்கிற்கு 'rate' ஆக மாற்றப்படுகிறது
            tax: currentTax,
            quantity: qty,
            discount: currentDiscount, // ➡️ 0-க்கு பதிலாக இன்வென்டரி டிஸ்கவுண்ட் அப்ளை ஆகிறது
          },
        ];
      }
    });
  };

  // கார்ட் லைன் மேனேஜ்மென்ட் ஃபங்க்ஷன்கள்
  const updateQuantity = (sku, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.sku === sku) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }),
    );
  };

  const updateLineDiscount = (sku, discountVal) => {
    const disc = Math.min(100, Math.max(0, parseFloat(discountVal) || 0));
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.sku === sku ? { ...item, discount: disc } : item,
      ),
    );
  };

  const removeItem = (sku) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  // பில் கணக்கீடுகள் (Real-time Computations)
  const calculateLineTotal = (item) => {
    const baseAmount = item.rate * item.quantity;
    const afterDiscount = baseAmount - baseAmount * (item.discount / 100);
    const taxAmount = afterDiscount * (item.tax / 100);
    return afterDiscount + taxAmount;
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0,
  );
  const totalLineDiscount = cart.reduce(
    (sum, item) => sum + item.rate * item.quantity * (item.discount / 100),
    0,
  );
  const totalTax = cart.reduce((sum, item) => {
    const base =
      item.rate * item.quantity -
      item.rate * item.quantity * (item.discount / 100);
    return sum + base * (item.tax / 100);
  }, 0);

  const grandTotal = Math.max(
    0,
    subtotal - totalLineDiscount + totalTax - globalDiscount,
  );

  // பில்லை முடித்து இன்வாய்ஸ் உருவாக்குதல்
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert("கார்ட் காலியாக உள்ளது! பில் போட பொருட்களை சேர்க்கவும்.");
      return;
    }
    alert(
      `பில் வெற்றிகரமாக உருவாக்கப்பட்டது!\nமொத்த தொகை: ₹${grandTotal.toFixed(2)}\nஇன்வாய்ஸ் அச்சிட தயாராக உள்ளது.`,
    );
    // பில்லை ரீசெட் செய்கிறது
    setCart([]);
    setCustomerMobile("");
    setCustomerName("");
    setIsNewCustomer(false);
    setGlobalDiscount(0);
  };

  return (
    <div className="p-5 flex flex-col lg:flex-row gap-5 h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900 font-sans">
      {/* LEFT: BILLING TABLE & SEARCH */}
      <div className="flex-1 bg-pos-card border border-pos-border rounded-2xl shadow-sm p-5 flex flex-col overflow-hidden">
        {/* பார்கோடு / தேடல் பார் */}
        <form
          onSubmit={handleProductSearchSubmit}
          className="flex gap-3 mb-4 shrink-0"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Barcode size={18} className="text-brand-primary" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="SKU குறியீடு அல்லது தயாரிப்பு பெயர்... (இன்வென்டரியில் உள்ளவை வேலை செய்யும்)"
              className="w-full text-sm bg-pos-bg border border-pos-border rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-brand-primary transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </form>

        {/* பில்லிங் அட்டவணை (Billing Table) */}
        <div className="flex-1 overflow-y-auto border border-pos-border rounded-xl bg-pos-bg/20">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-pos-border">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3 text-right">Rate (₹)</th>
                <th className="py-3 px-3 text-center">Quantity</th>
                <th className="py-3 px-2 text-center">Unit</th>
                <th className="py-3 px-3 text-center w-24">Disc (%)</th>{" "}
                {/* ➡️ அகலத்தை சற்று கூட்டியுள்ளேன் */}
                <th className="py-3 px-2 text-center">Tax</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pos-border text-xs">
              {cart.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-20 text-slate-400 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart size={32} className="text-slate-300" />
                      <p>No items in the cart.</p>
                      <p className="text-[10px]">
                        Start adding products by searching above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                cart.map((item, index) => (
                  <tr
                    key={item.sku}
                    className="hover:bg-white bg-pos-card/50 transition-colors"
                  >
                    {/* தயாரிப்பு பெயர் & SKU */}
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SKU: {item.sku}
                      </div>
                    </td>
                    {/* விலை */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                      ₹{item.rate.toFixed(2)}
                    </td>
                    {/* அளவு மேலாண்மை */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, -1)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-sm text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, 1)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    {/* அலகு */}
                    <td className="py-3 px-2 text-center text-slate-500 font-medium capitalize">
                      {item.unit}
                    </td>
                    {/* ➡️ டிஸ்கவுண்ட் இன்புட் பாக்ஸ் (மாற்றப்பட்டுள்ளது) */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount || ""}
                        onChange={(e) =>
                          updateLineDiscount(item.sku, e.target.value)
                        }
                        placeholder="0"
                        className="w-full text-center font-mono font-bold text-xs bg-white border border-pos-border rounded-lg py-1 text-rose-600 focus:outline-none focus:border-rose-400"
                      />
                    </td>
                    {/* வரி */}
                    <td className="py-3 px-2 text-center font-mono font-semibold text-blue-600 bg-blue-50/30 rounded-md">
                      {item.tax}%
                    </td>
                    {/* மொத்த தொகை */}
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-800">
                      ₹{calculateLineTotal(item).toFixed(2)}
                    </td>
                    {/* நீக்கு பட்டன் */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.sku)}
                        className="text-slate-400 hover:text-brand-danger p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: BILL SUMMARY PANEL */}
      <div className="w-full lg:w-80 bg-pos-card border border-pos-border rounded-2xl shadow-sm p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="space-y-5">
          {/* வாடிக்கையாளர் இணைப்பு */}
          <div className="space-y-2 border-b border-pos-border pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Details
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-[10px] font-bold text-brand-primary flex items-center gap-1 hover:underline cursor-pointer"
              >
                <UserPlus size={12} />
                <span>{isNewCustomer ? "Existing User" : "New Customer"}</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                maxLength="10"
                value={customerMobile}
                onChange={(e) =>
                  setCustomerMobile(e.target.value.replace(/\D/g, ""))
                }
                placeholder="மொபைல் எண் (Mobile No)"
                className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary font-mono font-bold"
              />
              {isNewCustomer && (
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="வாடிக்கையாளர் பெயர் (Customer Name)"
                  className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary font-medium"
                />
              )}
            </div>
          </div>

          {/* கூடுதல் தள்ளுபடி (Global Extra Discount) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Percent size={12} className="text-brand-primary" />
              <span>Flat Invoice Discount (₹)</span>
            </label>
            <input
              type="number"
              value={globalDiscount || ""}
              onChange={(e) =>
                setGlobalDiscount(Math.max(0, parseFloat(e.target.value) || 0))
              }
              placeholder="0.00"
              className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* தொகை விவரங்கள் */}
          <div className="bg-pos-bg/40 border border-pos-border rounded-xl p-3 space-y-2.5 font-medium text-slate-600">
            <div className="flex justify-between text-xs">
              <span>Subtotal</span>
              <span className="font-mono text-slate-800">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-brand-success">
              <span>Product Discount</span>
              <span className="font-mono">
                -₹{totalLineDiscount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Tax (GST)</span>
              <span className="font-mono text-slate-800">
                ₹{totalTax.toFixed(2)}
              </span>
            </div>
            {globalDiscount > 0 && (
              <div className="flex justify-between text-xs text-brand-success">
                <span>Invoice Discount</span>
                <span className="font-mono">-₹{globalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-pos-border flex justify-between items-center text-slate-900">
              <span className="text-xs font-bold uppercase tracking-wide">
                Grand Total
              </span>
              <span className="text-xl font-black font-mono text-brand-primary">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* பில்லை இறுதி செய்யும் மெயின் பட்டன் */}
        <div className="pt-4 lg:pt-0">
          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer border border-transparent active:scale-[0.99]"
          >
            <CheckCircle size={18} />
            <span>Complete Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSBilling;
