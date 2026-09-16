"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, School as SchoolIcon, Building2 } from "lucide-react";

export interface SchoolOption {
  id: string;
  name: string;
  district?: string | null;
  code?: string | null;
  city?: string | null;
}

interface SearchableSchoolSelectProps {
  schools: SchoolOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  name?: string;
  placeholder?: string;
  noneLabel?: string;
  allowNone?: boolean;
  noneValue?: string;
  required?: boolean;
  className?: string;
  buttonClassName?: string;
  autoSubmit?: boolean;
  disabled?: boolean;
}

export function SearchableSchoolSelect({
  schools,
  value,
  defaultValue,
  onChange,
  name = "schoolId",
  placeholder = "جستجوی نام مدرسه، منطقه یا کد...",
  noneLabel = "-- انتخاب مدرسه --",
  allowNone = true,
  noneValue = "",
  required = false,
  className = "",
  buttonClassName = "",
  autoSubmit = false,
  disabled = false,
}: SearchableSchoolSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    value !== undefined ? value : defaultValue !== undefined ? defaultValue : noneValue
  );
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // هماهنگ‌سازی با کنترلر بیرونی (controlled component)
  useEffect(() => {
    if (value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  // بستن منو با کلیک خارج از کامپوننت
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSchool = schools.find((s) => s.id === selectedId);

  const filteredSchools = schools.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = s.name.toLowerCase().includes(q);
    const districtMatch = s.district ? s.district.toLowerCase().includes(q) : false;
    const codeMatch = s.code ? s.code.toLowerCase().includes(q) : false;
    const cityMatch = s.city ? s.city.toLowerCase().includes(q) : false;
    return nameMatch || districtMatch || codeMatch || cityMatch;
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
    setSearchQuery("");
    onChange?.(id);

    if (autoSubmit && containerRef.current) {
      const form = containerRef.current.closest("form");
      if (form) {
        setTimeout(() => form.requestSubmit(), 50);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect(noneValue);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* فیلد مخفی جهت ارسال مستقیم در فرم‌ها */}
      <input type="hidden" name={name} value={selectedId} required={required && !selectedId} />

      {/* دکمه بازکردن منوی جستجو */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full min-h-[42px] bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition text-right outline-none disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          <SchoolIcon className="w-4 h-4 text-slate-400 shrink-0" />
          {selectedSchool ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-900 truncate">{selectedSchool.name}</span>
              {selectedSchool.district && (
                <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60 shrink-0">
                  منطقه {selectedSchool.district}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium truncate">{noneLabel}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {allowNone && selectedId !== noneValue && selectedId && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition cursor-pointer"
              title="پاک کردن انتخاب"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-indigo-600" : ""
            }`}
          />
        </div>
      </button>

      {/* منوی بازشونده جستجو */}
      {isOpen && (
        <div className="absolute z-50 top-full right-0 left-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* کادر ورودی سرچ */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pr-9 pl-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* لیست مدارس */}
          <div className="max-h-60 overflow-y-auto p-1.5 text-xs space-y-0.5">
            {allowNone && (
              <button
                type="button"
                onClick={() => handleSelect(noneValue)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition cursor-pointer ${
                  selectedId === noneValue || !selectedId
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span>{noneLabel}</span>
                {(selectedId === noneValue || !selectedId) && (
                  <Check className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
            )}

            {filteredSchools.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                مدرسه‌ای با مشخصات جستجویافته پیدا نشد.
              </div>
            ) : (
              filteredSchools.map((s) => {
                const isSelected = selectedId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(s.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-800 font-bold"
                        : "hover:bg-slate-50 text-slate-800 font-medium"
                    }`}
                  >
                    <div className="truncate flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.name}</span>
                      {s.district && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/50 shrink-0">
                          منطقه {s.district}
                        </span>
                      )}
                      {s.code && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          (کد: {s.code})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
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
