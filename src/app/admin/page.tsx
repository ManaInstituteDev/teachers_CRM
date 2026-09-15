import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  School,
  Award,
  ArrowUpRight,
  Sparkles,
  Calendar,
  ChevronLeft,
  Clock,
  BarChart3,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // دریافت آمار از دیتابیس
  const [
    evaluationsCount,
    teachersCount,
    schoolsCount,
    evaluatorsCount,
    assistantsCount,
    evaluations,
    keyAxisCount,
    developmentalCount,
    occasionalCount,
    unsuitableCount,
    timesheets,
  ] = await Promise.all([
    prisma.teacherEvaluation.count(),
    prisma.teacher.count(),
    prisma.school.count(),
    prisma.user.count({ where: { role: "EVALUATOR" } }),
    prisma.assistantEvaluator.count(),
    prisma.teacherEvaluation.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          include: { school: true },
        },
        evaluator: true,
      },
    }),
    prisma.teacher.count({ where: { collaborationStatus: "KEY_AXIS" } }),
    prisma.teacher.count({ where: { collaborationStatus: "DEVELOPMENTAL_RELATION" } }),
    prisma.teacher.count({ where: { collaborationStatus: "OCCASIONAL_RELATION" } }),
    prisma.teacher.count({ where: { collaborationStatus: "UNSUITABLE" } }),
    prisma.timesheetLog.findMany({ select: { durationMinutes: true } }),
  ]);

  // محاسبه میانگین نمره موزون
  const avgScore =
    evaluations.length > 0
      ? (
          evaluations.reduce((acc, curr) => acc + curr.totalWeightedScore, 0) /
          evaluations.length
        ).toFixed(1)
      : "۰";

  const totalHours = (timesheets.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60).toFixed(1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "KEY_AXIS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            محور
          </span>
        );
      case "DEVELOPMENTAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            مستعد رشدی
          </span>
        );
      case "OCCASIONAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            موردی
          </span>
        );
      case "UNSUITABLE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            نامناسب
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8">
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            داشبورد مدیریت کل سامانه
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مشاهده شاخص‌های کلان، پایش شبکه ارزیابان، کارنامه معلمان و ساعت کاری ثبت‌شده
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>تحلیل داده‌ها و ارزیاب‌ها</span>
          </Link>

          <Link
            href="/admin/timesheets"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>ساعات کاری</span>
          </Link>

          <Link
            href="/admin/evaluators/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <Users className="w-4 h-4" />
            <span>تعریف ارزیاب جدید</span>
          </Link>
        </div>
      </div>

      {/* کارت‌های آماری ۵‌گانه */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ارزیابی‌های تکمیل‌شده</p>
            <h3 className="text-2xl font-bold text-slate-900">{evaluationsCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">فرم ۵ محوره ثبت‌شده</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">میانگین امتیاز معلمان</p>
            <h3 className="text-2xl font-bold text-slate-900">{avgScore} <span className="text-xs font-normal text-slate-400">از ۱۰۰</span></h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">میانگین موزون سند</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">تیم ارزیابی (نفرات)</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {evaluatorsCount + assistantsCount}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {evaluatorsCount} ارزیاب + {assistantsCount} کمک‌ارزیاب
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ساعات کارکرد کل</p>
            <h3 className="text-2xl font-bold text-purple-700">{totalHours} <span className="text-xs font-normal text-slate-400">ساعت</span></h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1">ثبت‌شده توسط تیم‌ها</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">مدارس شناسنامه‌دار</p>
            <h3 className="text-2xl font-bold text-slate-900">{schoolsCount}</h3>
            <p className="text-[11px] text-sky-600 font-medium mt-1">پایش ظرفیت علوم انسانی</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* بخش وضعیت شبکه و آخرین ارزیابی‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نمودار وضعیت ۴‌گانه همکاری */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">توزیع ۴ وضعیت همکاری معلمان</h2>
            <Link
              href="/admin/analytics"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
            >
              <span>تحلیل کامل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-1">
            {/* ۱. محور */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-purple-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  محور (بالای ۸۰٪)
                </span>
                <span className="text-slate-700 font-bold">{keyAxisCount} نفر</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${teachersCount > 0 ? (keyAxisCount / teachersCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* ۲. مستعد ارتباط رشدی */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  مستعد ارتباط رشدی (۵۰ تا ۸۰٪)
                </span>
                <span className="text-slate-700 font-bold">{developmentalCount} نفر</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${teachersCount > 0 ? (developmentalCount / teachersCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* ۳. ارتباط موردی */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  ارتباط موردی (۳۰ تا ۵۰٪)
                </span>
                <span className="text-slate-700 font-bold">{occasionalCount} نفر</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${teachersCount > 0 ? (occasionalCount / teachersCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* ۴. نامناسب همکاری */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-rose-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  نامناسب همکاری (زیر ۳۰٪)
                </span>
                <span className="text-slate-700 font-bold">{unsuitableCount} نفر</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${teachersCount > 0 ? (unsuitableCount / teachersCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            معلمان با برچسب <strong className="text-purple-700">محور</strong> و <strong className="text-emerald-700">مستعد ارتباط رشدی</strong> در اولویت اول هدایت تحصیلی و شبکه‌سازی منطقه‌ای قرار می‌گیرند.
          </div>
        </div>

        {/* لیست آخرین ارزیابی‌ها */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">آخرین ارزیابی‌های ثبت‌شده توسط ارزیاب‌ها</h2>
            <Link
              href="/admin/teachers"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>مشاهده و فیلتر معلمان</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {evaluations.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              هنوز ارزیابی ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden">
              {evaluations.map((ev) => (
                <div key={ev.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {ev.teacher.firstName} {ev.teacher.lastName}
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {ev.teacher.subject}
                      </span>
                      {getStatusBadge(ev.finalRecommendation)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>مدرسه: {ev.teacher.school?.name || ev.teacher.schoolNameManual || "نامشخص"}</span>
                      <span>•</span>
                      <span>ارزیاب: {ev.evaluator.fullName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-left">
                      <div className="text-sm font-bold text-indigo-600">
                        {ev.totalWeightedScore.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-400">نمره موزون</div>
                    </div>

                    <Link
                      href={`/admin/teachers/${ev.teacherId}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                      title="مشاهده کارنامه ارزیابی"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
