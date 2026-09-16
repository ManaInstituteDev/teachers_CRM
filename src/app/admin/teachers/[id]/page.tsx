import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  GraduationCap,
  School,
  UserCheck,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      school: true,
      evaluations: {
        include: { evaluator: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!teacher) {
    notFound();
  }

  const latestEval = teacher.evaluations[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "KEY_AXIS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            محور (نخبه و پیشرو شبکه)
          </span>
        );
      case "DEVELOPMENTAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            مستعد ارتباط رشدی
          </span>
        );
      case "OCCASIONAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            ارتباط موردی
          </span>
        );
      case "UNSUITABLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            نامناسب همکاری
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            در انتظار ارزیابی
          </span>
        );
    }
  };

  const getFamiliarityLabel = (level: string) => {
    switch (level) {
      case "HIGH":
        return "زیاد";
      case "LOW":
        return "کم";
      default:
        return "متوسط";
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* دکمه بازگشت */}
      <Link
        href="/admin/teachers"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به بانک معلمان</span>
      </Link>

      {/* کارت سربرگ مشخصات معلم */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {teacher.roleTitle || "معلم"}
                </span>
                {getStatusBadge(teacher.collaborationStatus)}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                حوزه فعالیت / تدریس: {teacher.subject} • مقطع: {teacher.grade} • سابقه: {teacher.teachingYears} سال
              </p>
            </div>
          </div>

          {latestEval && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 shrink-0">
              <div className="text-right">
                <div className="text-xs text-indigo-700 font-semibold">نمره موزون کل</div>
                <div className="text-3xl font-black text-indigo-900">
                  {latestEval.totalWeightedScore.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ ۱۰۰</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* مشخصات جزئی */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs sm:text-sm">
          <div className="space-y-1">
            <span className="text-slate-400 block text-xs">مدرسه محل خدمت:</span>
            <strong className="text-slate-800 flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-500" />
              {teacher.school?.name || teacher.schoolNameManual || "نامشخص"}
            </strong>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-xs">کد ملی:</span>
            <strong className="text-slate-800 font-mono">
              {teacher.nationalCode || "ثبت نشده"}
            </strong>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block text-xs">شماره تماس:</span>
            <strong className="text-slate-800 font-mono">
              {teacher.phone || "ثبت نشده"}
            </strong>
          </div>
        </div>

        {teacher.bio && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-700 block mb-1">درباره و پیشینه معلم:</strong>
            {teacher.bio}
          </div>
        )}
      </div>

      {/* کارنامه ارزیابی */}
      {!latestEval ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
          هنوز فرم ارزیابی برای این معلم ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-6">
          {/* متادیتا ارزیابی */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-6 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>ارزیاب: <strong>{latestEval.evaluator.fullName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>تاریخ ارزیابی: <strong>{new Date(latestEval.evaluationDate).toLocaleDateString("fa-IR")}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>مدت گفت‌وگو: <strong>{latestEval.dialogueDurationMin} دقیقه</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                <span>سطح آشنایی ارزیاب: <strong>{getFamiliarityLabel(latestEval.familiarityLevel)}</strong></span>
              </div>
            </div>
          </div>

          {/* خلاصه اوزان ۵ محور بر اساس سند */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] text-slate-500 font-medium">۱. رابطه تربیتی (۱۵٪)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{latestEval.rawAxis1} <span className="text-xs font-normal text-slate-400">/ ۵۰</span></div>
              <div className="text-[10px] text-indigo-600 font-semibold mt-1">سهم: {((latestEval.rawAxis1 / 50) * 15).toFixed(1)}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] text-slate-500 font-medium">۲. شناسایی استعداد (۲۵٪)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{latestEval.rawAxis2} <span className="text-xs font-normal text-slate-400">/ ۸۰</span></div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">سهم: {((latestEval.rawAxis2 / 80) * 25).toFixed(1)}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] text-slate-500 font-medium">۳. علوم انسانی (۱۵٪)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{latestEval.rawAxis3} <span className="text-xs font-normal text-slate-400">/ ۱۰۰</span></div>
              <div className="text-[10px] text-amber-600 font-semibold mt-1">سهم: {((latestEval.rawAxis3 / 100) * 15).toFixed(1)}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-[11px] text-slate-500 font-medium">۴. شبکه‌سازی (۲۵٪)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{latestEval.rawAxis4} <span className="text-xs font-normal text-slate-400">/ ۱۰۰</span></div>
              <div className="text-[10px] text-sky-600 font-semibold mt-1">سهم: {((latestEval.rawAxis4 / 100) * 25).toFixed(1)}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium">۵. تعهد و اجرا (۲۰٪)</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{latestEval.rawAxis5} <span className="text-xs font-normal text-slate-400">/ ۷۵</span></div>
              <div className="text-[10px] text-rose-600 font-semibold mt-1">سهم: {((latestEval.rawAxis5 / 75) * 20).toFixed(1)}</div>
            </div>
          </div>

          {/* جزئیات تک‌تک محورها */}
          <div className="space-y-4">
            {/* محور ۱ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ۱. رابطه تربیتی و اثرگذاری بر دانش‌آموز (وزن ۱۵٪)
                </h3>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  امتیاز خام: {latestEval.rawAxis1} از ۵۰
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">شناخت دانش‌آموزان فراتر از نمره و عملکرد درسی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis1_1} / ۳۰</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">وجود رابطه اعتمادآمیز و رجوع واقعی دانش‌آموزان</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis1_2} / ۲۰</strong>
                </div>
              </div>
              {latestEval.qualitativeAxis1 && (
                <div className="text-xs text-indigo-800 bg-indigo-50/60 p-3 rounded-xl">
                  <strong>توصیف کیفی محور ۱: </strong> {latestEval.qualitativeAxis1}
                </div>
              )}
              {latestEval.notesAxis1 && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  <strong className="text-slate-700 block mb-1">توضیحات و شواهد ارزیاب در محور ۱:</strong>
                  {latestEval.notesAxis1}
                </div>
              )}
            </div>

            {/* محور ۲ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ۲. توان شناسایی استعداد (وزن ۲۵٪)
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                  امتیاز خام: {latestEval.rawAxis2} از ۸۰
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">تشخیص ظرفیت فراتر از معدل و رتبه</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis2_1} / ۳۰</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">ارائه شواهد عینی از عملکرد متفاوت</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis2_2} / ۳۰</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">تشخیص ظرفیت‌های علوم انسانی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis2_3} / ۲۰</strong>
                </div>
              </div>
              {latestEval.qualitativeAxis2 && (
                <div className="text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-xl">
                  <strong>توصیف کیفی محور ۲: </strong> {latestEval.qualitativeAxis2}
                </div>
              )}
              {latestEval.notesAxis2 && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  <strong className="text-slate-700 block mb-1">توضیحات و شواهد ارزیاب در محور ۲:</strong>
                  {latestEval.notesAxis2}
                </div>
              )}
            </div>

            {/* محور ۳ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ۳. نگرش و ظرفیت علوم انسانی (وزن ۱۵٪)
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl">
                  امتیاز خام: {latestEval.rawAxis3} از ۱۰۰
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">باور به اهمیت و شأن علوم انسانی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis3_1} / ۳۵</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">شناخت واقع‌بینانه از حوزه‌های اصلی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis3_2} / ۳۵</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">توان پیوند علوم انسانی با مسائل واقعی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis3_3} / ۳۰</strong>
                </div>
              </div>
              {latestEval.qualitativeAxis3 && (
                <div className="text-xs text-amber-800 bg-amber-50/60 p-3 rounded-xl">
                  <strong>توصیف کیفی محور ۳: </strong> {latestEval.qualitativeAxis3}
                </div>
              )}
              {latestEval.notesAxis3 && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  <strong className="text-slate-700 block mb-1">توضیحات و شواهد ارزیاب در محور ۳:</strong>
                  {latestEval.notesAxis3}
                </div>
              )}
            </div>

            {/* محور ۴ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ۴. سرمایه ارتباطی و ظرفیت شبکه‌سازی (وزن ۲۵٪)
                </h3>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl">
                  امتیاز خام: {latestEval.rawAxis4} از ۱۰۰
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">دسترسی موثر به دانش‌آموزان مستعد و مدارس</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis4_1} / ۳۵</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">ارتباط حرفه‌ای با فعالان و مدیران تربیتی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis4_2} / ۳۵</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">توان همراهی افراد با برنامه مشترک</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis4_3} / ۳۰</strong>
                </div>
              </div>
              {latestEval.qualitativeAxis4 && (
                <div className="text-xs text-sky-800 bg-sky-50/60 p-3 rounded-xl">
                  <strong>توصیف کیفی محور ۴: </strong> {latestEval.qualitativeAxis4}
                </div>
              )}
              {latestEval.notesAxis4 && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  <strong className="text-slate-700 block mb-1">توضیحات و شواهد ارزیاب در محور ۴:</strong>
                  {latestEval.notesAxis4}
                </div>
              )}
            </div>

            {/* محور ۵ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ۵. تعهد و قابلیت همکاری اجرایی (وزن ۲۰٪)
                </h3>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl">
                  امتیاز خام: {latestEval.rawAxis5} از ۷۵
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">سابقه اجرای کامل پروژه تربیتی/آموزشی</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis5_1} / ۳۰</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">داشتن زمان و امکان همکاری منظم</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis5_2} / ۲۰</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex justify-between items-center">
                  <span className="text-slate-600">توان کار تیمی و پذیرش چارچوب و بازخورد</span>
                  <strong className="text-slate-900 text-sm font-bold">{latestEval.scoreAxis5_3} / ۲۵</strong>
                </div>
              </div>
              {latestEval.qualitativeAxis5 && (
                <div className="text-xs text-rose-800 bg-rose-50/60 p-3 rounded-xl">
                  <strong>توصیف کیفی محور ۵: </strong> {latestEval.qualitativeAxis5}
                </div>
              )}
              {latestEval.notesAxis5 && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  <strong className="text-slate-700 block mb-1">توضیحات و شواهد ارزیاب در محور ۵:</strong>
                  {latestEval.notesAxis5}
                </div>
              )}
            </div>

            {/* جمع‌بندی نهایی ارزیاب */}
            {latestEval.finalNotes && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>جمع‌بندی و راهکارهای اقدام ارزیاب:</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {latestEval.finalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
