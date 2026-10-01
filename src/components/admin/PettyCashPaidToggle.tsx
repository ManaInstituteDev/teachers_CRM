"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Clock, Loader2, Check, Banknote } from "lucide-react";
import { toggleSchoolPettyCashPaidAction } from "@/app/actions/expense";
import { formatNumberFa } from "@/lib/numberToWords";

interface PettyCashPaidToggleProps {
  schoolId: string;
  initialIsPaid: boolean;
  initialPaidAt?: Date | string | null;
  pettyCashAmount?: number | null;
  variant?: "badge" | "checkbox" | "card";
  showAmount?: boolean;
  onToggle?: (newStatus: boolean) => void;
}

export function PettyCashPaidToggle({
  schoolId,
  initialIsPaid,
  initialPaidAt,
  pettyCashAmount,
  variant = "badge",
  showAmount = false,
  onToggle,
}: PettyCashPaidToggleProps) {
  const [isPaid, setIsPaid] = useState<boolean>(initialIsPaid);
  const [paidAt, setPaidAt] = useState<Date | string | null>(initialPaidAt || null);
  const [isPending, startTransition] = useTransition();
  const [flashSuccess, setFlashSuccess] = useState(false);

  const handleToggle = () => {
    if (isPending) return;
    const nextStatus = !isPaid;

    // آپدیت خوش‌بینانه
    setIsPaid(nextStatus);
    if (nextStatus) {
      setPaidAt(new Date());
    }

    startTransition(async () => {
      const res = await toggleSchoolPettyCashPaidAction({
        schoolId,
        isPaid: nextStatus,
      });

      if (res?.error) {
        // بازگشت به حالت قبلی در صورت بروز خطا
        setIsPaid(!nextStatus);
        alert(res.error);
      } else {
        setFlashSuccess(true);
        setTimeout(() => setFlashSuccess(false), 2000);
        onToggle?.(nextStatus);
      }
    });
  };

  // نوع ۱: کارت درون کامپوننت مدیریت تنخواه مدرسه
  if (variant === "card") {
    return (
      <div
        className={`p-3.5 rounded-2xl border transition-all duration-200 ${
          isPaid
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            : "bg-amber-50/70 border-amber-200 text-amber-950"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">وضعیت پرداخت تنخواه به ارزیاب:</span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    واریز شده
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    در انتظار واریز
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isPaid
                  ? `مبلغ تنخواه به حساب ارزیاب واریز شده است ${
                      paidAt ? `(${new Date(paidAt).toLocaleDateString("fa-IR")})` : ""
                    }`
                  : "هنوز تنخواه برای این مدرسه به حساب ارزیاب واریز نشده است."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ${
              isPaid
                ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            }`}
            title={isPaid ? "کلیک کنید تا وضعیت به واریز نشده تغییر کند" : "کلیک کنید تا تیک واریز ثبت شود"}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPaid ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تنخواه واریز شد (لغو تیک)</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>تایید و ثبت واریز تنخواه</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // نوع ۲: چک‌باکس ساده
  if (variant === "checkbox") {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isPaid}
          onChange={handleToggle}
          disabled={isPending}
          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition cursor-pointer"
        />
        <span className="text-xs font-bold text-slate-700">
          {isPaid ? "تنخواه واریز شد" : "در انتظار واریز تنخواه"}
        </span>
        {isPending && <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />}
      </label>
    );
  }

  // نوع ۳: نشان/دکمه فشرده در جدول (پیش‌فرض badge)
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer select-none ${
        isPaid
          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 hover:border-emerald-400"
          : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400"
      } ${flashSuccess ? "ring-2 ring-emerald-500" : ""}`}
      title={
        isPaid
          ? "تنخواه به ارزیاب واریز شده است (برای لغو یا تغییر، کلیک کنید)"
          : "تنخواه هنوز واریز نشده است (برای تیک زدن و ثبت واریز، کلیک کنید)"
      }
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
      ) : isPaid ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      )}

      <span>
        {isPaid ? "تنخواه واریز شد" : "تیک واریز تنخواه"}
      </span>

      {showAmount && pettyCashAmount && (
        <span className="font-bold opacity-80 border-r border-current pr-1 mr-0.5">
          {formatNumberFa(pettyCashAmount)} ت
        </span>
      )}
    </button>
  );
}
