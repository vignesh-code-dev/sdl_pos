import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  setCurrentPage,
  totalRecords,
  itemsPerPage,
  totalCount,
  noPrint = false,
}) => {
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  if (totalRecords === 0) {
    return (
      <div className={`bg-slate-50/50 p-4 border-t border-pos-border flex justify-between items-center text-xs font-bold text-slate-600 select-none border-0 ${noPrint ? "no-print" : ""}`}>
        <span>Showing 0 of 0 entries</span>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50/50 p-4 border-t border-pos-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-600 gap-2 select-none border-0 ${noPrint ? "no-print" : ""}`}>
      <span>
        Showing{" "}
        <span className="font-extrabold text-slate-700">
          {startIndex + 1}
        </span>{" "}
        to{" "}
        <span className="font-extrabold text-slate-700">
          {Math.min(totalRecords, startIndex + itemsPerPage)}
        </span>{" "}
        of{" "}
        <span className="font-extrabold text-slate-700">
          {totalRecords}
        </span>{" "}
        entries
        {totalCount !== undefined && totalCount !== totalRecords && (
          <span className="font-medium text-slate-400">
            {" "}(Filtered from {totalCount} total)
          </span>
        )}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Chevron Back control */}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7 border border-[#eee] bg-white text-slate-500 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/60 font-sans font-bold flex items-center justify-center cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={12} strokeWidth={3} />
          </button>

          {/* Page indexes */}
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => {
            const isFirst = page === 1;
            const isLast = page === totalPages;
            const isNearCurrent = Math.abs(page - currentPage) <= 1;

            if (totalPages > 5 && !isFirst && !isLast && !isNearCurrent) {
              if (page === 2 && currentPage > 3) {
                return (
                  <span
                    key="ellipsis-start"
                    className="px-1 text-slate-300 font-extrabold select-none animate-fade-in"
                  >
                    ...
                  </span>
                );
              }
              if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return (
                  <span
                    key="ellipsis-end"
                    className="px-1 text-slate-300 font-extrabold select-none animate-fade-in"
                  >
                    ...
                  </span>
                );
              }
              return null;
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 flex items-center justify-center rounded text-xs transition-all border cursor-pointer ${
                  isActive
                    ? "bg-brand-primary border-brand-primary text-white font-bold"
                    : "bg-white border-pos-border text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Chevron Next control */}
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="h-7 w-7 border border-[#eee] bg-white text-slate-500 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200/60 font-sans font-bold flex items-center justify-center cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight size={12} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
