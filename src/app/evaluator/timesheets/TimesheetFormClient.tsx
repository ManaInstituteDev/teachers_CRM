"use client";

import { useActionState, useState, useTransition } from "react";
import { logTimesheetAction } from "@/app/actions/timesheet";
import { addSchoolExpenseAction } from "@/app/actions/expense";
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
  ChevronDown,
  Loader2,
  Plus,
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
  initialTab?: "timesheet" | "expense";
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
  initialTab = "timesheet",
}: TimesheetFormClientProps) {
  const [activeTab, setActiveTab] = useState<"timesheet" | "expense">(initialTab);

  // وضعیت‌های فرم ثبت ساعت کارکرد
  const [timesheetState, timesheetAction, isTimesheetPending] = useActionState(logTimesheetAction, null);
  const [workerType, setWorkerType] = useState<"EVALUATOR" | "ASSISTANT_EVALUATOR">("EVALUATOR");
  const [timesheetSchoolId, setTimesheetSchoolId] = useState<string>(initialSchoolId);
  const [includeExpense, setIncludeExpense] = useState(false);
  const [timesheetExpenseTitle, setTimesheetExpenseTitle] = useState("");
  const [timesheetExpenseAmount, setTimesheetExpenseAmount] = useState("");
  const [timesheetExpenseCategory, setTimesheetExpenseCategory] = useState("ایاب و ذهاب");

  // وضعیت‌های فرم مستقل ثبت هزینه تنخواه
  const [expenseSchoolId, setExpenseSchoolId] = useState<string>(initialSchoolId);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("ایاب و ذهاب");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [expenseSuccess, setExpenseSuccess] = useState<string | null>(null);
  const [isExpensePending, startExpenseTransition] = useTransition();

  // پیدا کردن اطلاعات تنخواه مدرسه انتخابی
  const selectedSchoolForExpense = schools.find((s) => s.id === expenseSchoolId);
  const selectedSchoolForTimesheet = schools.find((s) => s.id === timesheetSchoolId);

  // ارسال فرم مستقل هزینه تنخواه
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);
    setExpenseSuccess(null);

    if (!expenseSchoolId) {
      setExpenseError("انتخاب مدرسه محل فعالیت و هزینه الزامی است.");
      return;
    }

    if (!expenseTitle.trim()) {
      setExpenseError("لطفاً عنوان هزینه تنخواه را وارد کنید.");
      return;
    }

    const numAmount = parseInt(extractCleanNumber(expenseAmount), 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setExpenseError("مبلغ هزینه باید عددی بیشتر از صفر تومان باشد.");
      return;
    }

    startExpenseTransition(async () => {
      const res = await addSchoolExpenseAction({
        schoolId: expenseSchoolId,
        title: expenseTitle.trim(),
        amount: numAmount,
        category: expenseCategory,
        description: expenseDescription.trim() || undefined,
        expenseDate: expenseDate,
      });

      if (res?.error) {
        setExpenseError(res.error);
      } else {
        setExpenseSuccess(`هزینه «${expenseTitle.trim()}» به مبلغ ${formatNumberFa(numAmount)} تومان ناظر به مدرسه با موفقیت ثبت شد.`);
        setExpenseTitle("");
        setExpenseAmount("");
        setExpenseDescription("");
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* تب‌های انتخاب نوع ثبت: ساعت کارکرد یا هزینه و تنخواه */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab("timesheet")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "timesheet"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>ثبت ساعت کارکرد</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expense")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "expense"
              ? "bg-white text-amber-700 shadow-xs border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>ثبت هزینه و تنخواه</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* تب ۱: فرم ثبت ساعت کارکرد (+ امکان ثبت همزمان هزینه) */}
      {/* ============================================================== */}
      {activeTab === "timesheet" && (
        <form action={timesheetAction} className="space-y-4 animate-in fade-in duration-200">
          {timesheetState?.error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{timesheetState.error}</span>
            </div>
          )}

          {timesheetState?.success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
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

          {/* انتخاب کمک ارزیاب */}
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

          {/* مدرسه مرتبط */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>مدرسه محل فعالیت (منتسب به مدرسه)</span>
              {selectedSchoolForTimesheet?.pettyCashAmount ? (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  تنخواه مصوب: {formatNumberFa(selectedSchoolForTimesheet.pettyCashAmount)} تومان
                </span>
              ) : null}
            </label>
            <SearchableSchoolSelect
              schools={schools}
              name="schoolId"
              defaultValue={timesheetSchoolId}
              onChange={(id) => setTimesheetSchoolId(id)}
              noneLabel="-- انتخاب مدرسه محل فعالیت --"
              placeholder="جستجوی نام یا منطقه مدرسه..."
            />
          </div>

          {/* شرح فعالیت */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              شرح اقدامات و فعالیت انجام‌شده
            </label>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="مثال: مصاحبه با دبیران ادبیات، ارزیابی میدانی امکانات مدرسه، تنظیم چک‌لیست..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-indigo-500 outline-none"
            ></textarea>
          </div>

          {/* بخش همزمان: تیک ثبت هزینه و تنخواه برای این فعالیت */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                name="includeExpense"
                value="true"
                checked={includeExpense}
                onChange={(e) => setIncludeExpense(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                <span>ثبت هزینه و تنخواه مرتبط با این فعالیت</span>
              </span>
            </label>

            {includeExpense && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3 animate-in fade-in duration-200">
                <div className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>مشخصات فاکتور تنخواه (ناظر به همین مدرسه و تاریخ)</span>
                </div>

                {/* پیش‌فرض‌های سریع عنوان */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_EXPENSE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setTimesheetExpenseTitle(p.label);
                        setTimesheetExpenseCategory(p.category);
                      }}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white border border-amber-200/80 text-amber-900 hover:bg-amber-100/70 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* عنوان هزینه */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    عنوان هزینه <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expenseTitle"
                    value={timesheetExpenseTitle}
                    onChange={(e) => setTimesheetExpenseTitle(e.target.value)}
                    placeholder="مثال: کرایه اسنپ رفت‌وبرگشت، ناهار ارزیابی..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                {/* مبلغ و دسته‌بندی */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      مبلغ هزینه (تومان) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="expenseAmount"
                      value={timesheetExpenseAmount ? Number(extractCleanNumber(timesheetExpenseAmount)).toLocaleString("fa-IR") : ""}
                      onChange={(e) => setTimesheetExpenseAmount(extractCleanNumber(e.target.value))}
                      placeholder="مثال: ۸۰,۰۰۰"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-amber-500 outline-none font-mono"
                    />
                    {timesheetExpenseAmount && parseInt(timesheetExpenseAmount, 10) > 0 && (
                      <span className="text-[10px] font-medium text-amber-700 mt-1 block">
                        {numberToPersianWords(parseInt(timesheetExpenseAmount, 10))} تومان
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      دسته‌بندی خرج
                    </label>
                    <select
                      name="expenseCategory"
                      value={timesheetExpenseCategory}
                      onChange={(e) => setTimesheetExpenseCategory(e.target.value)}
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
            )}
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={isTimesheetPending || (workerType === "ASSISTANT_EVALUATOR" && assistants.length === 0)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isTimesheetPending
                ? "در حال ثبت..."
                : includeExpense
                ? "ثبت همزمان ساعت کارکرد و هزینه تنخواه"
                : "ثبت ساعت کارکرد"}
            </span>
          </button>
        </form>
      )}

      {/* ============================================================== */}
      {/* تب ۲: فرم اختصاصی ثبت هزینه و تنخواه (ناظر به مدرسه) */}
      {/* ============================================================== */}
      {activeTab === "expense" && (
        <form onSubmit={handleExpenseSubmit} className="space-y-4 animate-in fade-in duration-200">
          {expenseError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{expenseError}</span>
            </div>
          )}

          {expenseSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{expenseSuccess}</span>
            </div>
          )}

          {/* راهنمای کوتاه */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            گزارش هزینه‌ها و فاکتورهای تنخواه (اسنپ، پذیرایی، پرینت و...) باید ناظر به مدرسه ثبت شوند تا مدیر سامانه تایید و تجمیع نماید.
          </div>

          {/* انتخاب مدرسه محل هزینه (ناظر به مدرسه) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>
                مدرسه محل فعالیت و هزینه <span className="text-rose-500">*</span>
              </span>
              {selectedSchoolForExpense?.pettyCashAmount ? (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg border border-amber-200">
                  سقف تنخواه: {formatNumberFa(selectedSchoolForExpense.pettyCashAmount)} تومان
                  {selectedSchoolForExpense.pettyCashPaid ? " (واریز شده)" : " (در انتظار واریز)"}
                </span>
              ) : null}
            </label>
            <SearchableSchoolSelect
              schools={schools}
              defaultValue={expenseSchoolId}
              onChange={(id) => setExpenseSchoolId(id)}
              required={true}
              noneLabel="-- انتخاب مدرسه محل انجام هزینه --"
              placeholder="جستجوی مدرسه مورد نظر..."
            />
          </div>

          {/* تاریخ انجام هزینه */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تاریخ انجام هزینه <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
              required
            />
          </div>

          {/* پیش‌فرض‌های عناوین رایج خرج */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              عناوین پرکاربرد خرج (کلیک جهت انتخاب سریع):
            </label>
            <div className="flex flex-wrap gap-1.5">
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
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100/70 border border-slate-200/80 text-slate-700 hover:text-amber-900 transition cursor-pointer"
                  >
                    <Icon className="w-3 h-3 text-amber-600" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* عنوان خرج */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              عنوان خرج <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="مثال: کرایه اسنپ، پذیرایی ناهار، پرینت فرم ارزیابی..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
            />
          </div>

          {/* دسته‌بندی و مبلغ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                دسته‌بندی هزینه
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none"
              >
                <option value="ایاب و ذهاب">🚗 ایاب و ذهاب / اسنپ</option>
                <option value="پذیرایی و غذا">☕ پذیرایی و غذا</option>
                <option value="چاپ و اقلام">📄 چاپ و تکثیر فرم‌ها</option>
                <option value="متفرقه">📦 متفرقه</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                مبلغ هزینه (تومان) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={expenseAmount ? Number(extractCleanNumber(expenseAmount)).toLocaleString("fa-IR") : ""}
                onChange={(e) => setExpenseAmount(extractCleanNumber(e.target.value))}
                placeholder="مثال: ۱۲۰,۰۰۰"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-amber-500 outline-none font-mono"
              />
              {expenseAmount && parseInt(expenseAmount, 10) > 0 && (
                <span className="text-[10px] font-medium text-amber-700 mt-1 block">
                  {numberToPersianWords(parseInt(expenseAmount, 10))} تومان
                </span>
              )}
            </div>
          </div>

          {/* شرح فاکتور یا پیوست توضیحات */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              شرح و توضیحات فاکتور (اختیاری)
            </label>
            <textarea
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              rows={2}
              placeholder="مثال: هزینه رفت به مدرسه با اسنپ و برگشت با مترو، فاکتور ضمیمه شده..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-amber-500 outline-none"
            ></textarea>
          </div>

          {/* دکمه ارسال هزینه */}
          <button
            type="submit"
            disabled={isExpensePending}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isExpensePending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>در حال ثبت فاکتور تنخواه...</span>
              </>
            ) : (
              <>
                <Receipt className="w-3.5 h-3.5" />
                <span>ثبت فاکتور تنخواه ناظر به مدرسه</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
