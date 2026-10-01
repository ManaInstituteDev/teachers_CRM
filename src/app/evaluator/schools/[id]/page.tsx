import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  School as SchoolIcon,
  ArrowRight,
  UserPlus,
  Users,
  Award,
  Calendar,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  Compass,
  UserCheck,
} from "lucide-react";
import SchoolExpenseModal from "@/components/evaluator/SchoolExpenseModal";

export const dynamic = "force-dynamic";

export default async function EvaluatorSchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      referrers: {
        orderBy: { createdAt: "asc" },
      },
      teachers: {
        orderBy: { createdAt: "desc" },
        include: {
          evaluations: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      expenses: {
        orderBy: { expenseDate: "desc" },
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
  });

  if (!school) {
    notFound();
  }

  // ارزیاب فقط مجاز به دیدن مدرسه‌ای است که به او تخصیص داده شده
  if (school.assignedEvaluatorId !== user.id) {
    redirect("/evaluator/schools");
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "KEY_AXIS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            محور
          </span>
        );
      case "DEVELOPMENTAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            مستعد ارتباط رشدی
          </span>
        );
      case "OCCASIONAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            ارتباط موردی
          </span>
        );
      case "UNSUITABLE":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            نامناسب همکاری
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            در انتظار ارزیابی
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-5xl mx-auto">
      {/* دکمه بازگشت */}
      <Link
        href="/evaluator/schools"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به لیست مدارس</span>
      </Link>

      {/* کارت مشخصات مدرسه و دکمه ثبت کادر */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <SchoolIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {school.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {school.province} - {school.city} - {school.district}
                </span>
                {school.code && (
                  <span className="font-mono text-slate-400">
                    (کد: {school.code})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Link
              href={`/evaluator/schools/${school.id}/evaluate`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
            >
              <Compass className="w-4 h-4 text-teal-600" />
              <span>
                {school.humanitiesAttitude || school.approachEvidence ? "ویرایش ارزیابی مدرسه" : "ثبت ارزیابی تخصصی مدرسه"}
              </span>
            </Link>

            {/* دکمه اختصاصی تنخواه و مخارج مدرسه */}
            <SchoolExpenseModal
              schoolId={school.id}
              schoolName={school.name}
              schoolCode={school.code}
              initialExpensesCount={school.expenses.length}
              initialTotalExpenses={school.expenses.reduce((sum, e) => sum + e.amount, 0)}
              initialPettyCashAmount={school.pettyCashAmount}
              initialPettyCashPaid={school.pettyCashPaid}
              buttonClassName="py-2.5 px-4 rounded-2xl text-xs sm:text-sm shadow-sm"
            />

            <Link
              href={`/evaluator/evaluate?schoolId=${school.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ثبت کادر جدید این مدرسه</span>
            </Link>
          </div>
        </div>

        {/* مشخصات معرف مدرسه (راهنمای مراجعه و معرفی ارزیاب) */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50/50 border border-amber-200/90 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-950 text-xs sm:text-sm">
                    معرف(های) این مدرسه:
                  </span>
                  <span className="font-extrabold text-amber-900 bg-white/90 px-2.5 py-0.5 rounded-lg border border-amber-300/70 text-xs sm:text-sm">
                    {school.referrerName || (school.referrers.length > 0 ? school.referrers[0].fullName : "ثبت نشده")}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {school.referrers.length > 0
                    ? `هنگام مراجعه به این مدرسه، جهت سهولت در پذیرش خود را به عنوان ارزیابِ معرفی‌شده از طرف معرف‌های زیر معرفی فرمایید.`
                    : "معرف خاصی برای این مدرسه ثبت نشده است. هماهنگی را مستقیماً با مدیر مدرسه انجام دهید."}
                </p>
              </div>
            </div>

            {school.referrerPhone && school.referrers.length <= 1 && (
              <div className="flex items-center gap-2 shrink-0 bg-white border border-amber-200/80 px-3.5 py-2 rounded-xl shadow-2xs self-start sm:self-auto">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] text-slate-500 font-medium">شماره تماس:</span>
                <a
                  href={`tel:${school.referrerPhone}`}
                  className="font-bold text-amber-900 font-mono hover:underline text-xs"
                  dir="ltr"
                >
                  {school.referrerPhone}
                </a>
              </div>
            )}
          </div>

          {/* لیست کامل معرف‌های مدرسه */}
          {school.referrers && school.referrers.length > 0 && (
            <div className="pt-2.5 border-t border-amber-200/70 space-y-2">
              <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                <span>لیست معرف‌های ثبت‌شده ({school.referrers.length} نفر):</span>
                <span className="text-[10px] text-amber-700 font-normal">برای تماس سریع روی شماره کلیک کنید</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {school.referrers.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-2.5 rounded-xl bg-white/95 border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs hover:border-amber-400 transition"
                  >
                    <div className="truncate">
                      <div className="font-bold text-amber-950 text-xs truncate">
                        {ref.fullName}
                      </div>
                      {ref.notes && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {ref.notes}
                        </div>
                      )}
                    </div>
                    {ref.phone && (
                      <a
                        href={`tel:${ref.phone}`}
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/80 transition shrink-0"
                        dir="ltr"
                        title="تماس مستقیم با معرف"
                      >
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>{ref.phone}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* اطلاعات تکمیلی مدرسه */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
            <span className="text-slate-400">نام مدیر مدرسه:</span>
            <div className="font-bold text-slate-800">
              {school.principalName || "ثبت نشده"}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
            <span className="text-slate-400">شماره تماس مدرسه:</span>
            <div className="font-bold text-slate-800 font-mono" dir="ltr">
              {school.phone || "ثبت نشده"}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
            <span className="text-slate-400">تعداد کادر ارزیابی‌شده:</span>
            <div className="font-bold text-emerald-700">
              {school.teachers.length} نفر
            </div>
          </div>
        </div>

        {school.address && (
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
            <strong>نشانی:</strong> {school.address}
          </div>
        )}

        {/* کارت نتایج ارزیابی تخصصی مدرسه */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-teal-50/50 to-slate-50 border border-teal-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-teal-950">
              <Compass className="w-4 h-4 text-teal-600" />
              <span>ارزیابی کیفی و ظرفیت مدرسه:</span>
            </div>
            <Link
              href={`/evaluator/schools/${school.id}/evaluate`}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-white px-3 py-1 rounded-xl border border-teal-200 shadow-2xs transition"
            >
              {school.humanitiesAttitude || school.approachEvidence ? "ویرایش ارزیابی" : "+ ثبت ارزیابی"}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400">رویکرد غالب تربیتی:</span>
              <div className="font-bold text-slate-800">{school.dominantApproach || "مشخص نشده"}</div>
              {school.approachEvidence && (
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  <strong>شواهد:</strong> {school.approachEvidence}
                </p>
              )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400">نگرش به علوم انسانی:</span>
              <div className="font-bold text-slate-800">{school.humanitiesAttitude || "در انتظار ارزیابی"}</div>
              {school.humanitiesReadinessLevel && (
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  <strong>میزان آمادگی:</strong> {school.humanitiesReadinessLevel}
                </p>
              )}
            </div>
          </div>

          {school.humanitiesActivities && school.humanitiesActivities.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">سوابق فعال در علوم انسانی:</span>
              <div className="flex flex-wrap gap-1.5">
                {school.humanitiesActivities.map((act) => (
                  <span
                    key={act}
                    className="text-[11px] bg-teal-100/70 text-teal-800 font-medium px-2.5 py-0.5 rounded-lg"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* لیست کادر ثبت‌شده این مدرسه */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>کادر ارزیابی‌شده مدرسه ({school.teachers.length} نفر)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              معلمان، مشاوران و معاونان این مدرسه که پرونده ارزیابی برای آن‌ها تشکیل شده است
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-bold">
              <tr>
                <th className="py-3.5 px-6">نام و نام خانوادگی</th>
                <th className="py-3.5 px-6">نقش در مدرسه</th>
                <th className="py-3.5 px-6">رشته / حوزه فعالیت</th>
                <th className="py-3.5 px-6 text-center">نمره کل وزنی</th>
                <th className="py-3.5 px-6 text-center">وضعیت همکاری</th>
                <th className="py-3.5 px-6 text-center">تاریخ ارزیابی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {school.teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    تاکنون هیچ فردی از کادر این مدرسه ارزیابی نشده است. با دکمه بالا اولین فرد را ثبت کنید.
                  </td>
                </tr>
              ) : (
                school.teachers.map((t) => {
                  const latestEval = t.evaluations[0];
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div>
                          {t.firstName} {t.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          سابقه: {t.teachingYears} سال
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${t.roleTitle === "مشاور"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : t.roleTitle?.includes("معاون")
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : t.roleTitle === "مدیر"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                        >
                          {t.roleTitle || "معلم"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <div>{t.subject}</div>
                        <div className="text-[11px] text-slate-400">{t.grade}</div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        {latestEval ? (
                          <span className="font-bold text-sm text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                            {latestEval.totalWeightedScore.toFixed(1)}
                            <span className="text-[10px] text-slate-400 font-normal">/۱۰۰</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(t.collaborationStatus)}
                      </td>

                      <td className="py-4 px-6 text-center text-slate-500 font-mono text-xs">
                        {new Date(t.createdAt).toLocaleDateString("fa-IR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
