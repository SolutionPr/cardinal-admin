"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { City } from "@/services/city.service";

interface CityRowActionsProps {
  city: City;
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
}

export function CityRowActions({ city, onEdit, onDelete }: CityRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 140),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      <div className="relative inline-flex justify-end">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "inline-flex items-center justify-center size-9 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer",
            open && "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white",
          )}
          aria-label={`Actions for ${city.name}`}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <MoreVertical className="size-4" />
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed z-50 min-w-[140px] py-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit(city);
              }}
              className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Pencil className="size-3.5 text-gray-400" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDelete(city);
              }}
              className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#E52629]/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
