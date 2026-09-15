import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardPenLine,
  PlusCircle,
  GraduationCap,
  School,
  Award,
  ArrowUpRight,
  History,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EvaluatorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // دریافت آمار مربوط به همین ارزیاب
  const [evaluationsCount, schoolsCount, myEvaluations, timesheetLogs, assistants] = await Promise.all([
    prisma.teacherEvaluation.count({
      where: { evaluatorId: user.id },
    }),
    prisma.school.count({
      where: { createdById: user.id },
    }),
    prisma.teacherEvaluation.findMany({
      where: { evaluatorId: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { include: { school: true } },
      },
    }),
    prisma.timesheetLog.findMany({
      where: { evaluatorId: user.id },
      select: { durationMinutes: true },
    }),
    prisma.assistantEvaluator.findMany({
      where: { evaluatorId: user.id, isActive: true },
    }),
  ]);

  const totalHours = (
    timesheetLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60
  ).toFixed(1);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* پیام خوش‌آمدگویی */}
      <div className="bg-gradient-to-l from-indigo-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ارزیاب فعال شبکه</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            سلام، {user.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            به پنل ارزیابی شایستگی‌های شبکه‌ای معلمان و شناسنامه مدارس خوش آمدید. از این بخش می‌توانید فرم‌های سنجش ۵ محوره را ثبت یا مدارس همکار را شناسنامه‌دار کنید.
          </p>
        </div>
      </div>

      {/* عملیات‌های سریع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/evaluator/schools"
          className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                مدارس و کادر آموزشی
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                انتخاب مدرسه و ثبت کادر
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>

        <Link
          href="/evaluator/evaluate"
          className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
              <ClipboardPenLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                ارزیابی فرد جدید
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                معلم، مشاور، معاون
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>

        <Link
          href="/evaluator/timesheets"
          className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition">
                ثبت ساعت کاری
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                برای خود و کمک‌ارزیاب
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>

        <Link
          href="/evaluator/schools/new"
          className="group p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition">
                شناسنامه مدرسه
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ظرفیت علوم انسانی
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>
      </div>

      {/* آمار خلاصه من */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ارزیابی‌های ثبت‌شده</p>
            <h3 className="text-2xl font-bold text-slate-900">{evaluationsCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">فرم نهایی معلمان</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">مدارس ثبت‌شده</p>
            <h3 className="text-2xl font-bold text-slate-900">{schoolsCount}</h3>
            <p className="text-[11px] text-sky-600 font-medium mt-1">پروفایل و شناسنامه</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ساعت کارکرد ثبت‌شده</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalHours} <span className="text-xs font-normal text-slate-400">ساعت</span></h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1">خود و کمک‌ارزیاب</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">کمک‌ارزیاب‌های همکار</p>
            <h3 className="text-2xl font-bold text-slate-900">{assistants.length} <span className="text-xs font-normal text-slate-400">نفر</span></h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">تیم متصل مدیریت</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* آخرین ارزیابی‌های من */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">آخرین ارزیابی‌های ثبت‌شده من</h2>
          <Link
            href="/evaluator/my-evaluations"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>مشاهده همه سوابق</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myEvaluations.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            هنوز ارزیابی توسط شما ثبت نشده است. روی «ثبت ارزیابی معلم جدید» کلیک کنید.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myEvaluations.map((ev) => (
              <div key={ev.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    {ev.teacher.firstName} {ev.teacher.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    رشته: {ev.teacher.subject} | مدرسه: {ev.teacher.school?.name || ev.teacher.schoolNameManual || "—"}
                  </p>
                </div>

                <div className="text-left">
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                    نمره موزون: {ev.totalWeightedScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
