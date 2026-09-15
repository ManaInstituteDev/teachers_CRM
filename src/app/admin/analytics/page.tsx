import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  GraduationCap,
  School,
  Clock,
  Sparkles,
  ArrowRight,
  PieChart,
  Target,
  CheckCircle2,
  HelpCircle,
  Brain,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  // ۱. واکشی ارزیابی‌ها و داده‌های معلمان
  const [evaluations, teachers, evaluators, timesheetLogs] = await Promise.all([
    prisma.teacherEvaluation.findMany({
      include: {
        teacher: { include: { school: true } },
        evaluator: true,
      },
    }),
    prisma.teacher.findMany(),
    prisma.user.findMany({
      where: { role: "EVALUATOR" },
      include: {
        assistants: true,
        timesheets: true,
        teacherEvaluations: true,
      },
    }),
    prisma.timesheetLog.findMany(),
  ]);

  const totalEvaluations = evaluations.length;

  // ۲. آمار وضعیت‌های ۴‌گانه همکاری
  const keyAxisCount = teachers.filter((t) => t.collaborationStatus === "KEY_AXIS").length;
  const devCount = teachers.filter((t) => t.collaborationStatus === "DEVELOPMENTAL_RELATION").length;
  const occCount = teachers.filter((t) => t.collaborationStatus === "OCCASIONAL_RELATION").length;
  const unCount = teachers.filter((t) => t.collaborationStatus === "UNSUITABLE").length;
  const pendingCount = teachers.filter((t) => t.collaborationStatus === "PENDING_EVALUATION").length;

  const totalTeachers = teachers.length || 1;
  const pctKeyAxis = Math.round((keyAxisCount / totalTeachers) * 100);
  const pctDev = Math.round((devCount / totalTeachers) * 100);
  const pctOcc = Math.round((occCount / totalTeachers) * 100);
  const pctUn = Math.round((unCount / totalTeachers) * 100);

  // ۳. میانگین نمرات ۵ محور (خام و درصدی)
  const avgRaw1 =
    totalEvaluations > 0
      ? evaluations.reduce((acc, curr) => acc + curr.rawAxis1, 0) / totalEvaluations
      : 0;
  const avgRaw2 =
    totalEvaluations > 0
      ? evaluations.reduce((acc, curr) => acc + curr.rawAxis2, 0) / totalEvaluations
      : 0;
  const avgRaw3 =
    totalEvaluations > 0
      ? evaluations.reduce((acc, curr) => acc + curr.rawAxis3, 0) / totalEvaluations
      : 0;
  const avgRaw4 =
    totalEvaluations > 0
      ? evaluations.reduce((acc, curr) => acc + curr.rawAxis4, 0) / totalEvaluations
      : 0;
  const avgRaw5 =
    totalEvaluations > 0
      ? evaluations.reduce((acc, curr) => acc + curr.rawAxis5, 0) / totalEvaluations
      : 0;

  const pctAxis1 = Math.round((avgRaw1 / 50) * 100);
  const pctAxis2 = Math.round((avgRaw2 / 80) * 100);
  const pctAxis3 = Math.round((avgRaw3 / 100) * 100);
  const pctAxis4 = Math.round((avgRaw4 / 100) * 100);
  const pctAxis5 = Math.round((avgRaw5 / 75) * 100);

  const avgTotalScore =
    totalEvaluations > 0
      ? (
          evaluations.reduce((acc, curr) => acc + curr.totalWeightedScore, 0) /
          totalEvaluations
        ).toFixed(1)
      : "۰";

  // ۴. تحلیل جامع عملکرد هر ارزیاب
  const evaluatorInsights = evaluators.map((ev) => {
    const evEvals = ev.teacherEvaluations;
    const count = evEvals.length;

    const avgGivenScore =
      count > 0
        ? (
            evEvals.reduce((acc, curr) => acc + curr.totalWeightedScore, 0) / count
          ).toFixed(1)
        : "۰";

    const avgDialogueMin =
      count > 0
        ? Math.round(
            evEvals.reduce((acc, curr) => acc + curr.dialogueDurationMin, 0) / count
          )
        : 0;

    const keyAxisAssigned = evEvals.filter((e) => e.finalRecommendation === "KEY_AXIS").length;
    const devAssigned = evEvals.filter((e) => e.finalRecommendation === "DEVELOPMENTAL_RELATION").length;
    const occAssigned = evEvals.filter((e) => e.finalRecommendation === "OCCASIONAL_RELATION").length;
    const unAssigned = evEvals.filter((e) => e.finalRecommendation === "UNSUITABLE").length;

    const totalMinutesLogged = ev.timesheets.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalHoursLogged = (totalMinutesLogged / 60).toFixed(1);

    // شاخص سبک نمره‌دهی ارزیاب
    let scoringStyle = "متعادل و استاندارد";
    let styleColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    const numAvg = parseFloat(avgGivenScore);
    if (count >= 2) {
      if (numAvg >= 75) {
        scoringStyle = "سهل‌گیر (نمرات بالا)";
        styleColor = "text-purple-700 bg-purple-50 border-purple-200";
      } else if (numAvg < 45) {
        scoringStyle = "سخت‌گیر (نمرات پایین)";
        styleColor = "text-rose-700 bg-rose-50 border-rose-200";
      }
    }

    return {
      id: ev.id,
      name: ev.fullName,
      count,
      avgGivenScore,
      avgDialogueMin,
      totalHoursLogged,
      assistantsCount: ev.assistants.length,
      scoringStyle,
      styleColor,
      keyAxisAssigned,
      devAssigned,
      occAssigned,
      unAssigned,
    };
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            تحلیل جامع داده‌ها و ارزیابی عملکرد ارزیاب‌ها
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            پایش آماری محورهای شایستگی معلمان، توزیع رتبه‌ها و سنجش نحوه نمره‌دهی و کارکرد ارزیاب‌ها
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/teachers"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>بانک معلمان و کارنامه‌ها</span>
          </Link>
        </div>
      </div>

      {/* ردیف کارت‌های آماری کلان */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">تعداد کل معلمان ثبت‌شده</p>
            <h3 className="text-3xl font-black text-slate-900">{teachers.length}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {totalEvaluations} فرم ارزیابی کامل
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">میانگین امتیاز کل شبکه</p>
            <h3 className="text-3xl font-black text-slate-900">
              {avgTotalScore} <span className="text-xs font-normal text-slate-400">از ۱۰۰</span>
            </h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1">
              میانگین موزون ۵ محوره
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">معلمان سطح «محور» (نخبه)</p>
            <h3 className="text-3xl font-black text-purple-700">{keyAxisCount}</h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1">
              {pctKeyAxis}٪ از کل شبکه (بالای ۸۰ نمره)
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ارزیاب‌های فعال در سیستم</p>
            <h3 className="text-3xl font-black text-slate-900">{evaluators.length}</h3>
            <p className="text-[11px] text-sky-600 font-medium mt-1">
              دارای تیم‌های کمک‌ارزیاب
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* بخش اول: ارزیابی و دسته‌بندی عملکرد ارزیاب‌ها (خیلی مهم) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-6">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>پایش کیفیت و عملکرد ارزیابان</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              دسته‌بندی و مقایسه نحوه عملکرد ارزیاب‌ها
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              آمار خروجی هر ارزیاب برای فهمیدن اینکه هر کدام چگونه کارها را پیش می‌برند و سبک نمره‌دهی آنها چگونه است
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
              <tr>
                <th className="py-4 px-6">نام ارزیاب</th>
                <th className="py-4 px-6 text-center">فرم‌های ثبت‌شده</th>
                <th className="py-4 px-6 text-center">میانگین نمره اعطایی</th>
                <th className="py-4 px-6 text-center">سبک ارزیابی</th>
                <th className="py-4 px-6 text-center">میانگین مدت گفت‌وگو</th>
                <th className="py-4 px-6 text-center">ساعات کارکرد کل</th>
                <th className="py-4 px-6 text-center">توزیع رتبه‌ها (محور / مستعد / موردی / نامناسب)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluatorInsights.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    <div>{ev.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {ev.assistantsCount} کمک‌ارزیاب متصل
                    </div>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl text-xs">
                      {ev.count} معلم
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="font-black text-indigo-700 text-sm">
                      {ev.avgGivenScore}
                      <span className="text-[10px] text-slate-400 mr-1 font-normal">/ ۱۰۰</span>
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${ev.styleColor}`}>
                      {ev.scoringStyle}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className="text-slate-700 font-medium">
                      {ev.avgDialogueMin} دقیقه
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                      {ev.totalHoursLogged} ساعت
                    </span>
                  </td>

                  {/* نوار تجسمی توزیع رتبه‌های اعطایی ارزیاب */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800" title="محور">
                        {ev.keyAxisAssigned}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800" title="مستعد ارتباط رشدی">
                        {ev.devAssigned}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800" title="ارتباط موردی">
                        {ev.occAssigned}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800" title="نامناسب همکاری">
                        {ev.unAssigned}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* بخش دوم: نمودارهای آماری دوگانه */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* نمودار ۱: توزیع ۴ سطح همکاری معلمان */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                توزیع ۴ سطح همکاری معلمان در شبکه
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                بر اساس نمره موزون نهایی فرم‌های ۵ محوره
              </p>
            </div>
            <PieChart className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            {/* ۱. محور */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  محور (بالای ۸۰٪)
                </span>
                <span className="text-slate-800">{keyAxisCount} نفر ({pctKeyAxis}٪)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${pctKeyAxis}%` }}
                ></div>
              </div>
            </div>

            {/* ۲. مستعد ارتباط رشدی */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  مستعد ارتباط رشدی (۵۰ تا ۸۰٪)
                </span>
                <span className="text-slate-800">{devCount} نفر ({pctDev}٪)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctDev}%` }}
                ></div>
              </div>
            </div>

            {/* ۳. ارتباط موردی */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  ارتباط موردی (۳۰ تا ۵۰٪)
                </span>
                <span className="text-slate-800">{occCount} نفر ({pctOcc}٪)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctOcc}%` }}
                ></div>
              </div>
            </div>

            {/* ۴. نامناسب همکاری */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  نامناسب همکاری (زیر ۳۰٪)
                </span>
                <span className="text-slate-800">{unCount} نفر ({pctUn}٪)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctUn}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 leading-relaxed">
            معلمان قرار گرفته در طبقه <strong>«محور»</strong> دارای بالاترین ظرفیت شبکه‌سازی، اثرگذاری تربیتی و نگرش تخصصی به علوم انسانی هستند و در اولویت مدیریت کارگروه‌های استانی و لیدری مدارس قرار می‌گیرند.
          </div>
        </div>

        {/* نمودار ۲: میانگین امتیازات در محورهای ۵‌گانه */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-base text-slate-900">
                میانگین شایستگی معلمان در محورهای ۵‌گانه
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مقایسه درصد تحقق امتیازات در هر یک از ابعاد سنجش
              </p>
            </div>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            {/* محور ۱ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">۱. رابطه تربیتی و اثرگذاری</span>
                <span className="text-indigo-600">
                  {avgRaw1.toFixed(1)} از ۵۰ ({pctAxis1}٪)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${pctAxis1}%` }}
                ></div>
              </div>
            </div>

            {/* محور ۲ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">۲. توان شناسایی استعداد</span>
                <span className="text-emerald-600">
                  {avgRaw2.toFixed(1)} از ۸۰ ({pctAxis2}٪)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${pctAxis2}%` }}
                ></div>
              </div>
            </div>

            {/* محور ۳ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">۳. نگرش و ظرفیت علوم انسانی</span>
                <span className="text-amber-600">
                  {avgRaw3.toFixed(1)} از ۱۰۰ ({pctAxis3}٪)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctAxis3}%` }}
                ></div>
              </div>
            </div>

            {/* محور ۴ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">۴. سرمایه ارتباطی و شبکه‌سازی</span>
                <span className="text-sky-600">
                  {avgRaw4.toFixed(1)} از ۱۰۰ ({pctAxis4}٪)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctAxis4}%` }}
                ></div>
              </div>
            </div>

            {/* محور ۵ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">۵. تعهد و قابلیت همکاری اجرایی</span>
                <span className="text-rose-600">
                  {avgRaw5.toFixed(1)} از ۷۵ ({pctAxis5}٪)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctAxis5}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            محورهایی با درصد تحقق پایین‌تر نشان‌دهنده اولویت‌های برگزاری دوره‌های توانمندسازی و کارگاه‌های مشترک ارتقای نگرش برای معلمان است.
          </div>
        </div>
      </div>
    </div>
  );
}
