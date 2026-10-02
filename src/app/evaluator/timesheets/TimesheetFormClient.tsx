"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { logTimesheetAction } from "@/app/actions/timesheet";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Users,
  School,
  Receipt,
  Car,
  Utensils,
  Printer,
  Tag,
  Coins,
  Loader2,
} from "lucide-react";
import { SearchableAssistantSelect } from "@/components/SearchableAssistantSelect";
import { SearchableSchoolSelect } from "@/components/SearchableSchoolSelect";
import { numberToPersianWords, formatNumberFa, extractCleanNumber } from "@/lib/numberToWords";

interface AssistantOption {
  id: string;
  fullName: string;
}

export interface SchoolOption {
  id: string;
  name: string;
  district: string;
  code?: string | null;
  pettyCashAmount?: number | null;
  pettyCashPaid?: boolean;
}

interface TimesheetFormClientProps {
  assistants: AssistantOption[];
  schools: SchoolOption[];
  initialSchoolId?: string;
  initialTab?: string;
}

const COMMON_EXPENSE_PRESETS = [
  { label: "کرایه اسنپ و رفت‌وآمد", category: "ایاب و ذهاب", icon: Car },
  { label: "ناهار و پذیرایی ارزیابی", category: "پذیرایی و غذا", icon: Utensils },
  { label: "پرینت فرم‌ها و تکثیر", category: "چاپ و اقلام", icon: Printer },
  { label: "هزینه پارکینگ / عوارض", category: "ایاب و ذهاب", icon: Car },
  { label: "لوازم‌التحریر و اقلام مصرفی", category: "چاپ و اقلام", icon: Tag },
];

