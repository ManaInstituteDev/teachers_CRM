"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Coins,
  TrendingDown,
  Calendar,
  Tag,
  FileText,
  Wallet,
  Car,
  Utensils,
  Printer,
  Sparkles,
  Check,
} from "lucide-react";
import {
  addSchoolExpenseAction,
  deleteSchoolExpenseAction,
  getSchoolExpensesAction,
} from "@/app/actions/expense";
import { numberToPersianWords, formatNumberFa, extractCleanNumber } from "@/lib/numberToWords";

interface SchoolExpenseModalProps {
  schoolId: string;
  schoolName: string;
  schoolCode?: string | null;
  initialExpensesCount?: number;
  initialTotalExpenses?: number;
  initialPettyCashAmount?: number | null;
  buttonVariant?: "default" | "compact" | "card";
  buttonClassName?: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  description: string | null;
  expenseDate: Date | string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: Date | string;
  evaluator?: {
    id: string;
    fullName: string;
    username: string;
  };
}

const COMMON_TITLES = [
  { label: "کرایه اسنپ و رفت‌وآمد", category: "ایاب و ذهاب", icon: Car },
  { label: "ناهار و پذیرایی ارزیابی", category: "پذیرایی و غذا", icon: Utensils },
  { label: "پرینت فرم‌ها و تکثیر", category: "چاپ و اقلام", icon: Printer },
  { label: "هزینه پارکینگ / عوارض", category: "ایاب و ذهاب", icon: Car },
  { label: "لوازم‌التحریر و اقلام مصرفی", category: "چاپ و اقلام", icon: Tag },
];

