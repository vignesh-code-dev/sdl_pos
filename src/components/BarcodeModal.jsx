import React, { useState, useRef, useEffect } from "react";
import { Barcode, Printer } from "lucide-react";
import JsBarcode from "jsbarcode";
import { getBarcodeFormat, handlePrintBarcodes } from "../utils/barcodePrinter.jsx";

/**
 * BarcodePreview component
 * Uses a canvas or SVG element inside matching React life cycles to render scanner-ready vector barcodes.
 */
const BarcodePreview = ({ value, format }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format || "CODE128",
          width: 2,
          height: 48,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error("JsBarcode preview failed for:", format, value, err);
        // Robust fallback to CODE128
        try {
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            width: 2,
            height: 48,
            displayValue: false,
            margin: 0,
          });
        } catch (innerErr) {
          console.error("CODE128 fallback failed as well:", innerErr);
        }
      }
    }
  }, [value, format]);

  return <svg ref={svgRef} className="max-w-full h-auto mx-auto"></svg>;
};

/**
 * BarcodeModal Component
 * Renders a barcode labels printing sheet generator for a single, selected product.
 */
const BarcodeModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;
  if (!product) return null;

  const [barcodePrintQty, setBarcodePrintQty] = useState(12);

  const barcodeValue = product.barcode || product.sku || "";
  const barcodeFormat = getBarcodeFormat(barcodeValue);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-pos-border rounded max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pos-border pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Barcode size={18} className="text-brand-primary" />
            Barcode Label Generator
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4">
          {/* Display Selected Product Info */}
          <div className="bg-slate-50 border border-pos-border rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Selected Product</span>
            <div className="text-sm font-bold text-slate-800">{product.name}</div>
            <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
              <span>Sku Code: {product.sku}</span>
              {barcodeValue && <span>Barcode: {barcodeValue}</span>}
            </div>
          </div>

          {/* Barcode quantity and quick chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase">Labels Print Quantity</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={barcodePrintQty}
                onChange={(e) => setBarcodePrintQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 bg-pos-bg border border-pos-border text-center rounded px-2 py-1.5 font-mono font-bold text-slate-800 focus:outline-none"
              />
              <div className="flex gap-1.5 flex-1 select-none">
                {[6, 12, 24, 48].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setBarcodePrintQty(q)}
                    className={`flex-1 text-[11px] font-bold rounded border transition-all cursor-pointer ${
                      barcodePrintQty === q
                        ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold"
                        : "border-pos-border hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {q} Label
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic live simulation preview of a single sticker */}
          <div className="space-y-2 mt-4">
            <span className="block text-xs font-bold text-slate-500 uppercase">Live Sticker Preview</span>
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center relative shadow-xs overflow-hidden">
              <div className="w-full text-center max-w-[240px] border border-pos-border rounded-lg p-3 bg-white">
                <div className="text-[11px] font-black text-slate-800 truncate mb-1">
                  {product.name}
                </div>

                {/* Pure SVG Barcode visualization */}
                {barcodeValue ? (
                  <div className="flex w-full justify-center items-center my-1 bg-white">
                    <BarcodePreview value={barcodeValue} format={barcodeFormat} />
                  </div>
                ) : (
                  <div className="h-10 w-full bg-slate-50 flex items-center justify-center text-red-500 font-bold text-xs uppercase my-1 font-mono border border-red-200 bg-red-50 rounded">
                    No SKU/Barcode
                  </div>
                )}

                <div className="text-[9px] font-mono tracking-[3px] text-slate-800 font-bold">
                  {barcodeValue || "NO CODE AVAILABLE"}
                </div>
                <div className="text-[11px] font-extrabold text-emerald-600 mt-0.5 font-mono">
                  ₹{(product.sellingPrice || 0).toFixed(2)}
                </div>
              </div>
             
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-t-pos-border">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded text-xs transition-colors cursor-pointer"
          >
            Close Preview
          </button>
          <button
            onClick={() => {
              if (!barcodeValue) {
                alert("Cannot print barcode label because this product does not have any barcode or SKU code specified!");
                return;
              }
              handlePrintBarcodes(product, barcodePrintQty);
            }}
            className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Labels Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeModal;
