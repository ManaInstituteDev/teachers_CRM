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
  ChevronDown,
  ChevronUp,
  Edit2,
  CheckCheck,
  AlertTriangle,
  Layers,
  ListFilter,
} from "lucide-react";
import {
  updateExpenseStatusAction,
  deleteSchoolExpenseAction,
  updateSchoolPettyCashAllocationAction,
  approveAllSchoolExpensesAction,
} from "@/app/actions/expense";
import { formatNumberFa, extractCleanNumber, numberToPersianWords } from "@/lib/numberToWords";
import { CopyableSheba } from "@/components/admin/CopyableSheba";
import { PettyCashPaidToggle } from "@/components/admin/PettyCashPaidToggle";

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
    pettyCashPaid?: boolean;
    pettyCashPaidAt?: Date | string | null;
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

export interface SchoolExpenseSummary {
  schoolId: string;
  schoolName: string;
  schoolCode: string | null;
  city: string;
  district: string;
  pettyCashAmount: number | null;
  pettyCashPaid: boolean;
  pettyCashPaidAt?: Date | string | null;
  evaluators: Array<{
    id: string;
    fullName: string;
    shebaNumber?: string | null;
  }>;
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  rejectedExpenses: number;
  remainingApproved: number | null;
  percentSpent: number | null;
  items: ExpenseRow[];
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

  // حالت نمایش: "schools" (تجمیع بر اساس مدرسه) یا "invoices" (ریز فاکتورها)
  const [viewMode, setViewMode] = useState<"schools" | "invoices">("schools");

  // اکاردئون مدارس بازشده
  const [expandedSchoolIds, setExpandedSchoolIds] = useState<Set<string>>(new Set());

