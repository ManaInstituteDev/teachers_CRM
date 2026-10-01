import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  School,
  Building2,
  BookOpen,
  MapPin,
  Sparkles,
  Users,
  CheckCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { AssignEvaluatorForm } from "@/components/admin/AssignEvaluatorForm";
import { SchoolReferrerManager } from "@/components/admin/SchoolReferrerManager";
import { CopyableSheba } from "@/components/admin/CopyableSheba";
import { AdminSchoolExpensesCard } from "@/components/admin/AdminSchoolExpensesCard";

export const dynamic = "force-dynamic";

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [school, evaluators] = await Promise.all([
    prisma.school.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedEvaluator: true,
        referrers: {
          orderBy: { createdAt: "asc" },
        },
        teachers: {
          include: {
            evaluations: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        expenses: {
          orderBy: { expenseDate: "desc" },
          include: {
            evaluator: {
              select: { id: true, fullName: true, username: true, shebaNumber: true },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "EVALUATOR", isActive: true },
      select: { id: true, fullName: true, username: true, shebaNumber: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!school) {
    notFound();
  }

  const getOwnershipLabel = (type: string) => {
    switch (type) {
      case "GOVERNMENTAL":
        return "دولتی";
      case "NON_GOVERNMENTAL":
        return "غیردولتی";
      case "BOARD_OF_TRUSTEES":
        return "هیئت‌امنایی";
      case "NEMOONE_DOLATI":
        return "نمونه دولتی";
      case "SAMPAD":
        return "استعدادهای درخشان (سمپاد)";
      case "SHAHED":
        return "شاهد";
      case "VOCATIONAL":
        return "هنرستان";
      default:
        return "سایر / خاص";
    }
  };

  const getAdmissionLabel = (adm: string) => {
    switch (adm) {
      case "PUBLIC":
        return "ثبت‌نام عمومی";
      case "EXAM_BASED":
        return "پذیرش بر اساس آزمون";
      case "INTERVIEW_RESUME":
        return "پذیرش بر اساس مصاحبه یا بررسی سوابق";
      case "REGIONAL":
        return "پذیرش منطقه‌ای";
      case "SELECTIVE_LIMITED":
        return "پذیرش محدود یا گزینشی";
      default:
        return "ترکیبی";
    }
  };

  const getApproachLabel = (approach: string) => {
    switch (approach) {
      case "EDUCATIONAL_GRADE_ORIENTED":
        return "آموزشی و نمره‌محور";
      case "EDUCATIONAL_CULTURAL":
        return "تربیتی و فرهنگی";
      case "SKILL_ORIENTED":
        return "مهارت‌محور";
      case "RESEARCH_ORIENTED":
        return "پژوهش‌محور";
      case "PROBLEM_ORIENTED":
        return "مسئله‌محور";
      case "RELIGIOUS_VALUE":
        return "دینی و ارزشی";
      case "ARTISTIC_CREATIVE":
        return "هنری و خلاق";
      case "ENTREPRENEURSHIP":
        return "کارآفرینی";
      default:
        return "ترکیبی";
    }
  };

  const getAttitudeBadge = (att: string | null) => {
    switch (att) {
      case "POSITIVE_SERIOUS":
        return <span className="text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full font-bold text-xs">مثبت و جدی</span>;
      case "POSITIVE_LOW_INFO":
        return <span className="text-sky-800 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full font-bold text-xs">مثبت اما کم‌اطلاع</span>;
      case "NEUTRAL":
        return <span className="text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full font-bold text-xs">خنثی</span>;
      case "WEAK_STEREOTYPICAL":
        return <span className="text-rose-800 bg-rose-100 border border-rose-200 px-3 py-1 rounded-full font-bold text-xs">ضعیف یا کلیشه‌ای</span>;
      default:
        return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* دکمه بازگشت */}
      <Link
        href="/admin/schools"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به بانک مدارس</span>
      </Link>

      {/* هدر شناسنامه مدرسه */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <School className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{school.name}</h1>
                {school.code && (
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold">
                    کد: {school.code}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{school.province}، {school.city}، {school.district}</span>
              </p>
            </div>
          </div>

          <div className="text-left shrink-0">
            <div className="text-xs text-slate-400">نگرش غالب به علوم انسانی:</div>
            <div className="mt-1">{getAttitudeBadge(school.humanitiesAttitude)}</div>
          </div>
        </div>

        {/* ۱ و ۲: اطلاعات پایه و ساختار مدرسه */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block mb-1">نوع مالکیت و اداره:</span>
            <strong className="text-slate-800">{getOwnershipLabel(school.ownershipType)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">وضعیت پذیرش دانش‌آموز:</span>
            <strong className="text-slate-800">{getAdmissionLabel(school.admissionType)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">رویکرد غالب مدرسه:</span>
            <strong className="text-slate-800">{getApproachLabel(school.dominantApproach)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">ارزیاب ثبت‌کننده اولیه:</span>
            <strong className="text-slate-800">{school.createdBy?.fullName || "—"}</strong>
          </div>
        </div>

        {/* انتساب ارزیاب متصل (کارتابل) */}
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-emerald-950 font-bold text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>ارزیاب مسئول متصل (این مدرسه در کارتابل این ارزیاب قرار دارد):</span>
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs text-emerald-800 font-medium">
                {school.assignedEvaluator
                  ? `تخصیص‌یافته به ${school.assignedEvaluator.fullName} (${school.assignedEvaluator.username})`
                  : "در حال حاضر هیچ ارزیابی به این مدرسه متصل نیست."}
              </p>
              {school.assignedEvaluator && (
                <CopyableSheba
                  shebaNumber={school.assignedEvaluator.shebaNumber}
                  evaluatorId={school.assignedEvaluator.id}
                  evaluatorName={school.assignedEvaluator.fullName}
                  variant="badge"
                />
              )}
            </div>
          </div>
          <AssignEvaluatorForm
            schoolId={school.id}
            currentEvaluatorId={school.assignedEvaluatorId}
            evaluators={evaluators}
          />
        </div>

        {/* مشخصات معرف مدرسه (جهت ارجاع و هماهنگی ارزیاب) */}
        <div className="mt-4">
          <SchoolReferrerManager
            schoolId={school.id}
            initialReferrerName={school.referrerName}
            initialReferrerPhone={school.referrerPhone}
            referrers={school.referrers}
            isAdmin={true}
          />
        </div>

        {/* اطلاعات تماس و نشانی */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div>
            <strong>مدیر مدرسه: </strong>
            <span className="text-slate-800">{school.principalName || "ثبت نشده"}</span>
          </div>
          <div>
            <strong>شماره تماس: </strong>
            <span className="text-slate-800 font-mono" dir="ltr">{school.phone || "ثبت نشده"}</span>
          </div>
          <div>
            <strong>نشانی: </strong>
            <span className="text-slate-800">{school.address || "ثبت نشده"}</span>
          </div>
        </div>
      </div>

      {/* گزارش تنخواه و مخارج ارزیابی این مدرسه */}
      <AdminSchoolExpensesCard
        schoolId={school.id}
        schoolName={school.name}
        pettyCashAmount={school.pettyCashAmount}
        pettyCashPaid={school.pettyCashPaid}
        pettyCashPaidAt={school.pettyCashPaidAt}
        expenses={school.expenses as any}
      />

      {/* ۳: شواهد عملی رویکرد تربیتی */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>رویکرد تربیتی و فرهنگی مدرسه (شواهد عملی)</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {school.approachEvidence || "شواهد عملی برای این مدرسه ثبت نشده است."}
        </p>
      </div>

      {/* ۴: ظرفیت مدرسه در حوزه علوم انسانی */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>ظرفیت مدرسه در حوزه علوم انسانی</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سوابق ثبت‌شده در زمینه‌های ۱۰‌گانه و زمینه‌های ظرفیت دانش‌آموزان
          </p>
        </div>

        {/* سوابق مدرسه در زمینه‌های ۱۰ گانه */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-3">سابقه مدرسه در زمینه‌های علوم انسانی:</h3>
          {school.humanitiesActivities.length === 0 ? (
            <p className="text-xs text-slate-400">موردی انتخاب نشده است.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {school.humanitiesActivities.map((act, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-200/60"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  {act}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* زمینه‌های ظرفیت دانش‌آموزان */}
        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-3">دانش‌آموزان دارای ظرفیت در:</h3>
          {school.studentCapacities.length === 0 ? (
            <p className="text-xs text-slate-400">موردی ثبت نشده است.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {school.studentCapacities.map((cap, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/60"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* میزان آمادگی مدرسه */}
        {school.humanitiesReadinessLevel && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700 mb-1.5">
              میزان آمادگی مدرسه برای اجرای برنامه‌های مرتبط با علوم انسانی:
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {school.humanitiesReadinessLevel}
            </p>
          </div>
        )}
      </div>

      {/* معلمان ثبت‌شده در این مدرسه */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span>معلمان ارزیابی‌شده در این مدرسه ({school.teachers.length})</span>
        </h2>

        {school.teachers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">هنوز معلمی برای این مدرسه ارزیابی نشده است.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {school.teachers.map((teacher) => {
              const latestEval = teacher.evaluations[0];
              return (
                <div key={teacher.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      رشته: {teacher.subject} | سابقه: {teacher.teachingYears} سال
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {latestEval && (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        نمره: {latestEval.totalWeightedScore.toFixed(1)}
                      </span>
                    )}
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      مشاهده کارنامه
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
