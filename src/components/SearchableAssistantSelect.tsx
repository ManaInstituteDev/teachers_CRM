"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Users } from "lucide-react";

export interface AssistantOption {
  id: string;
  fullName: string;
  phone?: string | null;
}

interface SearchableAssistantSelectProps {
  assistants: AssistantOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  name?: string;
  placeholder?: string;
  noneLabel?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SearchableAssistantSelect({
  assistants,
  value,
  defaultValue,
  onChange,
  name = "assistantEvaluatorId",
  placeholder = "جستجوی نام کمک‌ارزیاب...",
  noneLabel = "-- انتخاب کمک‌ارزیاب --",
  required = false,
  className = "",
  disabled = false,
}: SearchableAssistantSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    value !== undefined ? value : defaultValue !== undefined ? defaultValue : ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAssistant = assistants.find((a) => a.id === selectedId);

  const filteredAssistants = assistants.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = a.fullName.toLowerCase().includes(q);
    const phoneMatch = a.phone ? a.phone.includes(q) : false;
    return nameMatch || phoneMatch;
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
    setSearchQuery("");
    onChange?.(id);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={selectedId} required={required && !selectedId} />

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
        className="w-full min-h-[40px] bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 flex items-center justify-between gap-2 cursor-pointer transition text-right outline-none disabled:opacity-50"
      >
        <div className="flex items-center gap-2 truncate flex-1">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {selectedAssistant ? (
            <span className="font-bold text-slate-900 truncate">{selectedAssistant.fullName}</span>
          ) : (
            <span className="text-slate-400 font-medium truncate">{noneLabel}</span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180 text-indigo-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-900 outline-none transition"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 text-xs space-y-0.5">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition cursor-pointer ${
                !selectedId ? "bg-slate-100 text-slate-900 font-bold" : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <span>{noneLabel}</span>
              {!selectedId && <Check className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            {filteredAssistants.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-[11px]">
                کمک‌ارزیابی یافت نشد
              </div>
            ) : (
              filteredAssistants.map((a) => {
                const isSelected = selectedId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelect(a.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "hover:bg-slate-50 text-slate-800 font-medium"
                    }`}
                  >
                    <span>{a.fullName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
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
