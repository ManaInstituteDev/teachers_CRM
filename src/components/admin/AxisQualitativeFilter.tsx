"use client";

import { useState } from "react";
import { AXIS_QUALITATIVE_OPTIONS } from "@/lib/scoring";
import { SlidersHorizontal, Sparkles, Check } from "lucide-react";

interface AxisQualitativeFilterProps {
  initialAxis?: string;
  initialQualitative?: string;
}

export function AxisQualitativeFilter({
  initialAxis = "",
  initialQualitative = "",
}: AxisQualitativeFilterProps) {
  const [selectedAxis, setSelectedAxis] = useState<string>(initialAxis);
  const [selectedQualitative, setSelectedQualitative] = useState<string>(initialQualitative);

  const handleAxisChange = (axisId: string) => {
    setSelectedAxis(axisId);
    setSelectedQualitative(""); // بازنشانی توصیف در صورت تغییر محور
  };

  const currentAxisOptions = selectedAxis ? AXIS_QUALITATIVE_OPTIONS[Number(selectedAxis)] : null;

  return (
    <div className="pt-3 border-t border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>فیلتر بر اساس توصیف کیفی در محور انتخابی (نظر ارزیاب):</span>
        </span>
        {selectedAxis && (
          <button
            type="button"
            onClick={() => {
              setSelectedAxis("");
              setSelectedQualitative("");
            }}
            className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
          >
            پاک‌کردن فیلتر توصیفی
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ۱. انتخاب محور مورد نظر */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            انتخاب محور جهت بررسی توصیف:
          </label>
          <select
            name="axisFilter"
            value={selectedAxis}
            onChange={(e) => handleAxisChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition cursor-pointer"
          >
            <option value="">-- انتخاب محور (همه محورها) --</option>
            {Object.values(AXIS_QUALITATIVE_OPTIONS).map((axis) => (
              <option key={axis.id} value={axis.id}>
                {axis.title}
              </option>
            ))}
          </select>
        </div>

        {/* ۲. انتخاب توصیف کیفی مربوط به آن محور */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            توصیف کیفی مد نظر ارزیاب در این محور:
          </label>
          <select
            name="qualitativeFilter"
            value={selectedQualitative}
            onChange={(e) => setSelectedQualitative(e.target.value)}
            disabled={!selectedAxis}
            className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold outline-none transition ${
              !selectedAxis
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-indigo-50/50 border-indigo-200 text-indigo-950 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            }`}
          >
            <option value="">
              {!selectedAxis ? "ابتدا یک محور را انتخاب کنید" : "-- همه توصیف‌های این محور --"}
            </option>
            {currentAxisOptions?.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
