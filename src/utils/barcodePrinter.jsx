import JsBarcode from "jsbarcode";

/**
 * Validates whether a value has 13 numeric digits and matches EAN-13 checksum logic
 */
export function isValidEAN13Checksum(val) {
  if (!val || !/^\d{13}$/.test(val)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(val[i], 10);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(val[12], 10);
}

/**
 * Detects appropriate barcode type (EAN13 for 13 digit valid barcodes, else CODE128)
 */
export function getBarcodeFormat(value) {
  if (value && /^\d{13}$/.test(value)) {
    if (isValidEAN13Checksum(value)) {
      return "EAN13";
    }
  }
  return "CODE128";
}

/**
 * Generates a unique 13-digit EAN-13 barcode using the standard supermarket's internal
 * retail prefix "200" followed by 9 random digits and a computed EAN-13 check digit.
 * Accepts either an Array of products or a Set of existing barcode strings.
 */
export function generateEAN13Barcode(existingCodeSource = []) {
  let existingBarcodes;
  if (existingCodeSource instanceof Set) {
    existingBarcodes = existingCodeSource;
  } else if (Array.isArray(existingCodeSource)) {
    existingBarcodes = new Set(
      existingCodeSource
        .map((p) => p.barcode?.trim())
        .filter(Boolean)
    );
  } else {
    existingBarcodes = new Set();
  }

  let attempts = 0;
  while (attempts < 1000) {
    const prefix = "200";
    let body = "";
    for (let i = 0; i < 9; i++) {
      body += Math.floor(Math.random() * 10).toString();
    }
    const twelveDigits = prefix + body;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(twelveDigits[i], 10);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const finalBarcode = twelveDigits + checkDigit.toString();

    if (!existingBarcodes.has(finalBarcode)) {
      return finalBarcode;
    }
    attempts++;
  }
  
  // High reliability fallback using portion of Timestamp
  let fallbackAttempts = 0;
  while (fallbackAttempts < 100) {
    const timestampPart = (Date.now() + Math.floor(Math.random() * 1000)).toString().slice(-12);
    const twelve = timestampPart.padStart(12, "0");
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(twelve[i], 10);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const finalBarcode = twelve + checkDigit.toString();
    if (!existingBarcodes.has(finalBarcode)) {
      return finalBarcode;
    }
    fallbackAttempts++;
  }

  return "200" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Synchronously generates an SVG markup string for a barcode using JsBarcode
 */
export function generateBarcodeSVGString(value, format = "CODE128") {
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, value, {
      format: format,
      width: 2,
      height: 44,
      displayValue: false,
      margin: 0,
    });
    // Ensure standard namespaces and classes on the svg are set cleanly
    svg.setAttribute("class", "mx-auto w-full max-h-12");
    return new XMLSerializer().serializeToString(svg);
  } catch (error) {
    console.error("Failed to generate SVG barcode with format:", format, "value:", value, error);
    try {
      // Graceful fallback to general CODE128
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      JsBarcode(svg, value, {
        format: "CODE128",
        width: 2,
        height: 44,
        displayValue: false,
        margin: 0,
      });
      svg.setAttribute("class", "mx-auto w-full max-h-12");
      return new XMLSerializer().serializeToString(svg);
    } catch (fallbackError) {
      console.error("CODE128 fallback failed as well:", fallbackError);
      return `<div class="text-red-500 font-bold font-sans text-[10px] uppercase my-1 p-2 border border-red-200 bg-red-50 rounded">Barcode Error</div>`;
    }
  }
}

/**
 * Pre-processes products on startup to ensure that they all contain a unique barcode.
 * Guarantees zero barcode sharing across all items.
 */
