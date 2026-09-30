"use client";

import { useState } from "react";
import { updateEvaluatorShebaAction, updateAssistantShebaAction } from "@/app/actions/timesheetApproval";
import { CreditCard, Check, Edit2, Loader2, X, Copy } from "lucide-react";

export function QuickShebaEdit({
  userId,
  currentSheba,
  userName,
  targetType = "USER",
}: {
  userId: string;
  currentSheba?: string | null;
  userName?: string;
  targetType?: "USER" | "ASSISTANT";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [sheba, setSheba] = useState(currentSheba || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!sheba) return;

    const clean = sheba.replace(/\s+/g, "").toUpperCase();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clean);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = clean;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy sheba:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // تمیزکاری و نرمال‌سازی شماره شبا (حذف فاصله‌ها)
    let cleanSheba = sheba.replace(/\s+/g, "").toUpperCase();
    if (cleanSheba && !cleanSheba.startsWith("IR") && /^\d+$/.test(cleanSheba)) {
      cleanSheba = "IR" + cleanSheba;
    }

    const res =
      targetType === "ASSISTANT"
        ? await updateAssistantShebaAction(userId, cleanSheba)
        : await updateEvaluatorShebaAction(userId, cleanSheba);

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSheba(cleanSheba);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-1.5 min-w-55">
        <input
          type="text"
          value={sheba}
          onChange={(e) => setSheba(e.target.value)}
          placeholder="IR..."
          dir="ltr"
          autoFocus
          className="w-full font-mono text-xs bg-white border border-indigo-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shrink-0"
          title="ذخیره"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setSheba(currentSheba || "");
          }}
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer shrink-0"
          title="انصراف"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {sheba ? (
        <div className="flex items-center gap-1 group/sheba bg-slate-50 border border-slate-200/80 rounded-lg px-1.5 py-0.5">
          <span
            className="font-mono text-xs font-semibold text-slate-700 select-all"
            dir="ltr"
          >
            {sheba}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
            title="کپی شماره شبا"
          >
            {copied ? (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <Check className="w-3 h-3 text-emerald-600" />
                کپی شد
              </span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
            title="ویرایش شماره شبا"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer"
          title="ثبت شماره شبا"
        >
          <CreditCard className="w-3 h-3 text-amber-600" />
          <span>ثبت شماره شبا</span>
        </button>
      )}

      {saved && (
        <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in">
          ذخیره شد
        </span>
      )}
    </div>
  );
}
