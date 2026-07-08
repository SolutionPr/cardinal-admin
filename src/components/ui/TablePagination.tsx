"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PaginationMeta } from "@/lib/pagination";

interface TablePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
  className?: string;
  pageSizeOptions?: number[];
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

export function TablePagination({
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false,
  className,
  pageSizeOptions = [10, 20, 50],
}: TablePaginationProps) {
  const { page, limit, total, totalPages } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const visiblePages = getVisiblePages(page, totalPages);

  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelectLimit = (option: number) => {
    if (onLimitChange) {
      onLimitChange(option);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {start}-{end}
          </span>{" "}
          of{" "}
          <span className="font-bold text-gray-900 dark:text-white">{total}</span>
        </p>
 
        {onLimitChange && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 relative">
            <span>Rows per page</span>
            
            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] text-gray-900 dark:text-white font-bold outline-none hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <span>{limit}</span>
              <ChevronDown className="size-3.5 text-gray-400" />
            </button>

            {/* Custom Dropdown Options Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop to close click outside */}
                <div
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-24 bottom-full mb-1 w-20 bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-40 py-1.5">
                  {pageSizeOptions.map((option) => {
                    const isSelected = option === limit;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectLimit(option)}
                        className={cn(
                          "w-full px-3 py-1.5 text-left text-xs font-bold transition-colors flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "text-[#E52629] bg-[#E52629]/5"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                      >
                        <span>{option}</span>
                        {isSelected && <Check className="size-3 text-[#E52629]" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
 
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={isLoading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center justify-center size-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
 
        {visiblePages.map((pageNumber, index) => {
          const previous = visiblePages[index - 1];
          const showEllipsis = previous !== undefined && pageNumber - previous > 1;
 
          return (
            <span key={pageNumber} className="flex items-center gap-1.5">
              {showEllipsis && (
                <span className="px-1 text-xs font-bold text-gray-400">...</span>
              )}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  "inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:cursor-not-allowed",
                  pageNumber === page
                    ? "bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white shadow-[0_4px_12px_rgba(229,38,41,0.2)]"
                    : "border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5",
                )}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}
 
        <button
          type="button"
          disabled={isLoading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center justify-center size-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