export default function TimesheetFormClient({
  assistants,
  schools,
  initialSchoolId = "",
}: TimesheetFormClientProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [timesheetState, timesheetAction, isTimesheetPending] = useActionState(logTimesheetAction, null);

  const [workerType, setWorkerType] = useState<"EVALUATOR" | "ASSISTANT_EVALUATOR">("EVALUATOR");
  const [schoolId, setSchoolId] = useState<string>(initialSchoolId);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("ایاب و ذهاب");

  // پیدا کردن اطلاعات تنخواه مدرسه انتخابی
  const selectedSchool = schools.find((s) => s.id === schoolId);

  // ریست کردن فیلدهای هزینه و فرم پس از ثبت موفق
  useEffect(() => {
    if (timesheetState?.success) {
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseCategory("ایاب و ذهاب");
      formRef.current?.reset();
      setSchoolId(initialSchoolId);
    }
  }, [timesheetState, initialSchoolId]);

  const hasEnteredExpense = Boolean(expenseTitle.trim() || (expenseAmount && parseInt(expenseAmount, 10) > 0));

  return (
    <form ref={formRef} action={timesheetAction} className="space-y-4">
      {/* پیام خطا */}
      {timesheetState?.error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{timesheetState.error}</span>
        </div>
      )}

      {/* پیام موفقیت */}
      {timesheetState?.success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{timesheetState.message}</span>
        </div>
      )}

      {/* انتخاب نوع نیرو: خود ارزیاب یا کمک ارزیاب */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          ثبت ساعت کارکرد برای چه کسی؟
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWorkerType("EVALUATOR")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              workerType === "EVALUATOR"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>خودم (ارزیاب)</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkerType("ASSISTANT_EVALUATOR")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              workerType === "ASSISTANT_EVALUATOR"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>کمک‌ارزیاب</span>
          </button>
        </div>
        <input type="hidden" name="workerType" value={workerType} />
      </div>

      {/* انتخاب کمک ارزیاب در صورت انتخاب */}
      {workerType === "ASSISTANT_EVALUATOR" && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            انتخاب کمک‌ارزیاب همکار <span className="text-rose-500">*</span>
          </label>
          {assistants.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              هنوز هیچ کمک‌ارزیابی توسط مدیریت به شما متصل نشده است.
            </div>
          ) : (
            <SearchableAssistantSelect
              assistants={assistants}
              name="assistantEvaluatorId"
              required={true}
              noneLabel="-- انتخاب کمک‌ارزیاب همکار --"
              placeholder="جستجوی نام کمک‌ارزیاب..."
            />
          )}
        </div>
      )}

      {/* تاریخ */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          تاریخ انجام فعالیت
        </label>
        <input
          type="date"
          name="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
        />
      </div>

      {/* مدرسه مرتبط */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
          <span>مدرسه محل فعالیت (از مدارس تخصیص‌یافته به شما)</span>
          {selectedSchool?.pettyCashAmount ? (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              تنخواه مصوب: {formatNumberFa(selectedSchool.pettyCashAmount)} تومان
            </span>
          ) : null}
        </label>
        {schools.length === 0 ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            هنوز مدرسه‌ای توسط مدیریت به کارتابل شما تخصیص داده نشده است.
          </div>
        ) : (
          <SearchableSchoolSelect
            schools={schools}
            name="schoolId"
            defaultValue={schoolId}
            onChange={(id) => setSchoolId(id)}
            noneLabel="-- بدون انتساب به مدرسه / فعالیت عمومی --"
            placeholder={`جستجو در مدارس تخصیص‌یافته (${schools.length} مدرسه)...`}
          />
        )}
      </div>

      {/* مدت زمان */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          مدت زمان کارکرد
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">ساعت:</span>
            <input
              type="number"
              name="hours"
              defaultValue="2"
              min="0"
              max="24"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">دقیقه:</span>
            <input
              type="number"
              name="minutes"
              defaultValue="0"
              min="0"
              max="59"
              step="5"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* شرح فعالیت */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          شرح اقدامات و فعالیت انجام‌شده
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="مثال: مصاحبه با دبیران ادبیات، ارزیابی میدانی امکانات مدرسه، تنظیم چک‌لیست..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-indigo-500 outline-none"
        ></textarea>
      </div>

      {/* بخش ادغام‌شده هزینه و فاکتور تنخواه (بدون نیاز به تیک) */}
      <div className="pt-3 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  هزینه‌کرد و تنخواه (اختیاری)
                </span>
                <span className="text-[10px] text-slate-500 block">
                  در صورت انجام هزینه (اسنپ، پذیرایی، پرینت و...)، فیلدهای زیر را تکمیل نمایید
                </span>
              </div>
            </div>
            {hasEnteredExpense && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                شامل فاکتور
              </span>
            )}
          </div>

          {/* پیش‌فرض‌های سریع عنوان خرج */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_EXPENSE_PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setExpenseTitle(p.label);
                    setExpenseCategory(p.category);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-white border border-amber-200/80 text-amber-900 hover:bg-amber-100/80 transition cursor-pointer shadow-2xs"
                >
                  <Icon className="w-3 h-3 text-amber-600" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* عنوان هزینه */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              عنوان هزینه
            </label>
            <input
              type="text"
              name="expenseTitle"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="مثال: کرایه اسنپ رفت‌وبرگشت، ناهار ارزیابی، پرینت فرم..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none"
            />
          </div>

          {/* مبلغ و دسته‌بندی هزینه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                مبلغ هزینه (تومان)
              </label>
              <input
                type="text"
                name="expenseAmount"
                value={expenseAmount ? Number(extractCleanNumber(expenseAmount)).toLocaleString("fa-IR") : ""}
                onChange={(e) => setExpenseAmount(extractCleanNumber(e.target.value))}
                placeholder="مثال: ۸۰,۰۰۰"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none font-mono"
              />
              {expenseAmount && parseInt(expenseAmount, 10) > 0 && (
                <span className="text-[10px] font-medium text-amber-700 mt-1 block">
                  {numberToPersianWords(parseInt(expenseAmount, 10))} تومان
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                دسته‌بندی خرج
              </label>
              <select
                name="expenseCategory"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none"
              >
                <option value="ایاب و ذهاب">🚗 ایاب و ذهاب / اسنپ</option>
                <option value="پذیرایی و غذا">☕ پذیرایی و غذا</option>
                <option value="چاپ و اقلام">📄 چاپ و تکثیر فرم‌ها</option>
                <option value="متفرقه">📦 متفرقه</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* دکمه ثبت فرم یکپارچه */}
      <button
        type="submit"
        disabled={isTimesheetPending || (workerType === "ASSISTANT_EVALUATOR" && assistants.length === 0)}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {isTimesheetPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>در حال ثبت اطلاعات...</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            <span>
              {hasEnteredExpense ? "ثبت همزمان فعالیت و هزینه تنخواه" : "ثبت گزارش فعالیت"}
            </span>
          </>
        )}
      </button>
    </form>
  );
}