export function ensureBarcodes(products) {
  if (!products || !Array.isArray(products)) return [];

  const usedBarcodes = new Set();
  let changed = false;

  // First pass: identify and preserve non-duplicate valid barcodes
  const verifiedProducts = products.map((p) => {
    const code = p.barcode?.trim();
    if (code && !usedBarcodes.has(code)) {
      usedBarcodes.add(code);
      return { ...p, barcode: code };
    } else {
      // Missing or duplicate barcode: mark clearly for generation
      return { ...p, barcode: "" };
    }
  });

  // Second pass: dynamically allocate unique barcodes to any blanks, updating usedBarcodes Set instantly
  const updatedProducts = verifiedProducts.map((p) => {
    let changedObj = { ...p };
    if (!changedObj.barcode) {
      const generated = generateEAN13Barcode(usedBarcodes);
      usedBarcodes.add(generated);
      changed = true;
      changedObj.barcode = generated;
    }
    if (changedObj.currentStock === undefined || changedObj.currentStock === null) {
      changedObj.currentStock = 0;
      changed = true;
    }
    if (changedObj.minStock === undefined || changedObj.minStock === null) {
      changedObj.minStock = 0;
      changed = true;
    }
    return changedObj;
  });

  if (changed) {
    localStorage.setItem("billmate_products", JSON.stringify(updatedProducts));
  }
  return updatedProducts;
}

/**
 * Helper to check if unit uses decimals (e.g. kg, litre).
 */
export const isDecimalUnit = (unit) => {
  const u = (unit || "pcs").toLowerCase().trim();
  return u === "kg" || u === "litre" || u === "ltr" || u === "litres" || u === "l";
};

/**
 * Validates inventory levels against a cart and deducts quantities.
 * Returns { success: true } or { success: false, error: "Error details..." }
 */
export function verifyAndDeductStock(cartItems) {
  if (!cartItems || !Array.isArray(cartItems)) return { success: true };

  // Read latest master product array to enforce multi-device consistency
  const savedProducts = localStorage.getItem("billmate_products");
  const products = ensureBarcodes(savedProducts ? JSON.parse(savedProducts) : []);

  // 1. Validation phase (Negative stock check)
  for (const item of cartItems) {
    const qtyToDuct = parseFloat(item.quantity) || 0;
    if (qtyToDuct <= 0) continue;

    // Match product using SKU or Barcode
    const matched = products.find(
      (p) =>
        p.sku === item.sku ||
        (item.barcode && p.barcode?.trim().toLowerCase() === item.barcode.trim().toLowerCase())
    );

    if (!matched) {
      return {
        success: false,
        error: `Product "${item.name}" (SKU: ${item.sku}) could not be located in active inventory!`
      };
    }

    const availableStock = matched.currentStock !== undefined ? matched.currentStock : 0;
    if (availableStock < qtyToDuct) {
      return {
        success: false,
        error: `Insufficient Stock! Product "${matched.name}" has only ${availableStock} ${matched.unit || "pcs"} available, but you are trying to bill ${qtyToDuct} ${item.unit || "pcs"}.`
      };
    }
  }

  // 2. Deduction phase (Commit changes)
  const updatedProducts = products.map((p) => {
    // Find matching item in cart
    const cartItem = cartItems.find(
      (item) =>
        item.sku === p.sku ||
        (item.barcode && p.barcode?.trim().toLowerCase() === item.barcode.trim().toLowerCase())
    );

    if (cartItem) {
      const deductQty = parseFloat(cartItem.quantity) || 0;
      let nextStock = (p.currentStock !== undefined ? p.currentStock : 0) - deductQty;
      
      if (isDecimalUnit(p.unit)) {
        nextStock = parseFloat(nextStock.toFixed(3));
      } else {
        nextStock = Math.round(nextStock);
      }
      if (nextStock < 0) nextStock = 0;

      return {
        ...p,
        currentStock: nextStock
      };
    }
    return p;
  });

  localStorage.setItem("billmate_products", JSON.stringify(updatedProducts));
  
  // Dispatch custom event for real-time reactive UI update in the same browser tab
  window.dispatchEvent(new Event("billmate_stock_update"));

  return { success: true, updatedProducts };
}

/**
 * Restores sold quantities back to product stock (handling decimal/whole numbers).
 */