  // ویرایش سریع سقف تنخواه مدرسه
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editingPettyCashValue, setEditingPettyCashValue] = useState("");
  const [savingPettyCash, setSavingPettyCash] = useState(false);

  // وضعیت عملیات روی فاکتورها
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [batchApprovingSchoolId, setBatchApprovingSchoolId] = useState<string | null>(null);

  // باز یا بسته کردن اکاردئون مدرسه
  const toggleSchoolExpand = (schoolId: string) => {
    setExpandedSchoolIds((prev) => {
      const next = new Set(prev);
      if (next.has(schoolId)) {
        next.delete(schoolId);
      } else {
        next.add(schoolId);
      }
      return next;
    });
  };

  // فیلتر کردن هوشمند فاکتورها
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

  // سرجمع محاسبات کلی
  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = filtered.filter((e) => e.status === "APPROVED").reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = filtered.filter((e) => e.status === "PENDING").reduce((sum, e) => sum + e.amount, 0);
  const rejectedAmount = filtered.filter((e) => e.status === "REJECTED").reduce((sum, e) => sum + e.amount, 0);

  // تجمیع اطلاعات بر اساس مدارس (School-Consolidated Aggregation)
  const schoolsSummary = useMemo(() => {
    const map = new Map<string, SchoolExpenseSummary>();

    for (const item of filtered) {
      let record = map.get(item.schoolId);
      if (!record) {
        record = {
          schoolId: item.schoolId,
          schoolName: item.school.name,
          schoolCode: item.school.code,
          city: item.school.city,
          district: item.school.district,
          pettyCashAmount: item.school.pettyCashAmount ?? null,
          pettyCashPaid: item.school.pettyCashPaid ?? false,
          pettyCashPaidAt: item.school.pettyCashPaidAt,
          evaluators: [],
          totalExpenses: 0,
          approvedExpenses: 0,
          pendingExpenses: 0,
          rejectedExpenses: 0,
          remainingApproved: null,
          percentSpent: null,
          items: [],
        };
        map.set(item.schoolId, record);
      }

      // اضافه کردن ارزیاب در صورت نبود
      if (!record.evaluators.some((ev) => ev.id === item.evaluator.id)) {
        record.evaluators.push({
          id: item.evaluator.id,
          fullName: item.evaluator.fullName,
          shebaNumber: item.evaluator.shebaNumber,
        });
      }

      record.items.push(item);
      record.totalExpenses += item.amount;
      if (item.status === "APPROVED") {
        record.approvedExpenses += item.amount;
      } else if (item.status === "PENDING") {
        record.pendingExpenses += item.amount;
      } else if (item.status === "REJECTED") {
        record.rejectedExpenses += item.amount;
      }
    }

    // محاسبه مانده و درصد مصرف
    const list = Array.from(map.values()).map((s) => {
      const allocated = s.pettyCashAmount;
      if (allocated !== null && allocated !== undefined && allocated > 0) {
        s.remainingApproved = allocated - s.approvedExpenses;
        s.percentSpent = Math.min(100, Math.round((s.approvedExpenses / allocated) * 100));
      } else {
        s.remainingApproved = null;
        s.percentSpent = null;
      }
      return s;
    });

    // مرتب‌سازی بر اساس نام مدرسه
    return list.sort((a, b) => a.schoolName.localeCompare(b.schoolName, "fa"));
  }, [filtered]);

  // تایید تک فاکتور
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

  // تایید دسته‌ای کلیه فاکتورهای در انتظار یک مدرسه
  const handleApproveAllSchoolExpenses = async (schoolId: string) => {
    if (!confirm("آیا از تایید یکجای تمام فاکتورهای در انتظار این مدرسه اطمینان دارید؟")) return;
    setBatchApprovingSchoolId(schoolId);
    const res = await approveAllSchoolExpensesAction(schoolId);
    setBatchApprovingSchoolId(null);
    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) =>
        prev.map((item) =>
          item.schoolId === schoolId && item.status === "PENDING"
            ? { ...item, status: "APPROVED", adminNotes: null }
            : item
        )
      );
    }
  };

  // رد فاکتور
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

  // حذف فاکتور
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

  // ذخیره سقف تنخواه مصوب مدرسه
  const handleSavePettyCash = async (schoolId: string) => {
    setSavingPettyCash(true);
    const num = editingPettyCashValue.trim() ? parseInt(extractCleanNumber(editingPettyCashValue), 10) : null;
    const res = await updateSchoolPettyCashAllocationAction({
      schoolId,
      pettyCashAmount: num,
    });
    setSavingPettyCash(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setExpenses((prev) =>
        prev.map((item) =>
          item.schoolId === schoolId
            ? {
                ...item,
                school: {
                  ...item.school,
                  pettyCashAmount: num,
                },
              }
            : item
        )
      );
      setEditingSchoolId(null);
      setEditingPettyCashValue("");
    }
  };

  // خروجی CSV تجمیعی مدارس
  const handleExportSchoolsCSV = () => {
    const headers = [
      "ردیف",
      "نام مدرسه",
      "کد مدرسه",
      "شهرستان و منطقه",
      "ارزیاب(ها)",
      "شماره شبا ارزیاب",
      "تنخواه مصوب اولیه (تومان)",
      "وضعیت پرداخت تنخواه",
      "مجموع هزینه‌های تاییدشده (تومان)",
      "مجموع هزینه‌های در انتظار (تومان)",
      "کل مخارج ثبت‌شده (تومان)",
      "مانده تنخواه بعد از تایید (تومان)",
      "درصد مصرف تنخواه",
      "تعداد کل فاکتورها",
    ];

    const rows = schoolsSummary.map((s, idx) => [
      idx + 1,
      `"${s.schoolName}"`,
      s.schoolCode || "",
      `"${s.city} - ${s.district}"`,
      `"${s.evaluators.map((e) => e.fullName).join("، ")}"`,
      `"${s.evaluators.map((e) => e.shebaNumber || "ندارد").join("، ")}"`,
      s.pettyCashAmount || 0,
      s.pettyCashPaid ? "واریز شده" : "در انتظار واریز",
      s.approvedExpenses,
      s.pendingExpenses,
      s.totalExpenses,
      s.remainingApproved !== null ? s.remainingApproved : "نامشخص",
      s.percentSpent !== null ? `${s.percentSpent}%` : "—",
      s.items.length,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `schools_petty_cash_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // خروجی CSV ریز فاکتورها
  const handleExportInvoicesCSV = () => {
    const headers = [
      "ردیف",
      "مدرسه",
      "کد مدرسه",
      "عنوان خرج",
      "دسته‌بندی",
      "مبلغ (تومان)",
      "ارزیاب",
      "شماره شبا",
      "تاریخ هزینه",
      "وضعیت",
      "توضیحات",
    ];
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
    link.setAttribute("download", `invoices_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری کل بالای صفحه */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* کل مخارج فیلترشده */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">کل مخارج ثبت‌شده</span>
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
            {filtered.length} فاکتور در {schoolsSummary.length} مدرسه
          </span>
        </div>

        {/* مخارج تاییدشده */}
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
            {filtered.filter((e) => e.status === "APPROVED").length} فاکتور تایید نهایی
          </span>
        </div>

        {/* در انتظار بررسی */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">در انتظار تایید</span>
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
            {filtered.filter((e) => e.status === "PENDING").length} فاکتور منتظر بررسی
          </span>
        </div>

        {/* مخارج ردشده */}
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

      {/* فیلترها و کادر جستجو */}
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
              <option value="چاپ و اقلام">📄 چاپ و تکثیر</option>
              <option value="متفرقه">📦 متفرقه</option>
            </select>
          </div>
        </div>

        {/* فیلتر وضعیت و دکمه خروجی اکسل */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 ml-1">وضعیت فاکتورها:</span>
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
            onClick={viewMode === "schools" ? handleExportSchoolsCSV : handleExportInvoicesCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer self-end sm:self-auto"
            title="دانلود فایل اکسل / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی اکسل ({viewMode === "schools" ? "تجمیعی مدارس" : "ریز فاکتورها"})</span>
          </button>
        </div>
      </div>

      {/* نویک بین دو نما: ۱. گزارش تجمیعی حول مدارس ۲. ریز کلیه فاکتورها */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode("schools")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === "schools"
                ? "bg-white text-indigo-900 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>گزارش تجمیعی حول مدارس ({schoolsSummary.length} مدرسه)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("invoices")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === "invoices"
                ? "bg-white text-amber-900 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-4 h-4 text-amber-600" />
            <span>ریز کلیه فاکتورها ({filtered.length} مورد)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {viewMode === "schools"
            ? "محاسبه خودکار تنخواه مصوب، جمع هزینه‌های تاییدشده و مانده تنخواه هر مدرسه بدون نیاز به ماشین‌حساب"
            : "جدول فلت جهت مشاهده و بررسی جزییات تک‌تک فاکتورها"}
        </div>
      </div>

      {/* ============================================================== */}
      {/* نمای ۱: گزارش تجمیعی حول مدارس (School-Consolidated Overview) */}
      {/* ============================================================== */}
      {viewMode === "schools" && (
        <div className="space-y-4">
          {schoolsSummary.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/90 shadow-2xs space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">هیچ هزینه‌ای برای مدارس یافت نشد</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                مطابق فیلترهای اعمال‌شده، هیچ مدرسه‌ای دارای گزارش هزینه نیست. فیلترها را تغییر دهید.
              </p>
            </div>
          ) : (
            schoolsSummary.map((school) => {
              const isExpanded = expandedSchoolIds.has(school.schoolId);
              const isEditing = editingSchoolId === school.schoolId;
              const hasPending = school.pendingExpenses > 0;
              const pendingItemsCount = school.items.filter((i) => i.status === "PENDING").length;
              const isBatchApproving = batchApprovingSchoolId === school.schoolId;

              return (
                <div
                  key={school.schoolId}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition hover:border-slate-300"
                >
                  {/* ردیف اصلی تجمیعی مدرسه */}
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* مشخصات مدرسه + ارزیاب + وضعیت پرداخت تنخواه */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/schools/${school.schoolId}`}
                            className="text-base font-black text-slate-900 hover:text-indigo-600 transition flex items-center gap-1 group"
                          >
                            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            <span>{school.schoolName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                          </Link>
                          {school.schoolCode && (
                            <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              کد: {school.schoolCode}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {school.city} - {school.district}
                        </span>
                      </div>

                      {/* ارزیاب و شبا */}
                      <div className="flex flex-wrap items-center gap-3">
                        {school.evaluators.map((ev) => (
                          <div
                            key={ev.id}
                            className="bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs"
                          >
                            <div className="flex items-center gap-1 font-semibold text-slate-800">
                              <User className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{ev.fullName}</span>
                            </div>
                            <CopyableSheba
                              shebaNumber={ev.shebaNumber}
                              evaluatorId={ev.id}
                              evaluatorName={ev.fullName}
                              variant="compact"
                              allowEdit={false}
                            />
                          </div>
                        ))}

                        <PettyCashPaidToggle
                          schoolId={school.schoolId}
                          initialIsPaid={school.pettyCashPaid}
                          initialPaidAt={school.pettyCashPaidAt}
                          pettyCashAmount={school.pettyCashAmount}
                        />
                      </div>
                    </div>

                    {/* ستون‌های تجمیعی و ماشین‌حساب خودکار حول مدرسه */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
                      {/* ۱. تنخواه مصوب اولیه */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">تنخواه مصوب اولیه:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSchoolId(school.schoolId);
                              setEditingPettyCashValue(
                                school.pettyCashAmount ? school.pettyCashAmount.toString() : ""
                              );
                            }}
                            className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="تغییر مبلغ تنخواه مصوب مدرسه"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>تغییر</span>
                          </button>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="text"
                              value={editingPettyCashValue}
                              onChange={(e) => setEditingPettyCashValue(e.target.value)}
                              placeholder="مبلغ به تومان..."
                              className="w-28 text-xs p-1.5 bg-white border border-indigo-400 rounded-lg outline-none font-mono"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={savingPettyCash}
                              onClick={() => handleSavePettyCash(school.schoolId)}
                              className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                              title="ذخیره"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSchoolId(null)}
                              className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                              title="انصراف"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1" dir="rtl">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {school.pettyCashAmount ? formatNumberFa(school.pettyCashAmount) : "نامشخص"}
                            </span>
                            {school.pettyCashAmount ? (
                              <span className="text-[10px] font-semibold text-slate-400">تومان</span>
                            ) : null}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          {school.pettyCashPaid ? "به حساب ارزیاب واریز شده" : "هنوز واریز نشده"}
                        </span>
                      </div>

                      {/* ۲. مجموع هزینه‌های تاییدشده حول مدرسه (همان خواسته صوتی کارفرما) */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>مجموع هزینه تاییدشده:</span>
                        </span>
                        <div className="flex items-baseline gap-1" dir="rtl">
                          <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
                            {formatNumberFa(school.approvedExpenses)}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">تومان</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 block">
                          {school.items.filter((i) => i.status === "APPROVED").length} فاکتور تایید نهایی
                        </span>
                      </div>

                      {/* ۳. در انتظار بررسی */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>در انتظار تایید مدیر:</span>
                        </span>
                        <div className="flex items-baseline gap-1" dir="rtl">
                          <span className="text-base sm:text-lg font-black text-amber-600 tracking-tight">
                            {formatNumberFa(school.pendingExpenses)}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-600">تومان</span>
                        </div>
                        <span className="text-[10px] text-amber-600 block">
                          {pendingItemsCount} فاکتور منتظر اقدام
                        </span>
                      </div>

                      {/* ۴. مانده تنخواه بعد از تایید شدن (بدون ماشین‌حساب!) */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-slate-500" />
                          <span>مانده تنخواه بعد از تایید:</span>
                        </span>
                        {school.remainingApproved !== null ? (
                          <>
                            <div className="flex items-baseline gap-1" dir="rtl">
                              <span
                                className={`text-base sm:text-lg font-black tracking-tight ${
                                  school.remainingApproved >= 0 ? "text-indigo-900" : "text-rose-700"
                                }`}
                              >
                                {formatNumberFa(Math.abs(school.remainingApproved))}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">تومان</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold block ${
                                school.remainingApproved >= 0 ? "text-emerald-700" : "text-rose-600"
                              }`}
                            >
                              {school.remainingApproved >= 0
                                ? `مانده نزد ارزیاب (${school.percentSpent}% خرج شده)`
                                : `کسری تنخواه (طلب ارزیاب جهت تسویه)`}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-slate-500 pt-1">سقف اولیه نامشخص</div>
                            <span className="text-[10px] text-slate-400 block">
                              کل خرج: {formatNumberFa(school.totalExpenses)} ت
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* دکمه‌های آکاردئون و تایید دسته‌ای */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSchoolExpand(school.schoolId)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                          <span>
                            {isExpanded ? "بستن ریز فاکتورها" : `مشاهده ریز فاکتورهای این مدرسه (${school.items.length} مورد)`}
                          </span>
                        </button>

                        {/* دکمه تایید یکجای فاکتورهای در انتظار این مدرسه */}
                        {hasPending && (
                          <button
                            type="button"
                            disabled={isBatchApproving}
                            onClick={() => handleApproveAllSchoolExpenses(school.schoolId)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                            title="تایید تمام فاکتورهای منتظر بررسی این مدرسه به صورت یکجا"
                          >
                            {isBatchApproving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5" />
                            )}
                            <span>تایید یکجای فاکتورهای در انتظار ({pendingItemsCount} مورد)</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        کل فاکتورها: {school.items.length} ردیف | جمع کل مخارج:{" "}
                        <strong className="text-slate-700 font-mono">{formatNumberFa(school.totalExpenses)}</strong> تومان
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* زیربخش آکاردئون: ریز فاکتورهای این مدرسه */}
                  {/* ============================================================== */}
                  {isExpanded && (
                    <div className="border-t border-slate-200/80 bg-slate-50/60 p-4 sm:p-6 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-amber-600" />
                          <span>ریز فاکتورها و هزینه‌های ثبت‌شده برای {school.schoolName}:</span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold">
                            <tr>
                              <th className="py-2.5 px-4 pr-5">عنوان و دسته‌بندی</th>
                              <th className="py-2.5 px-4">شرح فاکتور</th>
                              <th className="py-2.5 px-4">ثبت‌کننده</th>
                              <th className="py-2.5 px-4 text-left">مبلغ (تومان)</th>
                              <th className="py-2.5 px-4 text-center">تاریخ</th>
                              <th className="py-2.5 px-4 text-center">وضعیت</th>
                              <th className="py-2.5 px-4 pl-5 text-left">عملیات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {school.items.map((item) => {
                              const dateStr = new Date(item.expenseDate).toLocaleDateString("fa-IR");
                              const isLoading = loadingId === item.id;
                              const isRejecting = rejectingId === item.id;

                              return (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                  {/* عنوان و دسته‌بندی */}
                                  <td className="py-3 px-4 pr-5 font-bold text-slate-900 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
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
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-normal">
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* شرح */}
                                  <td className="py-3 px-4 max-w-xs text-slate-500">
                                    <p className="line-clamp-2 leading-relaxed">{item.description || "—"}</p>
                                    {item.adminNotes && (
                                      <span className="inline-block text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-1 border border-rose-200">
                                        علت رد: {item.adminNotes}
                                      </span>
                                    )}
                                  </td>

                                  {/* ثبت‌کننده */}
                                  <td className="py-3 px-4 whitespace-nowrap text-slate-800">
                                    {item.evaluator.fullName}
                                  </td>

                                  {/* مبلغ */}
                                  <td className="py-3 px-4 text-left whitespace-nowrap">
                                    <div className="inline-flex items-baseline gap-1" dir="rtl">
                                      <span className="font-black text-sm text-slate-900">
                                        {formatNumberFa(item.amount)}
                                      </span>
                                      <span className="text-[10px] text-slate-400">تومان</span>
                                    </div>
                                  </td>

                                  {/* تاریخ */}
                                  <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                    {dateStr}
                                  </td>

                                  {/* وضعیت */}
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    {item.status === "APPROVED" ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        تایید شده
                                      </span>
                                    ) : item.status === "REJECTED" ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                        <XCircle className="w-3 h-3 text-rose-600" />
                                        رد شده
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                        <Clock className="w-3 h-3 text-amber-500" />
                                        در انتظار
                                      </span>
                                    )}
                                  </td>

                                  {/* عملیات */}
                                  <td className="py-3 px-4 pl-5 text-left whitespace-nowrap">
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                    ) : (
                                      <div className="flex items-center justify-end gap-1.5">
                                        {item.status !== "APPROVED" && (
                                          <button
                                            type="button"
                                            onClick={() => handleApprove(item.id)}
                                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer flex items-center gap-0.5"
                                            title="تایید فاکتور"
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
                                            title="رد فاکتور با ثبت دلیل"
                                          >
                                            <X className="w-3 h-3" />
                                            <span>رد</span>
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => handleDelete(item.id)}
                                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                                          title="حذف فاکتور"
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
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* نمای ۲: ریز کلیه فاکتورها (جدول خطی) */}
      {/* ============================================================== */}
      {viewMode === "invoices" && (
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
                          <div className="mt-1.5">
                            <PettyCashPaidToggle
                              schoolId={item.school.id}
                              initialIsPaid={item.school.pettyCashPaid ?? false}
                              initialPaidAt={item.school.pettyCashPaidAt}
                              pettyCashAmount={item.school.pettyCashAmount}
                            />
                          </div>
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
      )}
    </div>
  );
}
