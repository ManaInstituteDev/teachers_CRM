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
} from "lucide-react";
import { deleteTimesheetAction } from "@/app/actions/timesheet";
import SearchableEvaluatorSelect from "@/components/SearchableEvaluatorSelect";

export const dynamic = "force-dynamic";

export default async function AdminTimesheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ evaluatorId?: string; workerType?: string }>;
}) {
  const { evaluatorId, workerType } = await searchParams;

  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    select: { id: true, fullName: true, username: true },
    orderBy: { fullName: "asc" },
  });

  const whereClause: any = {};
  if (evaluatorId && evaluatorId !== "ALL") {
    whereClause.evaluatorId = evaluatorId;
  }
  if (workerType && workerType !== "ALL") {
    whereClause.workerType = workerType;
  }

  // دریافت تمام لاگ‌ها
  const logs = await prisma.timesheetLog.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    include: {
      evaluator: true,
      assistantEvaluator: true,
      school: true,
    },
  });

  // آمار کلی
  const totalMins = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMins / 60).toFixed(1);

  const evalMins = logs
    .filter((l) => l.workerType === "EVALUATOR")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const evalHours = (evalMins / 60).toFixed(1);

  const astMins = logs
    .filter((l) => l.workerType === "ASSISTANT_EVALUATOR")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const astHours = (astMins / 60).toFixed(1);

  // تجمیع کارکرد به تفکیک هر ارزیاب
  const allEvaluatorsWithStats = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    include: {
      timesheets: true,
      assistants: true,
      _count: {
        select: { teacherEvaluations: true },
      },
    },
  });

  const evaluatorBreakdowns = allEvaluatorsWithStats.map((ev) => {
    const selfMinutes = ev.timesheets
      .filter((t) => t.workerType === "EVALUATOR")
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const assistantMinutes = ev.timesheets
      .filter((t) => t.workerType === "ASSISTANT_EVALUATOR")
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const teamMinutes = selfMinutes + assistantMinutes;

    return {
      id: ev.id,
      name: ev.fullName,
      assistantsCount: ev.assistants.length,
      evaluationsCount: ev._count.teacherEvaluations,
      selfHours: (selfMinutes / 60).toFixed(1),
      assistantHours: (assistantMinutes / 60).toFixed(1),
      totalTeamHours: (teamMinutes / 60).toFixed(1),
    };
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            پایش و گزارش جامع ساعات کاری
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مشاهده ساعات کارکرد ارزیاب‌ها و کمک‌ارزیاب‌ها، بهره‌وری تیم‌ها و زمان‌های صرف‌شده
          </p>
        </div>

        <Link
          href="/admin/evaluators/assistants"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
        >
          <Users className="w-4 h-4 text-sky-600" />
          <span>تخصیص و مدیریت کمک‌ارزیاب‌ها</span>
        </Link>
      </div>

      {/* کارت‌های خلاصه آماری ساعات */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">مجموع ساعات کل ارزیابی</p>
            <h3 className="text-3xl font-black text-slate-900">
              {totalHours} <span className="text-sm font-normal text-slate-400">ساعت</span>
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              مجموع کارکرد ارزیاب‌ها و دستیاران
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ساعات کاری ارزیاب‌های اصلی</p>
            <h3 className="text-3xl font-black text-slate-900">
              {evalHours} <span className="text-sm font-normal text-slate-400">ساعت</span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              مصاحبه، گفت‌وگو و سنجش شایستگی‌ها
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ساعات کاری کمک‌ارزیاب‌ها</p>
            <h3 className="text-3xl font-black text-slate-900">
              {astHours} <span className="text-sm font-normal text-slate-400">ساعت</span>
            </h3>
            <p className="text-[11px] text-sky-600 font-medium mt-1">
              بررسی میدانی و جمع‌آوری مدارک مدارس
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* جدول تفکیکی بهره‌وری هر ارزیاب و تیمش */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              تفکیک ساعات کاری بر اساس ارزیاب و اعضای تیم کمکی
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              مقایسه زمان‌های ثبت‌شده توسط هر ارزیاب به همراه تعداد ارزیابی‌های ثبت‌شده
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
              <tr>
                <th className="py-4 px-6">ارزیاب</th>
                <th className="py-4 px-6 text-center">تعداد کمک‌ارزیاب متصل</th>
                <th className="py-4 px-6 text-center">ساعت ارزیاب</th>
                <th className="py-4 px-6 text-center">ساعت کمک‌ارزیاب‌ها</th>
                <th className="py-4 px-6 text-center">مجموع ساعت تیم</th>
                <th className="py-4 px-6 text-center">فرم‌های تکمیل‌شده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluatorBreakdowns.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">{b.name}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg text-xs">
                      {b.assistantsCount} نفر
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-emerald-700">
                    {b.selfHours} ساعت
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-sky-700">
                    {b.assistantHours} ساعت
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-black text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-xl">
                      {b.totalTeamHours} ساعت
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-slate-800">
                    {b.evaluationsCount} فرم
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* فیلترها و جدول سوابق لاگ‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-slate-900">سوابق تفصیلی کارکردها</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              لیست کامل لاگ‌های ثبت‌شده همراه با جزئیات و شرح فعالیت
            </p>
          </div>

          <form method="GET" action="/admin/timesheets" className="flex items-center gap-2 flex-wrap">
            <div className="w-56">
              <SearchableEvaluatorSelect
                evaluators={evaluators}
                defaultValue={evaluatorId || "ALL"}
                name="evaluatorId"
                placeholder="جستجوی ارزیاب..."
              />
            </div>

            <select
              name="workerType"
              defaultValue={workerType || "ALL"}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">همه نیروها</option>
              <option value="EVALUATOR">صرفاً ارزیاب‌ها</option>
              <option value="ASSISTANT_EVALUATOR">صرفاً کمک‌ارزیاب‌ها</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
            >
              اعمال
            </button>
          </form>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            هیچ ساعت کاری با این مشخصات ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="py-3.5 px-6">تاریخ</th>
                  <th className="py-3.5 px-6">نوع نیرو</th>
                  <th className="py-3.5 px-6">ارزیاب مسئول</th>
                  <th className="py-3.5 px-6">کمک‌ارزیاب</th>
                  <th className="py-3.5 px-6 text-center">مدت زمان</th>
                  <th className="py-3.5 px-6">مدرسه / فعالیت</th>
                  <th className="py-3.5 px-6 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const hours = Math.floor(log.durationMinutes / 60);
                  const mins = log.durationMinutes % 60;
                  const dateStr = new Date(log.date).toLocaleDateString("fa-IR");

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {log.workerType === "EVALUATOR" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            ارزیاب اصلی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            کمک‌ارزیاب
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                        {log.evaluator.fullName}
                      </td>

                      <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                        {log.assistantEvaluator ? log.assistantEvaluator.fullName : "—"}
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-xl">
                          {hours > 0 && `${hours} ساعت `}
                          {mins > 0 && `${mins} دقیقه`}
                          {hours === 0 && mins === 0 && "۰ دقیقه"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 max-w-sm">
                        <div>{log.description || "—"}</div>
                        {log.school && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 mt-1">
                            <SchoolIcon className="w-3 h-3" />
                            {log.school.name}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-left whitespace-nowrap">
                        <form action={deleteTimesheetAction.bind(null, log.id)}>
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="حذف رکورد"
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
