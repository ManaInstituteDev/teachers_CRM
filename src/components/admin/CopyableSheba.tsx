"use client";

import { useState, useEffect } from "react";
import { Copy, Check, CreditCard, Edit2, Loader2, X, AlertCircle } from "lucide-react";
import { updateEvaluatorShebaAction } from "@/app/actions/timesheetApproval";

export interface CopyableShebaProps {
  shebaNumber?: string | null;
  evaluatorId?: string;
  evaluatorName?: string;
  variant?: "compact" | "badge";
  allowEdit?: boolean;
  className?: string;
}

export function CopyableSheba({
  shebaNumber,
  evaluatorId,
  evaluatorName,
  variant = "compact",
  allowEdit = true,
  className = "",
}: CopyableShebaProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sheba, setSheba] = useState(shebaNumber || "");
  const [inputVal, setInputVal] = useState(shebaNumber || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // هماهنگ‌سازی در صورت تغییر پروپ
  useEffect(() => {
    if (!isEditing && !loading) {
      const normalized = shebaNumber || "";
      setSheba(normalized);
      setInputVal(normalized);
    }
  }, [shebaNumber, isEditing, loading]);

  // کپی شماره شبا در حافظه موقت (Clipboard)
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!sheba) return;

    const cleanSheba = sheba.replace(/\s+/g, "").toUpperCase();

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanSheba);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = cleanSheba;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy sheba number:", err);
    }
  };

  // ذخیره ویرایش شماره شبا
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!evaluatorId) return;

    setLoading(true);
    setError(null);

    let clean = inputVal.replace(/\s+/g, "").toUpperCase();
    if (clean && !clean.startsWith("IR") && /^\d+$/.test(clean)) {
      clean = "IR" + clean;
    }

    const res = await updateEvaluatorShebaAction(evaluatorId, clean);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSheba(clean);
      setInputVal(clean);
      setIsEditing(false);
    }
  };

  // فرمایش نمایشی خوانا (دسته‌های ۴ رقمی)
  const formatDisplay = (val: string) => {
    const clean = val.replace(/\s+/g, "").toUpperCase();
    if (clean.length === 26 && clean.startsWith("IR")) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12, 16)} ${clean.slice(16, 20)} ${clean.slice(20, 24)} ${clean.slice(24)}`;
    }
    return clean;
  };

  // حالت ویرایش
  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 p-1 bg-white border border-indigo-300 rounded-xl shadow-sm animate-in fade-in"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="IR..."
          dir="ltr"
          autoFocus
          className="font-mono text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 w-36 sm:w-44"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shrink-0 disabled:opacity-50"
          title="ذخیره شبا"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setInputVal(sheba);
            setError(null);
          }}
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer shrink-0"
          title="انصراف"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {error && <span className="text-[10px] text-rose-600 font-bold px-1">{error}</span>}
      </form>
    );
  }

  // ۱. حالت نشان برجسته (Badge) برای شناسنامه و هدر مدرسه
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-white/95 hover:bg-white border rounded-xl p-1.5 sm:px-2.5 sm:py-1.5 shadow-sm transition duration-150 ${
          copied ? "border-emerald-400 bg-emerald-50/50" : "border-emerald-200/90 hover:border-emerald-300"
        } ${className}`}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-medium leading-none">
              شماره شبا {evaluatorName ? `(${evaluatorName})` : ""}:
            </span>
            {sheba ? (
              <span
                className="font-mono text-xs font-bold text-slate-800 tracking-normal select-all mt-0.5"
                dir="ltr"
              >
                {formatDisplay(sheba)}
              </span>
            ) : (
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                ثبت‌نشده
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 border-r border-slate-200/80 pr-1.5 mr-0.5 shrink-0">
          {sheba ? (
            <button
              type="button"
              onClick={handleCopy}
              title="کپی شماره شبا ارزیاب"
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی شبا</span>
                </>
              )}
            </button>
          ) : (
            allowEdit &&
            evaluatorId && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition cursor-pointer"
              >
                + ثبت شبا
              </button>
            )
          )}

          {allowEdit && evaluatorId && sheba && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="ویرایش شماره شبا"
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ۲. حالت فشرده (Compact) برای استفاده در سطر جداول گزارش مدارس
  return (
    <div className={`inline-flex items-center gap-1 whitespace-nowrap ${className}`}>
      {sheba ? (
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs transition border group/sheba ${
            copied
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
              : "bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border-slate-200/80 hover:border-indigo-300"
          }`}
        >
          <CreditCard className="w-3 h-3 text-emerald-600 shrink-0" />
          <button
            type="button"
            onClick={handleCopy}
            title="کلیک برای کپی شماره شبا ارزیاب"
            className="flex items-center gap-1 font-mono text-[11px] font-semibold tracking-tight text-slate-800 hover:text-indigo-600 cursor-pointer"
            dir="ltr"
          >
            <span>{sheba}</span>
            {copied ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded flex items-center gap-0.5 animate-in fade-in">
                <Check className="w-2.5 h-2.5" />
                کپی شد!
              </span>
            ) : (
              <Copy className="w-3 h-3 text-slate-400 group-hover/sheba:text-indigo-600 transition shrink-0 ml-0.5" />
            )}
          </button>

          {allowEdit && evaluatorId && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="ویرایش شماره شبا"
              className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition cursor-pointer mr-0.5"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-[10px] text-amber-700">
          <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
          <span>فاقد شبا</span>
          {allowEdit && evaluatorId && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="font-bold text-indigo-600 hover:underline mr-0.5 cursor-pointer"
            >
              + ثبت
            </button>
          )}
        </div>
      )}
    </div>
  );
}
