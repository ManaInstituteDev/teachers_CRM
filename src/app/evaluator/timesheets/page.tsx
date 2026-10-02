import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  PlusCircle,
  Calendar,
  UserCheck,
  Users,
  School,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Wallet,
  Coins,
} from "lucide-react";
import TimesheetFormClient from "./TimesheetFormClient";
import EvaluatorRecordsClient, { TimesheetLogItem, ExpenseRecordItem } from "./EvaluatorRecordsClient";
import { EvaluatorShebaManager } from "@/components/evaluator/EvaluatorShebaManager";
import { formatNumberFa } from "@/lib/numberToWords";

export const dynamic = "force-dynamic";

export default async function EvaluatorTimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ schoolId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { schoolId } = await searchParams;

  // دریافت اطلاعات همزمان: کمک‌ارزیابان، مدارس، لاگ‌های کارکرد، فاکتورهای تنخواه و شماره شبا
  const [assistants, schools, logs, expenses, userDb] = await Promise.all([
    prisma.assistantEvaluator.findMany({
      where: { evaluatorId: user.id, isActive: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.school.findMany({
      where: { assignedEvaluatorId: user.id },
      select: {
        id: true,
        name: true,
        district: true,
        code: true,
        pettyCashAmount: true,
        pettyCashPaid: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.timesheetLog.findMany({
      where: { evaluatorId: user.id },
      orderBy: { date: "desc" },
      include: {
        assistantEvaluator: true,
        school: true,
      },
    }),
    prisma.schoolExpense.findMany({
      where: { evaluatorId: user.id },
      orderBy: { expenseDate: "desc" },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            district: true,
            pettyCashAmount: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { shebaNumber: true },
    }),
  ]);

  // محاسبات مجموع ساعات کاری
  const totalMinutesSelf = logs
    .filter((l) => l.workerType === "EVALUATOR")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalMinutesAssistants = logs
    .filter((l) => l.workerType === "ASSISTANT_EVALUATOR")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalHoursSelf = (totalMinutesSelf / 60).toFixed(1);
  const totalHoursAssistants = (totalMinutesAssistants / 60).toFixed(1);
  const totalHoursAll = ((totalMinutesSelf + totalMinutesAssistants) / 60).toFixed(1);

  // محاسبات هزینه‌ها و تنخواه
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpensesAmount = expenses
    .filter((e) => e.status === "APPROVED")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpensesAmount = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/evaluator"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به داشبورد ارزیاب</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Clock className="w-5 h-5" />
            </div>
            <span>ثبت فعالیت‌ها و گزارش تنخواه</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ثبت زمان‌های صرف‌شده برای فعالیت‌های میدانی و ثبت گزارش هزینه‌ها و فاکتورهای تنخواه ناظر به مدارس
          </p>
        </div>
      </div>

      {/* کارت‌های خلاصه آماری ساعت کارکرد و تنخواه */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* کل ساعات کاری */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">مجموع ساعات کل</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {totalHoursAll}
            </span>
            <span className="text-xs font-bold text-slate-500">ساعت</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            {totalHoursSelf} س خودم + {totalHoursAssistants} س همکاران
          </span>
        </div>

        {/* کل هزینه‌های ثبت‌شده */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">کل مخارج ثبت‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatNumberFa(totalExpensesAmount)}
            </span>
            <span className="text-xs font-bold text-slate-500">تومان</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {expenses.length} فاکتور ناظر به مدارس
          </span>
        </div>

        {/* مخارج تاییدشده توسط مدیر */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">مخارج تاییدشده</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              {formatNumberFa(approvedExpensesAmount)}
            </span>
            <span className="text-xs font-bold text-emerald-600">تومان</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {expenses.filter((e) => e.status === "APPROVED").length} مورد تایید نهایی
          </span>
        </div>

        {/* مخارج در انتظار تایید مدیر */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">در انتظار تایید</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
              {formatNumberFa(pendingExpensesAmount)}
            </span>
            <span className="text-xs font-bold text-amber-600">تومان</span>
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            {expenses.filter((e) => e.status === "PENDING").length} فاکتور در دست بررسی
          </span>
        </div>
      </div>

      {/* بخش مدیریت و ویرایش اطلاعات شبا ارزیاب و همکاران */}
      <EvaluatorShebaManager
        evaluatorId={user.id}
        evaluatorName={user.fullName}
        evaluatorSheba={userDb?.shebaNumber}
        assistants={assistants}
        mode="manager"
        collapsible={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* فرم ثبت فعالیت و هزینه جدید */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="font-bold text-base text-slate-900">ثبت فعالیت و هزینه تنخواه</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">ثبت یکپارچه زمان و مخارج ناظر به مدرسه</p>
            </div>
          </div>

          <TimesheetFormClient
            assistants={assistants}
            schools={schools}
            initialSchoolId={schoolId || ""}
          />
        </div>

        {/* لیست سوابق ثبت‌شده (ساعت کارکرد و هزینه‌ها) */}
        <div className="lg:col-span-2">
          <EvaluatorRecordsClient
            logs={logs as unknown as TimesheetLogItem[]}
            expenses={expenses as unknown as ExpenseRecordItem[]}
          />
        </div>
      </div>
    </div>
  );
}
