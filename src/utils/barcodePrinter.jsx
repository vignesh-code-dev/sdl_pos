/**
 * Deterministic pattern generator for pure CSS barcode stripes
 */
export const getBarcodeStripePattern = (str) => {
  let hash = 0;
  if (!str) str = "000000";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pattern = [1, 0, 1]; // Start guard
  for (let i = 0; i < 15; i++) {
    const digit = Math.abs((hash >> i) & 7);
    if (digit % 3 === 0) {
      pattern.push(1, 1, 0, 1);
    } else if (digit % 3 === 1) {
      pattern.push(1, 0, 0, 1, 1);
    } else {
      pattern.push(1, 1, 1, 0, 0, 1);
    }
    pattern.push(0); // Separator
  }
  pattern.push(1, 0, 1); // End guard
  return pattern;
};

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
  const pattern = getBarcodeStripePattern(value);
  
  // Build single barcode item html inside a flex column with elegant Tailwind spacing & border style
  const barcodeHtml = `
    <div class="flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 rounded-lg bg-white w-[190px] m-2.5 box-border [page-break-inside:avoid] text-center">
      <div class="text-[11px] font-bold mb-1.5 font-sans text-slate-800 w-full max-w-[170px] truncate">
        ${product.name}
      </div>
      <div class="flex h-[42px] w-full justify-center items-stretch bg-black mb-1 px-1 box-border">
        ${pattern.map(bit => `<div class="flex-1 ${bit ? 'bg-black' : 'bg-white'}"></div>`).join("")}
      </div>
      <div class="text-[10px] font-mono tracking-[2px] font-bold text-slate-950">
        ${value}
      </div>
      <div class="text-[11px] font-extrabold font-sans mt-1 text-emerald-600">
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
          <div class="flex flex-wrap justify-start -m-2.5">
            ${gridHtml}
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};
