"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Check,
  X,
  Loader2,
  Calendar,
  Building2,
  User,
  Wallet,
  Car,
  Utensils,
  Printer,
  Coins,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  updateExpenseStatusAction,
  deleteSchoolExpenseAction,
} from "@/app/actions/expense";
import { formatNumberFa } from "@/lib/numberToWords";
import { CopyableSheba } from "@/components/admin/CopyableSheba";

export interface ExpenseRow {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  description: string | null;
  expenseDate: Date | string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: Date | string;
  schoolId: string;
  school: {
    id: string;
    name: string;
    code: string | null;
    city: string;
    district: string;
    pettyCashAmount: number | null;
  };
  evaluatorId: string;
  evaluator: {
    id: string;
    fullName: string;
    username: string;
    shebaNumber?: string | null;
  };
}

interface AdminExpensesClientProps {
  initialExpenses: ExpenseRow[];
  schools: Array<{ id: string; name: string }>;
  evaluators: Array<{ id: string; fullName: string }>;
}

export default function AdminExpensesClient({
  initialExpenses,
  schools,
  evaluators,
}: AdminExpensesClientProps) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("ALL");
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // فیلتر کردن هوشمند
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedSchoolId !== "ALL" && e.schoolId !== selectedSchoolId) return false;
      if (selectedEvaluatorId !== "ALL" && e.evaluatorId !== selectedEvaluatorId) return false;
      if (selectedStatus !== "ALL" && e.status !== selectedStatus) return false;
      if (selectedCategory !== "ALL" && e.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = e.title.toLowerCase().includes(q);
        const inDesc = e.description ? e.description.toLowerCase().includes(q) : false;
        const inSchool = e.school.name.toLowerCase().includes(q);
        const inEvaluator = e.evaluator.fullName.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inSchool && !inEvaluator) return false;
      }

      return true;
    });
  }, [expenses, selectedSchoolId, selectedEvaluatorId, selectedStatus, selectedCategory, searchQuery]);

  // سرجمع محاسبات
  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = filtered.filter((e) => e.status === "APPROVED").reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = filtered.filter((e) => e.status === "PENDING").reduce((sum, e) => sum + e.amount, 0);
  const rejectedAmount = filtered.filter((e) => e.status === "REJECTED").reduce((sum, e) => sum + e.amount, 0);

  // تایید
  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await updateExpenseStatusAction({ id, status: "APPROVED" });
    setLoadingId(null);
    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "APPROVED", adminNotes: null } : item))
      );
    }
  };

  // رد
  const handleReject = async (id: string) => {
    setLoadingId(id);
    const res = await updateExpenseStatusAction({ id, status: "REJECTED", adminNotes: rejectNotes });
    setLoadingId(null);
    setRejectingId(null);
    setRejectNotes("");

    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "REJECTED", adminNotes: rejectNotes } : item))
      );
    }
  };

  // حذف
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این ردیف هزینه اطمینان دارید؟")) return;
    setLoadingId(id);
    const res = await deleteSchoolExpenseAction(id);
    setLoadingId(null);
    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // خروجی CSV ساده
  const handleExportCSV = () => {
    const headers = ["ردیف", "مدرسه", "کد مدرسه", "عنوان خرج", "دسته‌بندی", "مبلغ (تومان)", "ارزیاب", "شماره شبا", "تاریخ هزینه", "وضعیت", "توضیحات"];
    const rows = filtered.map((e, idx) => [
      idx + 1,
      `"${e.school.name}"`,
      e.school.code || "",
      `"${e.title}"`,
      `"${e.category || ""}"`,
      e.amount,
      `"${e.evaluator.fullName}"`,
      e.evaluator.shebaNumber || "",
      new Date(e.expenseDate).toLocaleDateString("fa-IR"),
      e.status === "APPROVED" ? "تایید شده" : e.status === "REJECTED" ? "رد شده" : "در انتظار",
      `"${(e.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `school_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری بالا */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">کل مخارج فیلترشده</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatNumberFa(totalAmount)}
            </span>
            <span className="text-xs font-bold text-slate-500">تومان</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {filtered.length} فاکتور ثبت‌شده
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">مخارج تاییدشده</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {formatNumberFa(approvedAmount)}
            </span>
            <span className="text-xs font-bold text-emerald-600">تومان</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {filtered.filter((e) => e.status === "APPROVED").length} مورد نهایی
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">در انتظار بررسی و تایید</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
              {formatNumberFa(pendingAmount)}
            </span>
            <span className="text-xs font-bold text-amber-600">تومان</span>
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            {filtered.filter((e) => e.status === "PENDING").length} فاکتور منتظر اقدام
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">هزینه‌های ردشده</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              {formatNumberFa(rejectedAmount)}
            </span>
            <span className="text-xs font-bold text-rose-600">تومان</span>
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-1 block">
            {filtered.filter((e) => e.status === "REJECTED").length} مورد عدم تایید
          </span>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* کادر جستجو */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در عنوان، شرح، مدرسه، ارزیاب..."
              className="w-full text-xs pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800"
            />
          </div>

          {/* فیلتر مدرسه */}
          <div>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800"
            >
              <option value="ALL">🏫 همه مدارس ({schools.length})</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* فیلتر ارزیاب */}
          <div>
            <select
              value={selectedEvaluatorId}
              onChange={(e) => setSelectedEvaluatorId(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800"
            >
              <option value="ALL">👤 همه ارزیاب‌ها ({evaluators.length})</option>
              {evaluators.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* فیلتر دسته‌بندی */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-amber-500 transition text-slate-800"
            >
              <option value="ALL">🏷️ همه دسته‌بندی‌ها</option>
              <option value="ایاب و ذهاب">🚗 ایاب و ذهاب / اسنپ</option>
              <option value="پذیرایی و غذا">☕ پذیرایی و غذا</option>
              <option value="چاپ و اقلام">📄 چاپ و نوشت‌افزار</option>
              <option value="متفرقه">📦 متفرقه</option>
            </select>
          </div>
        </div>

        {/* فیلتر وضعیت و دکمه خروجی */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 ml-1">وضعیت:</span>
            {(
              [
                { key: "ALL", label: "همه موارد" },
                { key: "PENDING", label: `در انتظار (${pendingAmount > 0 ? expenses.filter((e) => e.status === "PENDING").length : 0})` },
                { key: "APPROVED", label: "تایید شده" },
                { key: "REJECTED", label: "رد شده" },
              ] as const
            ).map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedStatus === st.key
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer self-end sm:self-auto"
            title="دانلود فایل اکسل / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی اکسل (CSV)</span>
          </button>
        </div>
      </div>

      {/* جدول فاکتورهای تنخواه */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-sm text-slate-700">هیچ فاکتور هزینه‌ای یافت نشد</h3>
            <p className="text-xs text-slate-400 mt-1">
              تنظیمات فیلتر یا عبارت جستجوی خود را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5 pr-5">مدرسه</th>
                  <th className="p-3.5">عنوان خرج و شرح</th>
                  <th className="p-3.5">ارزیاب و شبا</th>
                  <th className="p-3.5 text-left">مبلغ (تومان)</th>
                  <th className="p-3.5 text-center">تاریخ</th>
                  <th className="p-3.5 text-center">وضعیت</th>
                  <th className="p-3.5 pl-5 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((item) => {
                  const dateStr = new Date(item.expenseDate).toLocaleDateString("fa-IR");
                  const isLoading = loadingId === item.id;
                  const isRejecting = rejectingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* مدرسه */}
                      <td className="p-3.5 pr-5 align-top">
                        <Link
                          href={`/admin/schools/${item.school.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 group"
                          title="مشاهده شناسنامه مدرسه"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                          <span>{item.school.name}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.school.city} - {item.school.district}
                        </span>
                      </td>

                      {/* عنوان و شرح */}
                      <td className="p-3.5 align-top max-w-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {item.category?.includes("ایاب") ? (
                            <Car className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          ) : item.category?.includes("غذا") ? (
                            <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : item.category?.includes("چاپ") ? (
                            <Printer className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span>{item.title}</span>
                          {item.category && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-medium">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {item.adminNotes && (
                          <span className="inline-block text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-1 border border-rose-200">
                            علت رد: {item.adminNotes}
                          </span>
                        )}
                      </td>

                      {/* ارزیاب و شبا */}
                      <td className="p-3.5 align-top">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.evaluator.fullName}</span>
                        </div>
                        <div className="mt-1">
                          <CopyableSheba
                            shebaNumber={item.evaluator.shebaNumber}
                            evaluatorId={item.evaluator.id}
                            evaluatorName={item.evaluator.fullName}
                            variant="compact"
                            allowEdit={false}
                          />
                        </div>
                      </td>

                      {/* مبلغ */}
                      <td className="p-3.5 align-top text-left whitespace-nowrap">
                        <div className="inline-flex items-baseline gap-1" dir="rtl">
                          <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                            {formatNumberFa(item.amount)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            تومان
                          </span>
                        </div>
                      </td>

                      {/* تاریخ */}
                      <td className="p-3.5 align-top text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* وضعیت */}
                      <td className="p-3.5 align-top text-center whitespace-nowrap">
                        {item.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            تایید شده
                          </span>
                        ) : item.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            رد شده
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                            <Clock className="w-3 h-3 text-amber-500" />
                            در انتظار
                          </span>
                        )}
                      </td>

                      {/* عملیات */}
                      <td className="p-3.5 pl-5 align-top text-left whitespace-nowrap">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => handleApprove(item.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-0.5"
                                title="تایید هزینه"
                              >
                                <Check className="w-3 h-3" />
                                <span>تایید</span>
                              </button>
                            )}

                            {item.status !== "REJECTED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(item.id);
                                  setRejectNotes(item.adminNotes || "");
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-0.5"
                                title="رد هزینه با ثبت دلیل"
                              >
                                <X className="w-3 h-3" />
                                <span>رد</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                              title="حذف هزینه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* پاپ‌آپ علت رد */}
                        {isRejecting && (
                          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-right whitespace-normal max-w-xs">
                            <input
                              type="text"
                              value={rejectNotes}
                              onChange={(e) => setRejectNotes(e.target.value)}
                              placeholder="علت رد هزینه..."
                              className="w-full text-xs p-1.5 bg-white border border-rose-300 rounded-lg outline-none text-slate-800"
                            />
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setRejectingId(null)}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600 hover:bg-slate-50"
                              >
                                انصراف
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(item.id)}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700"
                              >
                                ثبت رد
                              </button>
                            </div>
                          </div>
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
    </div>
  );
}
