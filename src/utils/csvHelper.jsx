import { generateEAN13Barcode } from "./barcodePrinter.jsx";

/**
 * Utility functions for exporting and importing products as CSV.
 */

/**
 * Parses raw CSV text and returns imported products and any skipped duplicate count.
 * @param {string} text - Raw content of the CSV file.
 * @param {Array} existingProducts - List of existing products to check for duplicate SKUs.
 * @returns { { importedProducts: Array, skippedCount: number } }
 */
export function parseCSV(text, existingProducts = []) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("CSV is empty or invalid!");
  }

  // Parse a CSV line correctly supporting fields wrapped in double quotes or with commas
  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        if (inQuotes && line[i + 1] === char) {
          current += char;
          i++; // Skip next quote since it's escaped
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = parseCSVLine(lines[0]);
  const cleanHeaders = rawHeaders.map((h) =>
    h.trim().replace(/^["'\uFEFF]+|["']+$/g, "")
  );

  const skuIdx = cleanHeaders.findIndex((h) => h.toLowerCase() === "sku");
  const nameIdx = cleanHeaders.findIndex((h) => h.toLowerCase() === "name");

  if (skuIdx === -1 || nameIdx === -1) {
    throw new Error("CSV must contain at least 'sku' and 'name' columns!");
  }

  const importedProducts = [];
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const rowValues = parseCSVLine(line);
    // Be flexible with row length, but must have enough columns to cover SKU and Name indexes
    if (rowValues.length < Math.max(skuIdx, nameIdx) + 1) {
      continue;
    }

    const sku = rowValues[skuIdx]?.replace(/^["']+|["']+$/g, "").trim();
    const name = rowValues[nameIdx]?.replace(/^["']+|["']+$/g, "").trim();
    if (!sku || !name) continue;

    // Check if the SKU already exists in global products or within this import batch
    const skuExists = 
      existingProducts.some((p) => String(p.sku).toLowerCase() === sku.toLowerCase()) ||
      importedProducts.some((p) => String(p.sku).toLowerCase() === sku.toLowerCase());

    if (skuExists) {
      skippedCount++;
      continue;
    }

    const getVal = (headerName, fallback = "") => {
      const idx = cleanHeaders.findIndex(
        (h) => h.toLowerCase() === headerName.toLowerCase()
      );
      if (idx === -1 || rowValues[idx] === undefined || rowValues[idx] === "") {
        return fallback;
      }
      return rowValues[idx].replace(/^["']+|["']+$/g, "").trim();
    };

    const category = getVal("category", "Groceries");
    const costPrice = parseFloat(getVal("costPrice", "0")) || 0;
    const sellingPrice = parseFloat(getVal("sellingPrice", "0")) || 0;
    const discount = parseFloat(getVal("discount", "0")) || 0;
    const tax = parseFloat(getVal("tax", "0")) || 0;
    const unit = getVal("unit", "pcs");
    let barcode = getVal("barcode", "").trim();
    const currentStock = parseFloat(getVal("currentStock", "0")) || 0;
    const minStock = parseFloat(getVal("minStock", "0")) || 0;

    // Barcode check and generation rules
    const isBarcodeInUse = (bc) => {
      if (!bc) return false;
      return (
        existingProducts.some((p) => p.barcode && String(p.barcode).trim().toLowerCase() === bc.toLowerCase()) ||
        importedProducts.some((p) => p.barcode && String(p.barcode).trim().toLowerCase() === bc.toLowerCase())
      );
    };

    if (!barcode || isBarcodeInUse(barcode)) {
      // Generate a brand new, unique EAN-13 barcode
      barcode = generateEAN13Barcode([...existingProducts, ...importedProducts]);
    }

    let margin = 0;
    if (sellingPrice > 0 && sellingPrice >= costPrice) {
      margin = parseFloat(
        (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1)
      );
    }

    importedProducts.push({
      name,
      sku,
      barcode,
      category,
      costPrice,
      sellingPrice,
      margin,
      discount,
      tax,
      unit,
      currentStock,
      minStock,
      image: "",
    });
  }

  return { importedProducts, skippedCount };
}

/**
 * Downloads products list as a structured UTF-8 CSV.
 * @param {Array} products - List of products to export.
 */
export function runExportCSV(products) {
  if (!products || products.length === 0) {
    alert("No products in inventory to export!");
    return;
  }
  const headers = ["name", "sku", "barcode", "category", "costPrice", "sellingPrice", "margin", "discount", "tax", "unit", "currentStock", "minStock"];
  const csvRows = [
    headers.join(","), // Header row
    ...products.map((p) =>
      headers
        .map((fieldName) => {
          let value = p[fieldName] !== undefined ? p[fieldName] : "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ];
  const csvContent = "\uFEFF" + csvRows.join("\n"); // Add UTF-8 BOM
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `billmate_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
