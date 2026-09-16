import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Clock,
  Users,
  UserCheck,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  School as SchoolIcon,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Sparkles,
  HelpCircle,
  CreditCard,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { deleteTimesheetAction } from "@/app/actions/timesheet";
import SearchableEvaluatorSelect from "@/components/SearchableEvaluatorSelect";
import { ExportDataButton } from "@/components/admin/ExportDataButton";
import { QuickShebaEdit } from "@/components/admin/QuickShebaEdit";
import { TimesheetApprovalModal } from "@/components/admin/TimesheetApprovalModal";
import { BatchApproveButton } from "@/components/admin/BatchApproveButton";

export const dynamic = "force-dynamic";

interface SearchParamsProps {
  evaluatorId?: string;
  workerType?: string;
  status?: string; // ALL, PENDING, APPROVED, REVISED, REJECTED
  normFilter?: string; // ALL, RUSHED, NORMAL, EXCESSIVE
  sortBy?: string; // recordedHours, approvedHours, evaluationsCount, schoolsCount, normHours, normRatio, name
  sortOrder?: string; // asc, desc
}

export default async function AdminTimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const params = await searchParams;
  const evaluatorId = params.evaluatorId || "ALL";
  const workerType = params.workerType || "ALL";
  const statusFilter = params.status || "ALL";
  const normFilter = params.normFilter || "ALL";
  const sortBy = params.sortBy || "recordedHours";
  const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

  // ۱. واکشی ارزیاب‌ها برای دراپ‌داون
  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    select: { id: true, fullName: true, username: true },
    orderBy: { fullName: "asc" },
  });

  // ۲. فیلترهای جدول سوابق تفصیلی لاگ‌ها
  const whereClause: any = {};
  if (evaluatorId && evaluatorId !== "ALL") {
    whereClause.evaluatorId = evaluatorId;
  }
  if (workerType && workerType !== "ALL") {
    whereClause.workerType = workerType;
  }
  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  // واکشی لاگ‌های تفصیلی
  const logs = await prisma.timesheetLog.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    include: {
      evaluator: true,
      assistantEvaluator: true,
      school: true,
    },
  });

  // ۳. واکشی داده‌های ارزیاب‌ها برای جدول جامع خلاصه فعالیت، نرم و تسویه
  const allEvaluatorsWithStats = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    include: {
      timesheets: {
        include: { school: true },
      },
      assistants: true,
      assignedSchools: true,
      teacherEvaluations: {
        include: {
          teacher: { select: { schoolId: true } },
        },
      },
    },
  });

  // ۴. پردازش نرم استاندارد ساعت کار و تجمیع شاخص‌های هر ارزیاب
  let evaluatorBreakdowns = allEvaluatorsWithStats.map((ev) => {
    // تعداد مدارس ارزیابی‌شده یا تخصیص‌یافته به ارزیاب
    const uniqueSchoolIds = new Set<string>();
    ev.assignedSchools.forEach((s) => uniqueSchoolIds.add(s.id));
    ev.teacherEvaluations.forEach((te) => {
      if (te.teacher?.schoolId) uniqueSchoolIds.add(te.teacher.schoolId);
    });
    ev.timesheets.forEach((t) => {
      if (t.schoolId) uniqueSchoolIds.add(t.schoolId);
    });
    const schoolsCount = uniqueSchoolIds.size;

    // تعداد معلمان ارزیابی‌شده (افراد ارزیابی‌شده)
    const evaluatedTeachersCount = ev.teacherEvaluations.length;

    // محاسبه نرم استاندارد ساعت کارکرد:
    // ۲.۵ ساعت به ازای هر مدرسه + ۱.۵ ساعت به ازای هر معلم ارزیابی‌شده
    const normHours = Number(
      (schoolsCount * 2.5 + evaluatedTeachersCount * 1.5).toFixed(1)
    );

    // ساعت‌های ثبت‌شده
    const selfMinutes = ev.timesheets
      .filter((t) => t.workerType === "EVALUATOR")
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const assistantMinutes = ev.timesheets
      .filter((t) => t.workerType === "ASSISTANT_EVALUATOR")
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const totalRecordedMinutes = selfMinutes + assistantMinutes;
    const totalRecordedHours = Number((totalRecordedMinutes / 60).toFixed(1));

    // ساعت‌های تایید شده توسط مدیر
    const approvedMinutes = ev.timesheets
      .filter((t) => t.status === "APPROVED" || t.status === "REVISED")
      .reduce(
        (acc, curr) =>
          acc +
          (curr.approvedMinutes !== null && curr.approvedMinutes !== undefined
            ? curr.approvedMinutes
            : curr.durationMinutes),
        0
      );
    const totalApprovedHours = Number((approvedMinutes / 60).toFixed(1));

    // تعداد و دقایق لاگ‌های در انتظار بررسی
    const pendingLogs = ev.timesheets.filter((t) => t.status === "PENDING");
    const pendingCount = pendingLogs.length;
    const pendingMinutes = pendingLogs.reduce(
      (acc, curr) => acc + curr.durationMinutes,
      0
    );

    // محاسبه شاخص بهره‌وری و انطباق با نرم
    let normRatio = 0;
    let normStatus: "RUSHED" | "NORMAL" | "EXCESSIVE" | "NO_EVAL" = "NORMAL";

    if (normHours === 0) {
      normStatus = "NO_EVAL";
    } else {
      normRatio = Math.round((totalRecordedHours / normHours) * 100);
      if (normRatio < 70) {
        normStatus = "RUSHED"; // شتاب‌زده / وقت ناکافی
      } else if (normRatio > 130) {
        normStatus = "EXCESSIVE"; // بیش از حد / اتلاف وقت احتمالی
      } else {
        normStatus = "NORMAL"; // متعادل و استاندارد
      }
    }

    return {
      id: ev.id,
      name: ev.fullName,
      username: ev.username,
      phone: ev.phone,
      shebaNumber: ev.shebaNumber,
      assistantsCount: ev.assistants.length,
      schoolsCount,
      evaluatedTeachersCount,
      normHours,
      selfHours: Number((selfMinutes / 60).toFixed(1)),
      assistantHours: Number((assistantMinutes / 60).toFixed(1)),
      totalRecordedHours,
      totalApprovedHours,
      pendingCount,
      pendingHours: Number((pendingMinutes / 60).toFixed(1)),
      normRatio,
      normStatus,
    };
  });

  // اعمال فیلتر وضعیت نرم در صورت انتخاب
  if (normFilter !== "ALL") {
    evaluatorBreakdowns = evaluatorBreakdowns.filter(
      (b) => b.normStatus === normFilter
    );
  }

  // مرتب‌سازی جدول خلاصه ارزیاب‌ها
  evaluatorBreakdowns.sort((a, b) => {
    let valA: any = 0;
    let valB: any = 0;

    switch (sortBy) {
      case "approvedHours":
        valA = a.totalApprovedHours;
        valB = b.totalApprovedHours;
        break;
      case "evaluationsCount":
        valA = a.evaluatedTeachersCount;
        valB = b.evaluatedTeachersCount;
        break;
      case "schoolsCount":
        valA = a.schoolsCount;
        valB = b.schoolsCount;
        break;
      case "normHours":
        valA = a.normHours;
        valB = b.normHours;
        break;
      case "normRatio":
        valA = a.normRatio;
        valB = b.normRatio;
        break;
      case "name":
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name, "fa")
          : b.name.localeCompare(a.name, "fa");
      case "recordedHours":
      default:
        valA = a.totalRecordedHours;
        valB = b.totalRecordedHours;
        break;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // ۵. شاخص‌های کلان بالای صفحه
  const overallRecordedMins = logs.reduce(
    (acc, curr) => acc + curr.durationMinutes,
    0
  );
  const overallRecordedHours = (overallRecordedMins / 60).toFixed(1);

  const overallApprovedMins = logs.reduce(
    (acc, curr) =>
      acc +
      (curr.status === "APPROVED" || curr.status === "REVISED"
        ? curr.approvedMinutes !== null && curr.approvedMinutes !== undefined
          ? curr.approvedMinutes
          : curr.durationMinutes
        : 0),
    0
  );
  const overallApprovedHours = (overallApprovedMins / 60).toFixed(1);

  const totalPendingLogs = logs.filter((l) => l.status === "PENDING").length;

  const rushedEvaluatorsCount = evaluatorBreakdowns.filter(
    (b) => b.normStatus === "RUSHED"
  ).length;
  const excessiveEvaluatorsCount = evaluatorBreakdowns.filter(
    (b) => b.normStatus === "EXCESSIVE"
  ).length;
  const normalEvaluatorsCount = evaluatorBreakdowns.filter(
    (b) => b.normStatus === "NORMAL"
  ).length;

  // ۶. آماده‌سازی خروجی‌های اکسل
  // الف: خروجی اکسل آمار جامع فعالیت ارزیاب‌ها (ساعت، شبا، نرم و تاییدیه)
  const evaluatorsSummaryExportHeaders = [
    "نام و نام خانوادگی ارزیاب",
    "نام کاربری",
    "شماره تماس",
    "شماره شبا",
    "تعداد مدارس ارزیابی‌شده / تخصیص‌یافته",
    "تعداد افراد (معلمان) ارزیابی‌شده",
    "نرم ساعت استاندارد کارکرد (ساعت)",
    "ساعت فعالیت ثبت‌شده (ساعت)",
    "ساعت فعالیت تایید شده مدیر (ساعت)",
    "ساعت خود ارزیاب (ساعت)",
    "ساعت کمک‌ارزیابان (ساعت)",
    "وضعیت انطباق با نرم کارکرد",
    "درصد نسبت به نرم استاندارد",
    "تعداد ساعت‌های در انتظار تایید",
  ];

  const evaluatorsSummaryExportRows = evaluatorBreakdowns.map((b) => [
    b.name,
    b.username,
    b.phone || "-",
    b.shebaNumber || "ثبت‌نشده",
    b.schoolsCount,
    b.evaluatedTeachersCount,
    b.normHours,
    b.totalRecordedHours,
    b.totalApprovedHours,
    b.selfHours,
    b.assistantHours,
    b.normStatus === "RUSHED"
      ? "شتاب‌زده (وقت ناکافی)"
      : b.normStatus === "EXCESSIVE"
      ? "فراتر از نرم (اتلاف وقت احتمالی)"
      : b.normStatus === "NORMAL"
      ? "متعادل و استاندارد"
      : "بدون فعالیت",
    `${b.normRatio}٪`,
    b.pendingCount,
  ]);

  // ب: خروجی اکسل سوابق تفصیلی کارکردها
  const timesheetExportRows = logs.map((log) => [
    new Date(log.date).toLocaleDateString("fa-IR"),
    log.evaluator.fullName,
    log.workerType === "ASSISTANT_EVALUATOR" && log.assistantEvaluator
      ? log.assistantEvaluator.fullName
      : log.evaluator.fullName,
    log.workerType === "ASSISTANT_EVALUATOR" ? "کمک‌ارزیاب" : "ارزیاب اصلی",
    log.school ? log.school.name : "عمومی / بدون مدرسه",
    (log.durationMinutes / 60).toFixed(1),
    log.approvedMinutes !== null && log.approvedMinutes !== undefined
      ? (log.approvedMinutes / 60).toFixed(1)
      : "در انتظار",
    log.status === "APPROVED"
      ? "تایید شده"
      : log.status === "REVISED"
      ? "تعدیل شده توسط مدیر"
      : log.status === "REJECTED"
      ? "رد شده"
      : "در انتظار بررسی",
    log.adminNotes || "-",
    log.description || "-",
  ]);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* هدر بخش و دکمه‌های اقدام */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <Gauge className="w-3.5 h-3.5" />
            <span>پایش نرم ساعت کار، بهره‌وری و تاییدیه کارکرد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            پایش و گزارش جامع ساعات کاری ارزیابان
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مقایسه ساعت کارکرد نسبت به نرم مدارس، تشخیص شتاب‌زدگی یا اتلاف وقت، تایید ساعت فعالیت و خروجی اکسل تسویه
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* دکمه دانلود خروجی اکسل خلاصه تسویه و شبا */}
          <ExportDataButton
            filename="evaluators_activity_payroll_report"
            title="خروجی اکسل تسویه ارزیاب‌ها"
            headers={evaluatorsSummaryExportHeaders}
            rows={evaluatorsSummaryExportRows}
            printTitle="گزارش تسویه و کارکرد ارزیابان - سامانه ارزیابی معلمان"
          />

          <Link
            href="/admin/evaluators/assistants"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>مدیریت کمک‌ارزیاب‌ها</span>
          </Link>
        </div>
      </div>

      {/* جعبه راهنمای نرم استاندارد ساعت کار */}
      <div className="bg-gradient-to-l from-indigo-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نرم استاندارد کارشناسی ساعت کارکرد</span>
            </div>
            <h3 className="text-lg font-bold">
              فرمول محاسبه نرم زمانی ارزیابی: (هر مدرسه × ۲.۵ ساعت) + (هر معلم × ۱.۵ ساعت)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              این نرم بر مبنای استاندارد مصاحبه عمیق معلمان و ارزیابی شناسنامه مدارس تعریف شده است. انحراف از این نرم به شما نشان می‌دهد کدام ارزیاب کار را <span className="text-rose-400 font-bold">شتاب‌زده</span> تحویل داده (کمتر از ۷۰٪ زمان لازم) و کدام ارزیاب زمان غیرعادی صرف کرده و دچار <span className="text-purple-300 font-bold">اتلاف وقت</span> شده است (بیش از ۱۳۰٪).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="text-xl font-black text-rose-400">{rushedEvaluatorsCount}</div>
              <div className="text-[11px] text-slate-300">شتاب‌زده</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="text-xl font-black text-emerald-400">{normalEvaluatorsCount}</div>
              <div className="text-[11px] text-slate-300">متعادل و استاندارد</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[100px]">
              <div className="text-xl font-black text-purple-300">{excessiveEvaluatorsCount}</div>
              <div className="text-[11px] text-slate-300">اتلاف وقت احتمالی</div>
            </div>
          </div>
        </div>
      </div>

      {/* کارت‌های ۴‌گانه خلاصه وضعیت ساعت‌ها */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* کل ساعات ثبت‌شده */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              مجموع ساعت کارکرد ثبت‌شده
            </p>
            <h3 className="text-3xl font-black text-slate-900">
              {overallRecordedHours}{" "}
              <span className="text-sm font-normal text-slate-400">ساعت</span>
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              اعلامی توسط ارزیاب‌ها و کمکیاران
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* کل ساعات تایید شده مدیر */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              ساعت فعالیت تایید شده مدیر
            </p>
            <h3 className="text-3xl font-black text-emerald-600">
              {overallApprovedHours}{" "}
              <span className="text-sm font-normal text-slate-400">ساعت</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              ساعت مصوب نهایی جهت پرداخت
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* لاگ‌های در انتظار تایید */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              لاگ‌های در انتظار بررسی مدیر
            </p>
            <h3 className="text-3xl font-black text-amber-600">
              {totalPendingLogs}{" "}
              <span className="text-sm font-normal text-slate-400">مورد</span>
            </h3>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              نیازمند تایید یا تعدیل مدیر
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* نسبت تعدیل ساعت‌ها */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              میزان تعدیل ساعت‌ها
            </p>
            <h3 className="text-3xl font-black text-purple-700">
              {(Number(overallApprovedHours) - Number(overallRecordedHours)).toFixed(1)}{" "}
              <span className="text-sm font-normal text-slate-400">ساعت</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              تفاوت ساعت تایید شده با اعلامی
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ۱. جدول اصلی درخواستی کاربر: آمار کل فعالیت ارزیاب‌ها، مدارس، شبا و انطباق با نرم */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-base sm:text-lg text-slate-900">
                آمار کل فعالیت، تسویه و بهره‌وری ارزیاب‌ها
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              مشاهده افراد و مدارس ارزیابی‌شده، شماره شبا، ساعات ثبت‌شده و تایید شده، و انطباق زمانی با نرم استاندارد
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* فیلتر وضعیت نرم */}
            <form method="GET" action="/admin/timesheets" className="flex items-center gap-2">
              <select
                name="normFilter"
                defaultValue={normFilter}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">همه وضعیت‌های انطباق</option>
                <option value="NORMAL">🟢 متعادل و استاندارد</option>
                <option value="RUSHED">🔴 شتاب‌زده (وقت ناکافی)</option>
                <option value="EXCESSIVE">🟣 فراتر از نرم (اتلاف وقت)</option>
              </select>

              <select
                name="sortBy"
                defaultValue={sortBy}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="recordedHours">بیشترین ساعت ثبت‌شده</option>
                <option value="approvedHours">بیشترین ساعت تایید شده</option>
                <option value="evaluationsCount">بیشترین افراد ارزیابی‌شده</option>
                <option value="schoolsCount">بیشترین مدارس</option>
                <option value="normRatio">درصد انطباق با نرم</option>
                <option value="name">نام ارزیاب (الفبایی)</option>
              </select>

              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
              >
                اعمال
              </button>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200/80 font-bold select-none">
              <tr>
                <th className="py-4 px-4 text-center w-12">#</th>
                <th className="py-4 px-5">نام و نام خانوادگی ارزیاب</th>
                <th className="py-4 px-5">شماره شبا جهت واریز</th>
                <th className="py-4 px-4 text-center">مدارس ارزیابی‌شده</th>
                <th className="py-4 px-4 text-center">افراد ارزیابی‌شده</th>
                <th className="py-4 px-4 text-center">نرم استاندارد کارکرد</th>
                <th className="py-4 px-4 text-center">ساعت فعالیت ثبت‌شده</th>
                <th className="py-4 px-4 text-center">ساعت فعالیت تایید شده</th>
                <th className="py-4 px-5 text-center">وضعیت انطباق با نرم</th>
                <th className="py-4 px-5 text-left">عملیات تاییدیه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluatorBreakdowns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                    ارزیابی با شرایط انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                evaluatorBreakdowns.map((ev, index) => {
                  const diff = Number((ev.totalApprovedHours - ev.totalRecordedHours).toFixed(1));

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition group">
                      {/* ردیف */}
                      <td className="py-4 px-4 text-center font-bold text-slate-400 text-xs">
                        {index + 1}
                      </td>

                      {/* نام و مشخصات ارزیاب */}
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <div className="text-sm font-black text-slate-900">{ev.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-normal">
                          <span>یوزر: {ev.username}</span>
                          {ev.phone && <span dir="ltr">{ev.phone}</span>}
                          {ev.assistantsCount > 0 && (
                            <span className="text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded font-medium">
                              {ev.assistantsCount} کمک‌ارزیاب
                            </span>
                          )}
                        </div>
                      </td>

                      {/* شماره شبا با قابلیت ویرایش آنی */}
                      <td className="py-4 px-5">
                        <QuickShebaEdit
                          userId={ev.id}
                          currentSheba={ev.shebaNumber}
                          userName={ev.name}
                        />
                      </td>

                      {/* تعداد مدارس ارزیابی‌شده */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl text-xs">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {ev.schoolsCount} مدرسه
                        </span>
                      </td>

                      {/* تعداد افراد (معلمان) ارزیابی‌شده */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-xl text-xs">
                          <Users className="w-3 h-3 text-indigo-500" />
                          {ev.evaluatedTeachersCount} نفر
                        </span>
                      </td>

                      {/* نرم ساعت استاندارد کارکرد */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-xl text-xs" title={`${ev.schoolsCount} مدرسه × ۲.۵ س + ${ev.evaluatedTeachersCount} معلم × ۱.۵ س`}>
                          {ev.normHours} ساعت
                        </span>
                      </td>

                      {/* ساعت فعالیت ثبت‌شده */}
                      <td className="py-4 px-4 text-center">
                        <div>
                          <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl text-sm">
                            {ev.totalRecordedHours} س
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            ارزیاب: {ev.selfHours} | کمکیاران: {ev.assistantHours}
                          </div>
                        </div>
                      </td>

                      {/* ساعت فعالیت تایید شده توسط مدیر */}
                      <td className="py-4 px-4 text-center">
                        <div>
                          <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-xl text-sm">
                            {ev.totalApprovedHours} ساعت
                          </span>
                          {diff !== 0 && (
                            <div
                              className={`text-[10px] font-bold mt-1 ${
                                diff < 0 ? "text-rose-600" : "text-emerald-600"
                              }`}
                            >
                              {diff < 0 ? `${diff} س تعدیل منفی` : `+${diff} س تعدیل مثبت`}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* وضعیت انطباق با نرم کارکرد */}
                      <td className="py-4 px-5 text-center">
                        {ev.normStatus === "RUSHED" && (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              شتاب‌زده (وقت ناکافی)
                            </span>
                            <span className="text-[10px] text-rose-600 font-semibold mt-0.5">
                              {ev.normRatio}٪ نرم استاندارد
                            </span>
                          </div>
                        )}

                        {ev.normStatus === "NORMAL" && (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              متعادل و استاندارد
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              {ev.normRatio}٪ نرم استاندارد
                            </span>
                          </div>
                        )}

                        {ev.normStatus === "EXCESSIVE" && (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Clock className="w-3 h-3" />
                              فراتر از نرم (اتلاف وقت)
                            </span>
                            <span className="text-[10px] text-purple-600 font-semibold mt-0.5">
                              {ev.normRatio}٪ نرم استاندارد
                            </span>
                          </div>
                        )}

                        {ev.normStatus === "NO_EVAL" && (
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            بدون فعالیت
                          </span>
                        )}
                      </td>

                      {/* عملیات تایید سریع */}
                      <td className="py-4 px-5 text-left whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <BatchApproveButton
                            evaluatorId={ev.id}
                            pendingCount={ev.pendingCount}
                          />

                          <Link
                            href={`/admin/timesheets?evaluatorId=${ev.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition text-xs font-semibold"
                            title="مشاهده لاگ‌های این ارزیاب"
                          >
                            مشاهده لاگ‌ها
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ۲. سوابق تفصیلی لاگ‌های کارکرد به همراه تایید و تعدیل تک‌تک رکوردها */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-900">
              سوابق تفصیلی کارکردها و تاییدیه لاگ‌ها
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              بررسی تک‌تک لاگ‌های ثبت‌شده توسط ارزیاب‌ها، تایید ساعت، ویرایش مدت زمان یا رد کارکرد
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* خروجی اکسل لاگ‌های تفصیلی */}
            <ExportDataButton
              filename="detailed_timesheet_logs"
              title="خروجی لاگ‌های تفصیلی"
              headers={[
                "تاریخ",
                "ارزیاب سرپرست",
                "نیروی مجری",
                "نوع نیرو",
                "مدرسه / فعالیت",
                "مدت ثبت‌شده (ساعت)",
                "مدت تایید شده (ساعت)",
                "وضعیت تاییدیه",
                "یادداشت مدیر",
                "شرح فعالیت",
              ]}
              rows={timesheetExportRows}
            />

            <form method="GET" action="/admin/timesheets" className="flex items-center gap-2 flex-wrap">
              <div className="w-52">
                <SearchableEvaluatorSelect
                  evaluators={evaluators}
                  defaultValue={evaluatorId || "ALL"}
                  name="evaluatorId"
                  placeholder="فیلتر ارزیاب..."
                />
              </div>

              <select
                name="workerType"
                defaultValue={workerType}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">همه نیروها</option>
                <option value="EVALUATOR">صرفاً ارزیاب‌ها</option>
                <option value="ASSISTANT_EVALUATOR">صرفاً کمک‌ارزیاب‌ها</option>
              </select>

              <select
                name="status"
                defaultValue={statusFilter}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار بررسی</option>
                <option value="APPROVED">تایید شده</option>
                <option value="REVISED">تعدیل شده توسط مدیر</option>
                <option value="REJECTED">رد شده</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
              >
                فیلتر لاگ‌ها
              </button>
            </form>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            هیچ ساعت کاری با این مشخصات ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200/80 font-bold">
                <tr>
                  <th className="py-3.5 px-5">تاریخ</th>
                  <th className="py-3.5 px-5">نوع نیرو</th>
                  <th className="py-3.5 px-5">ارزیاب مسئول</th>
                  <th className="py-3.5 px-5">کمک‌ارزیاب</th>
                  <th className="py-3.5 px-5 text-center">ساعت ثبت‌شده</th>
                  <th className="py-3.5 px-5 text-center">ساعت تایید شده مدیر</th>
                  <th className="py-3.5 px-5">مدرسه / شرح فعالیت</th>
                  <th className="py-3.5 px-5 text-center">وضعیت و تایید</th>
                  <th className="py-3.5 px-4 text-left">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const hours = Math.floor(log.durationMinutes / 60);
                  const mins = log.durationMinutes % 60;
                  const dateStr = new Date(log.date).toLocaleDateString("fa-IR");

                  const logItemForModal = {
                    id: log.id,
                    workerName:
                      log.workerType === "ASSISTANT_EVALUATOR" && log.assistantEvaluator
                        ? log.assistantEvaluator.fullName
                        : log.evaluator.fullName,
                    workerType: log.workerType === "ASSISTANT_EVALUATOR" ? "کمک‌ارزیاب" : "ارزیاب اصلی",
                    evaluatorName: log.evaluator.fullName,
                    dateStr,
                    durationMinutes: log.durationMinutes,
                    approvedMinutes: log.approvedMinutes,
                    status: log.status,
                    description: log.description,
                    schoolName: log.school?.name,
                    adminNotes: log.adminNotes,
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      {/* تاریخ */}
                      <td className="py-4 px-5 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* نوع نیرو */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {log.workerType === "EVALUATOR" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            ارزیاب اصلی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                            کمک‌ارزیاب
                          </span>
                        )}
                      </td>

                      {/* ارزیاب مسئول */}
                      <td className="py-4 px-5 font-bold text-slate-800 whitespace-nowrap">
                        {log.evaluator.fullName}
                      </td>

                      {/* کمک‌ارزیاب */}
                      <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                        {log.assistantEvaluator ? log.assistantEvaluator.fullName : "—"}
                      </td>

                      {/* ساعت ثبت‌شده ارزیاب */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span className="font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-xl text-xs">
                          {hours > 0 && `${hours} س `}
                          {mins > 0 && `${mins} د`}
                          {hours === 0 && mins === 0 && "۰ دقیقه"}
                        </span>
                      </td>

                      {/* ساعت تایید شده توسط مدیر */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {log.approvedMinutes !== null && log.approvedMinutes !== undefined ? (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl text-xs border border-emerald-200/70">
                            {Math.floor(log.approvedMinutes / 60)} س و {log.approvedMinutes % 60} د
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            در انتظار
                          </span>
                        )}
                      </td>

                      {/* مدرسه / شرح فعالیت */}
                      <td className="py-4 px-5 text-slate-600 max-w-xs">
                        {log.school && (
                          <div className="font-bold text-slate-900 flex items-center gap-1 mb-0.5">
                            <SchoolIcon className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{log.school.name}</span>
                          </div>
                        )}
                        <div className="text-xs line-clamp-2">{log.description || "—"}</div>
                        {log.adminNotes && (
                          <div className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-1">
                            یادداشت مدیر: {log.adminNotes}
                          </div>
                        )}
                      </td>

                      {/* وضعیت و دکمه مدال تاییدیه */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <TimesheetApprovalModal log={logItemForModal} />
                      </td>

                      {/* حذف */}
                      <td className="py-4 px-4 text-left whitespace-nowrap">
                        <form action={deleteTimesheetAction.bind(null, log.id)}>
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="حذف لاگ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
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