export function restoreStock(itemsToRestore) {
  if (!itemsToRestore || !Array.isArray(itemsToRestore) || itemsToRestore.length === 0) return;

  const savedProducts = localStorage.getItem("billmate_products");
  const products = ensureBarcodes(savedProducts ? JSON.parse(savedProducts) : []);

  const updatedProducts = products.map((p) => {
    const restoreItem = itemsToRestore.find(
      (item) =>
        item.sku === p.sku ||
        (item.barcode && p.barcode?.trim().toLowerCase() === item.barcode.trim().toLowerCase())
    );

    if (restoreItem) {
      const restoreQty = parseFloat(restoreItem.quantity !== undefined ? restoreItem.quantity : restoreItem.quantityReturned) || 0;
      if (restoreQty <= 0) return p;

      let nextStock = (p.currentStock !== undefined ? p.currentStock : 0) + restoreQty;
      
      if (isDecimalUnit(p.unit)) {
        nextStock = parseFloat(nextStock.toFixed(3));
      } else {
        nextStock = Math.round(nextStock);
      }

      return {
        ...p,
        currentStock: nextStock
      };
    }
    return p;
  });

  localStorage.setItem("billmate_products", JSON.stringify(updatedProducts));
  
  // Dispatch custom event for real-time reactive UI update in same browser tab
  window.dispatchEvent(new Event("billmate_stock_update"));
}

/**
 * Single or Batch Barcode Printing Sheet generator styled with Tailwind CSS
 */
export const handlePrintBarcodes = (product, quantity) => {
  if (!product) {
    alert("Please select a product first!");
    return;
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups/new windows to print barcodes!");
    return;
  }

  const value = product.barcode || product.sku || "000000";
  const format = getBarcodeFormat(value);
  const barcodeSvgString = generateBarcodeSVGString(value, format);
  
  // Build single barcode item html with real scanner-readable rendered SVG
  const barcodeHtml = `
    <div class="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-lg bg-white w-[190px] m-1.5 box-border [page-break-inside:avoid] text-center shadow-sm">
      <div class="text-[11px] font-black mb-1 font-sans text-slate-800 w-full max-w-[170px] truncate uppercase tracking-tight">
        ${product.name}
      </div>
      <div class="w-full flex justify-center items-center my-1">
        ${barcodeSvgString}
      </div>
      <div class="text-[10px] font-mono tracking-[2px] font-bold text-slate-900 mt-1">
        ${value}
      </div>
      <div class="text-[11px] font-black font-sans mt-1 text-emerald-600">
        ₹${(product.sellingPrice || 0).toFixed(2)}
      </div>
    </div>
  `;

  const gridHtml = Array(parseInt(quantity, 10))
    .fill(barcodeHtml)
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Barcodes - ${product.name}</title>
        <!-- Load Tailwind CSS Play CDN for beautiful on-the-fly rendering -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  brand: {
                    primary: '#10b981',
                    hover: '#059669',
                  }
                }
              }
            }
          }
        </script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
          @media print {
            body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background: white !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            @page { 
              size: auto; 
              margin: 0; 
            }
            .no-print { 
              display: none !important; 
            }
          }
        </style>
      </head>
      <body class="bg-slate-50 text-slate-800 font-sans p-6 min-h-screen">
        <div class="max-w-[950px] mx-auto">
          <!-- Printable Header Controls -->
          <div class="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
            <div>
              <h1 class="text-xl font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                Barcode Sheet Generator
              </h1>
              <p class="text-xs text-slate-500 font-medium mt-1">
                Print layout for <strong class="text-slate-700">${product.name}</strong>. Ready to produce <strong class="text-slate-700">${quantity}</strong> barcode tags.
              </p>
            </div>
            <button 
              class="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer self-stretch sm:self-auto"
              onclick="window.print()"
            >
              Print Labels Sheet
            </button>
          </div>
          
          <!-- Grid wrapper carrying printable components -->
          <div class="flex flex-wrap justify-start -m-1.5">
            ${gridHtml}
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};
