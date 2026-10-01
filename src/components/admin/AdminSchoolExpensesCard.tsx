"use client";

import { useState } from "react";
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Calendar,
  Tag,
  Coins,
  Wallet,
  Car,
  Utensils,
  Printer,
  ChevronDown,
  User,
  AlertCircle,
} from "lucide-react";
import {
  updateExpenseStatusAction,
  updateSchoolPettyCashAllocationAction,
  deleteSchoolExpenseAction,
} from "@/app/actions/expense";
import { formatToman, numberToPersianWords } from "@/lib/numberToWords";
import { CopyableSheba } from "@/components/admin/CopyableSheba";

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  description: string | null;
  expenseDate: Date | string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: Date | string;
  evaluator: {
    id: string;
    fullName: string;
    username: string;
    shebaNumber?: string | null;
  };
}

interface AdminSchoolExpensesCardProps {
  schoolId: string;
  schoolName: string;
  pettyCashAmount: number | null;
  expenses: ExpenseRecord[];
}

export function AdminSchoolExpensesCard({
  schoolId,
  schoolName,
  pettyCashAmount: initialPettyCash,
  expenses: initialExpenses,
}: AdminSchoolExpensesCardProps) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses);
  const [pettyCash, setPettyCash] = useState<number | null>(initialPettyCash);

  // ویرایش مبلغ تنخواه واریزی مصوب
  const [isEditingPettyCash, setIsEditingPettyCash] = useState(false);
  const [pettyCashInput, setPettyCashInput] = useState(
    initialPettyCash ? initialPettyCash.toString() : ""
  );
  const [savingPettyCash, setSavingPettyCash] = useState(false);

  // تغییر وضعیت (تایید/رد)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // فیلتر وضعیت در لیست
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  // محاسبات مالی
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + e.amount, 0);

  const allocated = pettyCash || 0;
  const balance = allocated - totalAmount;

  // ذخیره سقف / واریزی تنخواه
  const handleSavePettyCash = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPettyCash(true);
    const num = pettyCashInput.trim() ? parseInt(pettyCashInput.replace(/[^\d]/g, ""), 10) : null;
    const res = await updateSchoolPettyCashAllocationAction({
      schoolId,
      pettyCashAmount: num,
    });
    setSavingPettyCash(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setPettyCash(num);
      setIsEditingPettyCash(false);
    }
  };

  // تایید مستقیم
  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    const res = await updateExpenseStatusAction({
      id,
      status: "APPROVED",
    });
    setActionLoadingId(null);
    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "APPROVED", adminNotes: null } : item))
      );
    }
  };

  // ارسال رد هزینه با یادداشت
  const handleRejectSubmit = async (id: string) => {
    setActionLoadingId(id);
    const res = await updateExpenseStatusAction({
      id,
      status: "REJECTED",
      adminNotes: rejectNotes,
    });
    setActionLoadingId(null);
    setRejectingId(null);
    setRejectNotes("");

    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "REJECTED", adminNotes: rejectNotes } : item
        )
      );
    }
  };

  // حذف ردیف هزینه
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) return;
    setActionLoadingId(id);
    const res = await deleteSchoolExpenseAction(id);
    setActionLoadingId(null);
    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (statusFilter === "ALL") return true;
    return e.status === statusFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* هدر بخش تنخواه */}
      <div className="p-5 sm:p-6 bg-linear-to-l from-amber-500/10 via-slate-50 to-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>گزارش تنخواه و مخارج مدرسه</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                {expenses.length} فاکتور ثبت‌شده
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              مدیریت و پایش هزینه‌های انجام‌شده توسط ارزیاب و تسویه تنخواه واریزی
            </p>
          </div>
        </div>

        {/* تنظیم مبلغ تنخواه مصوب */}
        <div>
          {isEditingPettyCash ? (
            <form onSubmit={handleSavePettyCash} className="flex items-center gap-1.5 animate-in fade-in">
              <input
                type="text"
                inputMode="numeric"
                value={pettyCashInput}
                onChange={(e) => setPettyCashInput(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="مبلغ تنخواه به تومان..."
                autoFocus
                dir="ltr"
                className="font-mono text-xs px-2.5 py-1.5 bg-white border border-amber-400 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 w-36 text-slate-800 font-bold"
              />
              <button
                type="submit"
                disabled={savingPettyCash}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                title="ذخیره"
              >
                {savingPettyCash ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPettyCash(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                title="انصراف"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
                <Wallet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-xs text-slate-500">تنخواه واریزی:</span>
                {pettyCash ? (
                  <span className="font-mono text-xs font-black text-slate-800" dir="ltr">
                    {formatToman(pettyCash)}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">ثبت‌نشده</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPettyCashInput(pettyCash ? pettyCash.toString() : "");
                  setIsEditingPettyCash(true);
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 border border-slate-200 transition cursor-pointer"
                title="تعیین یا ویرایش مبلغ تنخواه واریزی مصوب"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* کارت‌های آماری سرجمع مالی */}
      <div className="p-5 bg-slate-50/60 border-b border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium block">کل مخارج ثبت‌شده</span>
          <span className="font-mono text-base font-black text-slate-900 block mt-1" dir="ltr">
            {formatToman(totalAmount)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {expenses.length} فاکتور ارزیاب
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium block">مخارج تاییدشده</span>
          <span className="font-mono text-base font-black text-emerald-700 block mt-1" dir="ltr">
            {formatToman(approvedAmount)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            {expenses.filter((e) => e.status === "APPROVED").length} مورد نهایی
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium block">در انتظار بررسی مدیر</span>
          <span className="font-mono text-base font-black text-amber-700 block mt-1" dir="ltr">
            {formatToman(pendingAmount)}
          </span>
          <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">
            {expenses.filter((e) => e.status === "PENDING").length} مورد نیاز به تایید
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium block">تراز و وضعیت تسویه</span>
          {pettyCash ? (
            balance >= 0 ? (
              <div>
                <span className="font-mono text-base font-black text-emerald-600 block mt-1" dir="ltr">
                  {formatToman(balance)}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                  مانده تنخواه نزد ارزیاب
                </span>
              </div>
            ) : (
              <div>
                <span className="font-mono text-base font-black text-rose-600 block mt-1" dir="ltr">
                  {formatToman(Math.abs(balance))}
                </span>
                <span className="text-[11px] text-rose-600 font-bold block mt-0.5">
                  طلب ارزیاب از سازمان
                </span>
              </div>
            )
          ) : (
            <div>
              <span className="font-mono text-base font-black text-slate-700 block mt-1" dir="ltr">
                {formatToman(totalAmount)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                قابل تسویه نقدی
              </span>
            </div>
          )}
        </div>
      </div>

      {/* نوار فیلتر وضعیت فاکتورها */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-600 ml-1">فیلتر وضعیت:</span>
          {(
            [
              { key: "ALL", label: "همه مخارج" },
              { key: "PENDING", label: `در انتظار (${pendingAmount > 0 ? expenses.filter((e) => e.status === "PENDING").length : 0})` },
              { key: "APPROVED", label: "تایید شده" },
              { key: "REJECTED", label: "رد شده" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${statusFilter === tab.key
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          نمایش {filteredExpenses.length} از {expenses.length} مورد
        </span>
      </div>

      {/* جدول / لیست هزینه‌ها */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-bold">هیچ هزینه‌ای با فیلتر انتخابی یافت نشد.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredExpenses.map((expense) => {
            const dateStr = new Date(expense.expenseDate).toLocaleDateString("fa-IR");
            const isLoadingThis = actionLoadingId === expense.id;
            const isRejectingThis = rejectingId === expense.id;

            return (
              <div key={expense.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {expense.category?.includes("ایاب") ? (
                        <Car className="w-4 h-4 text-sky-600" />
                      ) : expense.category?.includes("غذا") || expense.category?.includes("پذیرایی") ? (
                        <Utensils className="w-4 h-4 text-amber-600" />
                      ) : expense.category?.includes("چاپ") ? (
                        <Printer className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Coins className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {expense.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                        {expense.category && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                            {expense.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 mr-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-700 text-[11px]">
                            {expense.evaluator.fullName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* مبلغ و نشان وضعیت */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span className="font-mono text-base font-black text-slate-900" dir="ltr">
                      {formatToman(expense.amount)}
                    </span>

                    <div>
                      {expense.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          تایید شده
                        </span>
                      ) : expense.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          رد شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3 h-3 text-amber-500" />
                          در انتظار تایید
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* شرح هزینه */}
                {expense.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-150 leading-relaxed">
                    {expense.description}
                  </p>
                )}

                {/* یادداشت رد هزینه در صورت وجود */}
                {expense.adminNotes && (
                  <div className="text-xs p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold">علت رد توسط مدیر: </span>
                    {expense.adminNotes}
                  </div>
                )}

                {/* شماره شبا ارزیاب و دکمه‌های تایید / رد توسط مدیر */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">شبای ارزیاب:</span>
                    <CopyableSheba
                      shebaNumber={expense.evaluator.shebaNumber}
                      evaluatorId={expense.evaluator.id}
                      evaluatorName={expense.evaluator.fullName}
                      variant="compact"
                      allowEdit={false}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    ) : (
                      <>
                        {expense.status !== "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(expense.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            title="تایید این هزینه"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تایید</span>
                          </button>
                        )}

                        {expense.status !== "REJECTED" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(expense.id);
                              setRejectNotes(expense.adminNotes || "");
                            }}
                            className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            title="رد این هزینه با ذکر دلیل"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رد</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(expense.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                          title="حذف دائمی رکورد هزینه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* فرم پاپ‌آپ کوچک جهت درج علت رد هزینه */}
                {isRejectingThis && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-rose-900">
                      علت رد هزینه را برای اطلاع ارزیاب وارد کنید:
                    </label>
                    <input
                      type="text"
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder="مثال: عدم تطابق با مسیر ارزیابی یا فاکتور ناقص..."
                      className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-xl outline-none focus:ring-1 focus:ring-rose-500 text-slate-800"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectSubmit(expense.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
                      >
                        ثبت رد هزینه
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
