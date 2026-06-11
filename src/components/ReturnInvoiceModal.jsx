import React, { useState, useEffect } from "react";
import { RotateCcw, X, Minus, Plus, ArrowLeftRight } from "lucide-react";

export default function ReturnInvoiceModal({
  isOpen,
  invoice,
  onClose,
  onSubmit, // (returnedLines) => void
  showToast,
}) {
  const [returnLines, setReturnLines] = useState([]);

  useEffect(() => {
    if (isOpen && invoice) {
      const initLines = invoice.items.map((it) => {
        const alreadyReturnedQty = invoice.returns
          ? invoice.returns
              .filter((r) => r.sku === it.sku)
              .reduce((sum, r) => sum + r.quantityReturned, 0)
          : 0;

        const remainingQtyToReturn = Math.max(0, it.quantity - alreadyReturnedQty);

        return {
          sku: it.sku,
          name: it.name,
          originalQty: it.quantity,
          rate: it.rate,
          discount: it.discount || 0,
          tax: it.tax || 0,
          alreadyReturned: alreadyReturnedQty,
          remainingQty: remainingQtyToReturn,
          quantityToReturn: 0,
        };
      });
      setReturnLines(initLines);
    } else {
      setReturnLines([]);
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const updateLineQty = (sku, delta) => {
    setReturnLines((prev) =>
      prev.map((line) => {
        if (line.sku === sku) {
          const nextVal = line.quantityToReturn + delta;
          const cappedVal = Math.max(0, Math.min(line.remainingQty, nextVal));
          return { ...line, quantityToReturn: cappedVal };
        }
        return line;
      })
    );
  };

  const handleProcessSubmit = () => {
    const itemsToReturn = returnLines.filter((line) => line.quantityToReturn > 0);
    if (itemsToReturn.length === 0) {
      if (showToast) {
        showToast("Please select at least 1 item count to return!", "warning");
      }
      return;
    }
    onSubmit(itemsToReturn);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 no-print animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-rose-600">
            <RotateCcw size={16} />
            <span className="font-extrabold text-xs uppercase tracking-wider">Execute Product Returns & Refund Credits</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-650 cursor-pointer border-0 bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-gray-200 p-3 rounded-xl font-mono text-[10px] text-slate-500">
            <div>
              <span className="block font-sans uppercase font-bold text-slate-400 text-[9px]">Receipt ID:</span>
              <span className="font-bold text-slate-800 text-xs">{invoice.id}</span>
            </div>
            <div>
              <span className="block font-sans uppercase font-bold text-slate-400 text-[9px]">Customer:</span>
              <span className="font-bold text-slate-800 text-xs capitalize">{invoice.customerName || "Walk-in"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Select Line Items quantity to return</span>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white shadow-xs">
              {returnLines.map((line) => {
                const lineRefundValue = (line.rate * line.quantityToReturn) - ((line.rate * line.quantityToReturn) * (line.discount / 100));
                const taxComponent = lineRefundValue * (line.tax / 100);
                const finalLineRefund = lineRefundValue + taxComponent;

                return (
                  <div key={line.sku} className="p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1 max-w-sm">
                      <p className="font-bold text-slate-800 text-xs">{line.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <span>SKU: <strong className="font-semibold text-slate-600 font-mono">{line.sku}</strong></span>
                        <span>• Price: <strong className="font-bold text-slate-700 font-mono">₹{line.rate}</strong></span>
                        <span>• Original: <strong className="font-bold text-slate-700 font-mono">{line.originalQty}</strong></span>
                        {line.alreadyReturned > 0 && (
                          <span className="text-rose-600 font-bold bg-rose-50 border border-rose-200 px-1 rounded text-[9px]">
                            Already Returned: {line.alreadyReturned}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Counter for returns */}
                    <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateLineQty(line.sku, -1)}
                          disabled={line.quantityToReturn <= 0}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-slate-150 disabled:opacity-50 text-slate-650 cursor-pointer text-xs"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-10 text-center font-black font-mono text-xs text-slate-800">
                          {line.quantityToReturn}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateLineQty(line.sku, 1)}
                          disabled={line.quantityToReturn >= line.remainingQty}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-slate-150 disabled:opacity-50 text-slate-650 cursor-pointer text-xs"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <div className="w-24 text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Refund</p>
                        <p className="text-xs font-black text-rose-600 font-mono">₹{finalLineRefund.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aggregated refund total credit display panel */}
          <div className="bg-rose-50 border border-rose-250 p-4 rounded-2xl flex justify-between items-center text-rose-800">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-black tracking-wider text-rose-700/80">Aggregated Refund Total</p>
              <p className="text-[11px] leading-relaxed text-rose-600 font-medium">This amount will be deducted from the invoice total and customer balance.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black font-mono tracking-tight">
                ₹{returnLines.reduce((sum, line) => {
                  const lineRefundValue = (line.rate * line.quantityToReturn) - ((line.rate * line.quantityToReturn) * (line.discount / 100));
                  const taxComponent = lineRefundValue * (line.tax / 100);
                  return sum + (lineRefundValue + taxComponent);
                }, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="bg-slate-50 border-t border-gray-200 p-4 flex gap-3">
          <button
            type="button"
            onClick={handleProcessSubmit}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3.5 text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors border-0"
          >
            <ArrowLeftRight size={14} />
            <span>Confirm Items Return</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3.5 text-xs font-bold rounded-xl cursor-pointer border-0"
          >
            Cancel Return
          </button>
        </div>
      </div>
    </div>
  );
}
