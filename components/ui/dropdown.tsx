"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  buttonClassName = "",
  icon,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: Option[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          "flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        }
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {icon && <div className="shrink-0">{icon}</div>}
          <span className={`truncate ${selectedOption ? "text-foreground dark:text-white" : "text-muted-foreground"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[9999] mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card p-1.5 shadow-2xl backdrop-blur-xl focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/95 scrollbar-thin scrollbar-thumb-border"
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
