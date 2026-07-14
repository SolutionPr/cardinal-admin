"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  id,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select option...",
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchVal("");
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchVal.toLowerCase()) ||
      opt.subLabel?.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-left",
          isOpen && "border-[#E52629] ring-2 ring-[#E52629]/20"
        )}
      >
        <span className="truncate">
          {selectedOption ? (
            <>
              {selectedOption.label}
              {selectedOption.subLabel && (
                <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1.5">
                  {selectedOption.subLabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-gray-500 transition-transform duration-200 shrink-0 ml-2",
            isOpen && "transform rotate-180 text-[#E52629]"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 border border-gray-100 dark:border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            style={{ backgroundColor: "var(--card)" }}
          >
            {/* Search Input in Dropdown */}
            {options.length > 5 && (
              <div 
                className="p-2 border-b border-gray-100 dark:border-white/5 sticky top-0 z-10"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-[#1f1f1f] border border-gray-100 dark:border-white/5 rounded-lg text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629]/50 transition-all"
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              <ul className="py-1.5">
                {filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex flex-col justify-center gap-0.5 cursor-pointer",
                          isSelected
                            ? "bg-[#E52629]/10 text-[#E52629] dark:bg-[#E52629]/15"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {opt.subLabel && (
                          <span className="text-xs font-normal text-gray-400 dark:text-gray-500 truncate">
                            {opt.subLabel}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
