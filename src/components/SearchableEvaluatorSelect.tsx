"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, User } from "lucide-react";

interface EvaluatorOption {
  id: string;
  fullName: string;
  username?: string;
}

interface SearchableEvaluatorSelectProps {
  evaluators: EvaluatorOption[];
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  autoSubmit?: boolean;
}

export default function SearchableEvaluatorSelect({
  evaluators,
  defaultValue = "ALL",
  name = "evaluatorId",
  placeholder = "جستجوی ارزیاب...",
  className = "",
  autoSubmit = false,
}: SearchableEvaluatorSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(defaultValue || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // بستن منو با کلیک بیرون
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // هماهنگ‌سازی با تغییر مقدار اولیه
  useEffect(() => {
    setSelectedId(defaultValue || "ALL");
  }, [defaultValue]);

  const selectedEvaluator = evaluators.find((ev) => ev.id === selectedId);

  const filteredEvaluators = evaluators.filter((ev) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ev.fullName.toLowerCase().includes(q) ||
      (ev.username && ev.username.toLowerCase().includes(q))
    );
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
    setSearchQuery("");

    if (autoSubmit && containerRef.current) {
      const form = containerRef.current.closest("form");
      if (form) {
        setTimeout(() => form.requestSubmit(), 50);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId("ALL");
    setSearchQuery("");
    if (autoSubmit && containerRef.current) {
      const form = containerRef.current.closest("form");
      if (form) {
        setTimeout(() => form.requestSubmit(), 50);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* فیلد مخفی برای ارسال به سرور اکشن یا GET فرم */}
      <input type="hidden" name={name} value={selectedId} />

      {/* دکمه / نمایشگر فیلتر فعلی */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className="w-full min-h-[38px] bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition focus-within:bg-white focus-within:border-indigo-500"
      >
        <div className="flex items-center gap-2 truncate">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {selectedId === "ALL" || !selectedEvaluator ? (
            <span className="text-slate-600 font-medium">همه ارزیاب‌ها</span>
          ) : (
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60 truncate">
              {selectedEvaluator.fullName}
              {selectedEvaluator.username && (
                <span className="text-[10px] text-slate-400 font-normal mr-1.5 font-mono">
                  ({selectedEvaluator.username})
                </span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedId !== "ALL" && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              title="پاک کردن انتخاب"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-indigo-600" : ""
            }`}
          />
        </div>
      </div>

      {/* منوی بازشونده جستجو و گزینه‌ها */}
      {isOpen && (
        <div className="absolute z-50 top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* باکس جستجو */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-800 outline-none transition"
              />
            </div>
          </div>

          {/* لیست گزینه‌ها */}
          <div className="max-h-56 overflow-y-auto p-1 text-xs space-y-0.5">
            {/* گزینه همه ارزیاب‌ها */}
            <button
              type="button"
              onClick={() => handleSelect("ALL")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition cursor-pointer ${
                selectedId === "ALL"
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "hover:bg-slate-50 text-slate-700 font-medium"
              }`}
            >
              <span>همه ارزیاب‌ها</span>
              {selectedId === "ALL" && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            {/* ارزیاب‌های فیلترشده */}
            {filteredEvaluators.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-[11px]">
                ارزیابی با این مشخصات یافت نشد
              </div>
            ) : (
              filteredEvaluators.map((ev) => {
                const isSelected = selectedId === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => handleSelect(ev.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "hover:bg-slate-50 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="truncate">
                      <span className="block truncate">{ev.fullName}</span>
                      {ev.username && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          @{ev.username}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
