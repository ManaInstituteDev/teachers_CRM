"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  Receipt,
  Trash2,
  School,
  CheckCircle2,
  Clock as ClockIcon,
  XCircle,
  Car,
  Utensils,
  Printer,
  Tag,
  Coins,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { deleteTimesheetAction } from "@/app/actions/timesheet";
import { deleteSchoolExpenseAction } from "@/app/actions/expense";
import { formatNumberFa } from "@/lib/numberToWords";

export interface TimesheetLogItem {
  id: string;
  date: Date | string;
  durationMinutes: number;
  workerType: "EVALUATOR" | "ASSISTANT_EVALUATOR";
  description: string | null;
  assistantEvaluator?: { fullName: string } | null;
  school?: { id: string; name: string } | null;
}

export interface ExpenseRecordItem {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  description: string | null;
  expenseDate: Date | string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  school: {
    id: string;
    name: string;
    district?: string | null;
    pettyCashAmount?: number | null;
  };
}

interface EvaluatorRecordsClientProps {
  logs: TimesheetLogItem[];
  expenses: ExpenseRecordItem[];
}

export default function EvaluatorRecordsClient({
  logs: initialLogs,
  expenses: initialExpenses,
}: EvaluatorRecordsClientProps) {
  const [activeTab, setActiveTab] = useState<"timesheets" | "expenses">("timesheets");
  const [logs, setLogs] = useState<TimesheetLogItem[]>(initialLogs);
  const [expenses, setExpenses] = useState<ExpenseRecordItem[]>(initialExpenses);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // حذف ساعت کارکرد
  const handleDeleteTimesheet = (id: string) => {
    if (!confirm("آیا از حذف این ساعت کارکرد اطمینان دارید؟")) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteTimesheetAction(id);
        setLogs((prev) => prev.filter((item) => item.id !== id));
      } catch (err: any) {
        alert(err.message || "خطا در حذف کارکرد");
      } finally {
        setDeletingId(null);
      }
    });
  };

  // حذف فاکتور هزینه
  const handleDeleteExpense = (id: string) => {
    if (!confirm("آیا از حذف این ردیف هزینه تنخواه اطمینان دارید؟")) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteSchoolExpenseAction(id);
      if (res?.error) {
        alert(res.error);
      } else {
        setExpenses((prev) => prev.filter((item) => item.id !== id));
      }
      setDeletingId(null);
    });
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* هدر بخش و تب‌های انتخاب سوابق */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("timesheets")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "timesheets"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>سوابق ساعت کاری ({logs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "expenses"
                ? "bg-white text-amber-700 shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>سوابق هزینه‌ها و تنخواه ({expenses.length})</span>
          </button>
        </div>

        {activeTab === "expenses" && expenses.length > 0 && (
          <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-3 py-1 rounded-xl self-end sm:self-auto">
            مجموع مخارج ثبت‌شده: <span className="font-black font-mono">{formatNumberFa(totalExpenseAmount)}</span> تومان
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* لیست سوابق کارکرد */}
      {/* ============================================================== */}
      {activeTab === "timesheets" && (
        <div>
          {logs.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              هنوز ساعت کاری ثبت نشده است. با استفاده از فرم مقابل کارکرد خود یا کمک‌ارزیاب را ثبت کنید.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 pr-5">تاریخ</th>
                    <th className="py-3.5 px-4">نیروی کار</th>
                    <th className="py-3.5 px-4 text-center">مدت زمان</th>
                    <th className="py-3.5 px-4">شرح فعالیت / مدرسه</th>
                    <th className="py-3.5 px-4 pl-5 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const hours = Math.floor(log.durationMinutes / 60);
                    const mins = log.durationMinutes % 60;
                    const dateFormatted = new Date(log.date).toLocaleDateString("fa-IR");
                    const isDeleting = deletingId === log.id;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 pr-5 font-mono text-slate-600 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.workerType === "EVALUATOR" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                              خودم (ارزیاب)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                              کمک‌ارزیاب: {log.assistantEvaluator?.fullName || "نامشخص"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                          {hours > 0 && `${hours} ساعت `}
                          {mins > 0 && `${mins} دقیقه`}
                          {hours === 0 && mins === 0 && "۰ دقیقه"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                          <p className="line-clamp-2 leading-relaxed">{log.description || "—"}</p>
                          {log.school && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-100">
                              <School className="w-3 h-3 text-emerald-600" />
                              {log.school.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 pl-5 text-left whitespace-nowrap">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteTimesheet(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                            title="حذف رکورد ساعت کاری"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* لیست سوابق هزینه‌ها و فاکتورهای تنخواه */}
      {/* ============================================================== */}
      {activeTab === "expenses" && (
        <div>
          {expenses.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              هنوز هیچ گزارش هزینه یا تنخواهی ثبت نشده است. از تب «ثبت هزینه و تنخواه» در فرم مقابل فاکتورهای خود را ناظر به مدرسه ثبت کنید.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 pr-5">تاریخ</th>
                    <th className="py-3.5 px-4">مدرسه ناظر</th>
                    <th className="py-3.5 px-4">عنوان و شرح خرج</th>
                    <th className="py-3.5 px-4 text-left">مبلغ (تومان)</th>
                    <th className="py-3.5 px-4 text-center">وضعیت تایید</th>
                    <th className="py-3.5 px-4 pl-5 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => {
                    const dateFormatted = new Date(expense.expenseDate).toLocaleDateString("fa-IR");
                    const isDeleting = deletingId === expense.id;

                    return (
                      <tr key={expense.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 pr-5 font-mono text-slate-600 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* مدرسه */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <School className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{expense.school.name}</span>
                          </div>
                          {expense.school.district && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              منطقه {expense.school.district}
                            </span>
                          )}
                        </td>

                        {/* عنوان و شرح خرج */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            {expense.category?.includes("ایاب") ? (
                              <Car className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            ) : expense.category?.includes("غذا") ? (
                              <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            ) : expense.category?.includes("چاپ") ? (
                              <Printer className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            ) : (
                              <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span>{expense.title}</span>
                            {expense.category && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-normal">
                                {expense.category}
                              </span>
                            )}
                          </div>
                          {expense.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {expense.description}
                            </p>
                          )}
                          {expense.adminNotes && (
                            <div className="mt-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              توضیح مدیر: {expense.adminNotes}
                            </div>
                          )}
                        </td>

                        {/* مبلغ */}
                        <td className="py-3.5 px-4 text-left whitespace-nowrap">
                          <div className="inline-flex items-baseline gap-1" dir="rtl">
                            <span className="font-black text-sm text-slate-900 tracking-tight">
                              {formatNumberFa(expense.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400">تومان</span>
                          </div>
                        </td>

                        {/* وضعیت تایید */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                              <ClockIcon className="w-3 h-3 text-amber-500" />
                              در انتظار تایید
                            </span>
                          )}
                        </td>

                        {/* عملیات */}
                        <td className="py-3.5 px-4 pl-5 text-left whitespace-nowrap">
                          {expense.status !== "APPROVED" ? (
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                              title="حذف هزینه"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">نهایی‌شده</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