export default function SchoolExpenseModal({
  schoolId,
  schoolName,
  schoolCode,
  initialExpensesCount = 0,
  initialTotalExpenses = 0,
  initialPettyCashAmount = null,
  buttonVariant = "default",
  buttonClassName = "",
}: SchoolExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "new">("new");

  // وضعیت داده‌ها
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState({
    totalAmount: initialTotalExpenses,
    approvedAmount: 0,
    pendingAmount: 0,
    pettyCashAmount: initialPettyCashAmount,
    remainingBalance: (initialPettyCashAmount || 0) - initialTotalExpenses,
  });

  // فرم ثبت هزینه جدید
  const [title, setTitle] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState("ایاب و ذهاب");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // حذف هزینه
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // بارگذاری داده‌ها هنگام باز شدن مودال
  const loadData = async () => {
    setLoading(true);
    const res = await getSchoolExpensesAction(schoolId);
    setLoading(false);

    if (res?.success && res.expenses) {
      setExpenses(res.expenses as any);
      if (res.summary) {
        setSummary(res.summary);
      }
      // اگر قبلاً هزینه ثبت شده، تب پیش‌فرض لیست باشد؛ در غیر اینصورت فرم ثبت
      if (res.expenses.length > 0) {
        setActiveTab("list");
      }
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setFormError(null);
    setFormSuccess(null);
    loadData();
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormError(null);
    setFormSuccess(null);
  };

  // تغییر فیلد مبلغ با حفظ اعداد و حذف کاراکترهای اضافه
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = extractCleanNumber(e.target.value);
    setRawAmount(val);
  };

  const numericAmount = parseInt(rawAmount, 10) || 0;

  // ثبت هزینه جدید
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title.trim()) {
      setFormError("لطفاً عنوان خرج را وارد کنید.");
      return;
    }

    if (numericAmount <= 0) {
      setFormError("لطفاً مبلغ معتبری به تومان وارد کنید.");
      return;
    }

    startTransition(async () => {
      const res = await addSchoolExpenseAction({
        schoolId,
        title: title.trim(),
        amount: numericAmount,
        category,
        description: description.trim() || undefined,
        expenseDate,
      });

      if (res?.error) {
        setFormError(res.error);
      } else {
        setFormSuccess("هزینه با موفقیت در گزارش تنخواه ثبت گردید.");
        setTitle("");
        setRawAmount("");
        setDescription("");
        // به‌روزرسانی لیست
        loadData();
        setTimeout(() => {
          setFormSuccess(null);
          setActiveTab("list");
        }, 1200);
      }
    });
  };

  // حذف ردیف هزینه
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) return;

    setDeletingId(id);
    const res = await deleteSchoolExpenseAction(id);
    setDeletingId(null);

    if (res?.error) {
      alert(res.error);
    } else {
      loadData();
    }
  };

  const currentCount = expenses.length > 0 ? expenses.length : initialExpensesCount;
  const currentTotal = summary.totalAmount > 0 ? summary.totalAmount : initialTotalExpenses;

  return (
    <>
      {/* دکمه باز کردن مودال در کارت مدرسه */}
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold transition rounded-xl cursor-pointer ${currentTotal > 0
            ? "text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-300/80 px-3 py-2 shadow-xs"
            : "text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 px-3 py-2"
          } ${buttonClassName}`}
        title="ثبت و مشاهده گزارش هزینه‌های تنخواه این مدرسه"
      >
        <Receipt className={`w-3.5 h-3.5 ${currentTotal > 0 ? "text-amber-600" : "text-slate-500"}`} />
        <span>تنخواه و مخارج</span>
        {currentTotal > 0 ? (
          <span className="text-[11px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
            {formatNumberFa(currentTotal)} ت
          </span>
        ) : (
          currentCount > 0 && (
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
              {currentCount}
            </span>
          )
        )}
      </button>

      {/* مودال دیالوگ شیشه‌ای لوکس */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-right"
            dir="rtl"
          >
            {/* هدر مودال */}
            <div className="p-4 sm:p-5 border-b border-slate-150 bg-linear-to-l from-amber-500/10 via-slate-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>گزارش تنخواه و مخارج</span>
                    <span className="text-amber-700 font-extrabold text-xs bg-amber-100 border border-amber-300/80 px-2 py-0.5 rounded-lg">
                      {schoolName}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ثبت هزینه‌های رفت‌وآمد، پذیرایی و اقلام ارزیابی جهت تسویه تنخواه
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* کارت‌های آماری سرجمع مالی */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-400 font-medium block">
                  مجموع کل مخارج:
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                    {formatNumberFa(summary.totalAmount)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">تومان</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {expenses.length} فاکتور ثبت‌شده
                </span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-400 font-medium block">
                  تنخواه واریزی اولیه:
                </span>
                {summary.pettyCashAmount ? (
                  <>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base sm:text-xl font-black text-emerald-700 tracking-tight">
                        {formatNumberFa(summary.pettyCashAmount)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">تومان</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                      واریز شده توسط مدیر
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-slate-500 block mt-1.5">
                      ثبت‌نشده
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      محاسبه بر اساس مخارج
                    </span>
                  </>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-400 font-medium block">
                  وضعیت تراز مالی:
                </span>
                {summary.pettyCashAmount ? (
                  summary.remainingBalance >= 0 ? (
                    <div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base sm:text-lg font-black text-emerald-600 tracking-tight">
                          {formatNumberFa(summary.remainingBalance)}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">تومان</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                        مانده تنخواه نزد شما
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base sm:text-lg font-black text-rose-600 tracking-tight">
                          {formatNumberFa(Math.abs(summary.remainingBalance))}
                        </span>
                        <span className="text-xs font-bold text-rose-600">تومان</span>
                      </div>
                      <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                        طلب شما (مازاد تنخواه)
                      </span>
                    </div>
                  )
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base sm:text-lg font-black text-amber-700 tracking-tight">
                        {formatNumberFa(summary.totalAmount)}
                      </span>
                      <span className="text-xs font-bold text-amber-700">تومان</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                      مبلغ قابل تسویه
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* تب‌های جابه‌جایی: ثبت خرج جدید / مشاهده ریز مخارج */}
            <div className="px-4 pt-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("new")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${activeTab === "new"
                      ? "border-amber-500 text-amber-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت هزینه جدید</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${activeTab === "list"
                      ? "border-amber-500 text-amber-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>ریز مخارج ثبت‌شده ({expenses.length})</span>
                </button>
              </div>

              {loading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
            </div>

            {/* بدنه محتوا */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* فرم ثبت هزینه جدید */}
              {activeTab === "new" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* پیشنهادات سریع عناوین */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>عناوین پرکاربرد (کلیک جهت انتخاب سریع):</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_TITLES.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => {
                            setTitle(t.label);
                            setCategory(t.category);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-xl border transition cursor-pointer flex items-center gap-1 ${title === t.label
                              ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                        >
                          <t.icon className="w-3 h-3 text-slate-400" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* عنوان و دسته‌بندی */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        عنوان خرج <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: کرایه اسنپ رفت و برگشت به مدرسه..."
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        دسته‌بندی
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800"
                      >
                        <option value="ایاب و ذهاب">🚗 ایاب و ذهاب / اسنپ</option>
                        <option value="پذیرایی و غذا">☕ پذیرایی و غذا</option>
                        <option value="چاپ و اقلام">📄 چاپ، تکثیر و نوشت‌افزار</option>
                        <option value="متفرقه">📦 سایر و متفرقه</option>
                      </select>
                    </div>
                  </div>

                  {/* مبلغ به تومان و تاریخ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        مبلغ هزینه (به تومان) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rawAmount ? Number(rawAmount).toLocaleString("fa-IR") : ""}
                          onChange={handleAmountChange}
                          placeholder="مثال: ۱۵۰,۰۰۰"
                          required
                          className="w-full text-base font-bold pl-14 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-slate-800"
                        />
                        <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                          تومان
                        </span>
                      </div>
                      {numericAmount > 0 && (
                        <p className="text-[11px] text-amber-700 font-medium mt-1 pr-1">
                          معادل حروفی: <strong>{numberToPersianWords(numericAmount)}</strong>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        تاریخ انجام هزینه
                      </label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  {/* شرح و جزییات */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      توضیحات و شرح جزییات هزینه (اختیاری)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="علت هزینه، مسیر مبدا/مقصد، اقلام خریداری شده و شماره پیگیری را در صورت تمایل بنویسید..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800 resize-none"
                    />
                  </div>

                  {/* پیام خطا یا موفقیت */}
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* دکمه ثبت */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>در حال ثبت هزینه...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>ثبت و ذخیره در تنخواه</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* لیست مخارج ثبت‌شده */}
              {activeTab === "list" && (
                <div className="space-y-3">
                  {expenses.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold">هنوز هیچ هزینه‌ای برای این مدرسه ثبت نشده است.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("new")}
                        className="mt-3 text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                      >
                        + ثبت اولین هزینه تنخواه
                      </button>
                    </div>
                  ) : (
                    expenses.map((item) => {
                      const dateStr = new Date(item.expenseDate).toLocaleDateString("fa-IR");
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                {item.category?.includes("ایاب") ? (
                                  <Car className="w-4 h-4 text-sky-600" />
                                ) : item.category?.includes("غذا") || item.category?.includes("پذیرایی") ? (
                                  <Utensils className="w-4 h-4 text-amber-600" />
                                ) : item.category?.includes("چاپ") ? (
                                  <Printer className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <Coins className="w-4 h-4 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                  {item.category && (
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                      {item.category}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 font-mono">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {dateStr}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-left shrink-0">
                              <div className="flex items-baseline gap-1 justify-end">
                                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                  {formatNumberFa(item.amount)}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  تومان
                                </span>
                              </div>
                              <div className="mt-1">
                                {item.status === "APPROVED" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    تایید مدیر
                                  </span>
                                ) : item.status === "REJECTED" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                                    <XCircle className="w-2.5 h-2.5 text-rose-600" />
                                    رد شده
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                    <Clock className="w-2.5 h-2.5 text-amber-500" />
                                    در انتظار بررسی
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* توضیحات و یادداشت مدیر */}
                          {item.description && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-150 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {item.adminNotes && (
                            <div className="text-[11px] p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-800">
                              <span className="font-bold">یادداشت مدیر: </span>
                              {item.adminNotes}
                            </div>
                          )}

                          {/* دکمه عملیات حذف */}
                          <div className="pt-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="حذف این ردیف هزینه"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* فوتر مودال */}
            <div className="p-3 sm:p-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                <span>گزارش تنخواه مالی سامانه رصد و ارزیابی مدارس</span>
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
