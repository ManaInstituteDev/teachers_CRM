import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  School,
  ArrowUpRight,
  Search,
  MapPin,
  Building2,
  BookOpen,
  PlusCircle,
  Phone,
  User,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  RotateCcw,
  Award,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  BarChart3,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { AssignEvaluatorForm } from "@/components/admin/AssignEvaluatorForm";
import { ExportDataButton } from "@/components/admin/ExportDataButton";

export const dynamic = "force-dynamic";

interface SearchParamsProps {
  q?: string;
  evaluatorId?: string;
  ownershipType?: string;
  dominantApproach?: string;
  humanitiesAttitude?: string;
  evalStatus?: string; // ALL, has_evaluations, no_evaluations, assigned, unassigned
  sortBy?: string; // avgScore, totalTeachers, evaluatedCount, keyAxisCount, name, district, ownershipType, dominantApproach, evaluator, createdAt
  sortOrder?: string; // asc, desc
}

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const evaluatorId = params.evaluatorId || "ALL";
  const ownershipType = params.ownershipType || "ALL";
  const dominantApproach = params.dominantApproach || "ALL";
  const humanitiesAttitude = params.humanitiesAttitude || "ALL";
  const evalStatus = params.evalStatus || "ALL";
  const sortBy = params.sortBy || "avgScore";
  const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

  // ۱. ساخت فیلترهای پرس‌وجو
  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { principalName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (evaluatorId !== "ALL") {
    if (evaluatorId === "UNASSIGNED") {
      whereClause.assignedEvaluatorId = null;
    } else {
      whereClause.assignedEvaluatorId = evaluatorId;
    }
  }

  if (ownershipType !== "ALL") {
    whereClause.ownershipType = ownershipType;
  }

  if (dominantApproach !== "ALL") {
    whereClause.dominantApproach = dominantApproach;
  }

  if (humanitiesAttitude !== "ALL") {
    whereClause.humanitiesAttitude = humanitiesAttitude;
  }

  if (evalStatus === "assigned") {
    whereClause.assignedEvaluatorId = { not: null };
  } else if (evalStatus === "unassigned") {
    whereClause.assignedEvaluatorId = null;
  }

  // ۲. واکشی داده‌های مدارس و ارزیابان
  const [rawSchools, evaluators, totalSchoolsCount] = await Promise.all([
    prisma.school.findMany({
      where: whereClause,
      include: {
        createdBy: true,
        assignedEvaluator: true,
        teachers: {
          include: {
            evaluations: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                totalWeightedScore: true,
                finalRecommendation: true,
                createdAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "EVALUATOR", isActive: true },
      select: { id: true, fullName: true, username: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.school.count(),
  ]);

  // ۳. محاسبه آماره‌ها و شاخص‌های ارزیابی هر مدرسه
  let processedSchools = rawSchools.map((school) => {
    const teachers = school.teachers || [];
    const totalTeachers = teachers.length;

    // کادر ارزیابی‌شده (دارای حداقل ۱ ارزیابی نهایی)
    const evaluatedTeachers = teachers.filter((t) => t.evaluations.length > 0);
    const evaluatedCount = evaluatedTeachers.length;

    // میانگین نمرات موزون ارزیابی در این مدرسه
    const avgScore =
      evaluatedCount > 0
        ? evaluatedTeachers.reduce(
            (sum, t) => sum + (t.evaluations[0]?.totalWeightedScore || 0),
            0
          ) / evaluatedCount
        : null;

    // تعداد معلمان در وضعیت‌های مختلف همکاری
    const keyAxisCount = teachers.filter(
      (t) => t.collaborationStatus === "KEY_AXIS"
    ).length;
    const developmentalCount = teachers.filter(
      (t) => t.collaborationStatus === "DEVELOPMENTAL_RELATION"
    ).length;
    const occasionalCount = teachers.filter(
      (t) => t.collaborationStatus === "OCCASIONAL_RELATION"
    ).length;
    const unsuitableCount = teachers.filter(
      (t) => t.collaborationStatus === "UNSUITABLE"
    ).length;

    return {
      ...school,
      totalTeachers,
      evaluatedCount,
      avgScore,
      keyAxisCount,
      developmentalCount,
      occasionalCount,
      unsuitableCount,
    };
  });

  // اعمال فیلتر وضعیت ارزیابی در سطح پردازش (در صورت لزوم)
  if (evalStatus === "has_evaluations") {
    processedSchools = processedSchools.filter((s) => s.evaluatedCount > 0);
  } else if (evalStatus === "no_evaluations") {
    processedSchools = processedSchools.filter((s) => s.evaluatedCount === 0);
  }

  // ۴. مرتب‌سازی پیشرفته بر اساس انتخاب مدیر
  processedSchools.sort((a, b) => {
    let valA: any = 0;
    let valB: any = 0;

    switch (sortBy) {
      case "avgScore":
        valA = a.avgScore !== null ? a.avgScore : -1;
        valB = b.avgScore !== null ? b.avgScore : -1;
        break;

      case "totalTeachers":
        valA = a.totalTeachers;
        valB = b.totalTeachers;
        break;

      case "evaluatedCount":
        valA = a.evaluatedCount;
        valB = b.evaluatedCount;
        break;

      case "keyAxisCount":
        valA = a.keyAxisCount;
        valB = b.keyAxisCount;
        break;

      case "name":
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name, "fa")
          : b.name.localeCompare(a.name, "fa");

      case "district":
        valA = a.district || "";
        valB = b.district || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB, "fa")
          : valB.localeCompare(valA, "fa");

      case "ownershipType":
        valA = a.ownershipType || "";
        valB = b.ownershipType || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "dominantApproach":
        valA = a.dominantApproach || "";
        valB = b.dominantApproach || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "evaluator":
        valA = a.assignedEvaluator?.fullName || "";
        valB = b.assignedEvaluator?.fullName || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB, "fa")
          : valB.localeCompare(valA, "fa");

      case "createdAt":
      default:
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
        break;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // ۵. برچسب‌های کمکی
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
      case "ORGANIZATION_TIED":
        return "وابسته به نهاد";
      case "VOCATIONAL":
        return "هنرستان";
      case "HYBRID_SPECIAL":
        return "خاص / ترکیبی";
      default:
        return "سایر";
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

  const getAttitudeLabel = (att: string | null) => {
    switch (att) {
      case "POSITIVE_SERIOUS":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
            مثبت و جدی
          </span>
        );
      case "POSITIVE_LOW_INFO":
        return (
          <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
            مثبت اما کم‌اطلاع
          </span>
        );
      case "NEUTRAL":
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
            خنثی
          </span>
        );
      case "WEAK_STEREOTYPICAL":
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-lg font-semibold text-[11px]">
            ضعیف یا کلیشه‌ای
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  const getAttitudeText = (att: string | null) => {
    switch (att) {
      case "POSITIVE_SERIOUS":
        return "مثبت و جدی";
      case "POSITIVE_LOW_INFO":
        return "مثبت اما کم‌اطلاع";
      case "NEUTRAL":
        return "خنثی";
      case "WEAK_STEREOTYPICAL":
        return "ضعیف یا کلیشه‌ای";
      default:
        return "مشخص‌نشده";
    }
  };

  // ۶. محاسبه شاخص‌های کلیدی برای کارت‌های آمار بالای صفحه
  const schoolsWithEvaluations = processedSchools.filter(
    (s) => s.evaluatedCount > 0
  );
  const totalAssignedSchools = processedSchools.filter(
    (s) => !!s.assignedEvaluatorId
  ).length;
  const totalEvaluatedTeachersAcrossSchools = processedSchools.reduce(
    (sum, s) => sum + s.evaluatedCount,
    0
  );
  const totalTeachersAcrossSchools = processedSchools.reduce(
    (sum, s) => sum + s.totalTeachers,
    0
  );

  const overallAvgScore =
    schoolsWithEvaluations.length > 0
      ? (
          schoolsWithEvaluations.reduce(
            (sum, s) => sum + (s.avgScore || 0),
            0
          ) / schoolsWithEvaluations.length
        ).toFixed(1)
      : "—";

  // ۷. کمکی برای ساخت URL مرتب‌سازی ستون‌های جدول
  const getSortUrl = (field: string) => {
    const isCurrent = sortBy === field;
    const nextOrder = isCurrent && sortOrder === "desc" ? "asc" : "desc";
    const currentParams = new URLSearchParams();
    if (q) currentParams.set("q", q);
    if (evaluatorId !== "ALL") currentParams.set("evaluatorId", evaluatorId);
    if (ownershipType !== "ALL")
      currentParams.set("ownershipType", ownershipType);
    if (dominantApproach !== "ALL")
      currentParams.set("dominantApproach", dominantApproach);
    if (humanitiesAttitude !== "ALL")
      currentParams.set("humanitiesAttitude", humanitiesAttitude);
    if (evalStatus !== "ALL") currentParams.set("evalStatus", evalStatus);

    currentParams.set("sortBy", field);
    currentParams.set("sortOrder", nextOrder);
    return `/admin/schools?${currentParams.toString()}`;
  };

  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 opacity-60 inline-block mr-1 group-hover:text-slate-500 transition" />
      );
    }
    return sortOrder === "desc" ? (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 inline-block mr-1 font-bold" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 inline-block mr-1 font-bold" />
    );
  };

  // ۸. آماده‌سازی داده‌های خروجی اکسل (CSV UTF-8 با BOM)
  const exportHeaders = [
    "نام مدرسه",
    "کد مدرسه",
    "استان",
    "شهرستان",
    "منطقه آموزش و پرورش",
    "نام مدیر",
    "تلفن تماس",
    "نوع مالکیت",
    "ارزیاب متصل (کارتابل)",
    "نام کاربری ارزیاب",
    "رویکرد غالب تربیتی",
    "نگرش به علوم انسانی",
    "تعداد کل کادر و معلمان",
    "تعداد معلمان ارزیابی‌شده",
    "میانگین نمره شایستگی معلمان (از ۱۰۰)",
    "تعداد معلمان محور (کلیدی)",
    "تعداد معلمان مستعد ارتباط رشدی",
    "تعداد معلمان ارتباط موردی",
    "تعداد معلمان نامناسب",
    "تاریخ ثبت در سامانه",
  ];

  const exportRows = processedSchools.map((s) => [
    s.name,
    s.code || "-",
    s.province || "-",
    s.city || "-",
    s.district || "-",
    s.principalName || "-",
    s.phone || "-",
    getOwnershipLabel(s.ownershipType),
    s.assignedEvaluator ? s.assignedEvaluator.fullName : "بدون ارزیاب",
    s.assignedEvaluator ? s.assignedEvaluator.username : "-",
    getApproachLabel(s.dominantApproach),
    getAttitudeText(s.humanitiesAttitude),
    s.totalTeachers,
    s.evaluatedCount,
    s.avgScore !== null ? s.avgScore.toFixed(1) : "بدون ارزیابی",
    s.keyAxisCount,
    s.developmentalCount,
    s.occasionalCount,
    s.unsuitableCount,
    new Date(s.createdAt).toLocaleDateString("fa-IR"),
  ]);

  const hasActiveFilters =
    q ||
    evaluatorId !== "ALL" ||
    ownershipType !== "ALL" ||
    dominantApproach !== "ALL" ||
    humanitiesAttitude !== "ALL" ||
    evalStatus !== "ALL";

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* هدر بخش و دکمه‌های اقدام */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <School className="w-3.5 h-3.5" />
            <span>گزارش جامع ارزیابی و رتبه‌بندی مدارس</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            گزارش ارزیابی و شناسنامه مدارس
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            پایش نمرات شایستگی کادر، تحلیل رویکرد تربیتی، توزیع معلمان محور، سورت و دریافت خروجی اکسل و چاپی
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* دکمه دانلود خروجی اکسل و چاپ */}
          <ExportDataButton
            filename="schools_evaluation_report"
            title="خروجی گزارش مدارس"
            headers={exportHeaders}
            rows={exportRows}
            printTitle="گزارش ارزیابی و شناسنامه مدارس - سامانه مدیریت شایستگی معلمان"
          />

          <Link
            href="/admin/schools/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تعریف مدرسه جدید</span>
          </Link>
        </div>
      </div>

      {/* کارت‌های آماری شاخص‌های ارزیابی مدارس */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              کل مدارس ثبت‌شده
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {processedSchools.length}{" "}
              <span className="text-xs font-normal text-slate-400">مدرسه</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {hasActiveFilters ? "فیلترشده بر اساس شرایط فعلی" : "در تمام مناطق آموزشی"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              مدارس متصل به ارزیاب
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {totalAssignedSchools}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {processedSchools.length}
              </span>
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {processedSchools.length > 0
                ? `${Math.round(
                    (totalAssignedSchools / processedSchools.length) * 100
                  )}٪ پوشش ارزیاب فعال`
                : "—"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              کادر ارزیابی‌شده در مدارس
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {totalEvaluatedTeachersAcrossSchools}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {totalTeachersAcrossSchools} معلم
              </span>
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              {totalTeachersAcrossSchools > 0
                ? `${Math.round(
                    (totalEvaluatedTeachersAcrossSchools /
                      totalTeachersAcrossSchools) *
                      100
                  )}٪ کادر دارای کارنامه نهایی`
                : "در انتظار ثبت کادر"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              میانگین شایستگی مدارس
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {overallAvgScore}{" "}
              {overallAvgScore !== "—" && (
                <span className="text-xs font-normal text-slate-400">
                  از ۱۰۰
                </span>
              )}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              {schoolsWithEvaluations.length} مدرسه ارزیابی‌شده
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* نوار جستجو و فیلترهای پیشرفته */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>فیلترها و مرتب‌سازی گزارش مدارس</span>
          </div>

          {hasActiveFilters && (
            <Link
              href="/admin/schools"
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌کردن فیلترها</span>
            </Link>
          )}
        </div>

        <form method="GET" action="/admin/schools" className="space-y-4">
          {/* ردیف اول: جستجوی متنی */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="جستجو در نام مدرسه، کد، نام مدیر، منطقه یا شماره تماس..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl pr-10 pl-3.5 py-2.5 text-xs sm:text-sm outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer shrink-0"
            >
              اعمال فیلترها
            </button>
          </div>

          {/* ردیف دوم: انتخابگرهای چندگانه فیلتر */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {/* فیلتر ارزیاب متصل */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                ارزیاب مسئول (کارتابل):
              </label>
              <select
                name="evaluatorId"
                defaultValue={evaluatorId}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="ALL">همه ارزیاب‌ها</option>
                <option value="UNASSIGNED">❌ بدون ارزیاب متصل</option>
                {evaluators.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.fullName} ({ev.username})
                  </option>
                ))}
              </select>
            </div>

            {/* فیلتر نوع مالکیت */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                نوع مالکیت مدرسه:
              </label>
              <select
                name="ownershipType"
                defaultValue={ownershipType}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="ALL">همه انواع مالکیت</option>
                <option value="GOVERNMENTAL">دولتی</option>
                <option value="NON_GOVERNMENTAL">غیردولتی</option>
                <option value="BOARD_OF_TRUSTEES">هیئت‌امنایی</option>
                <option value="NEMOONE_DOLATI">نمونه دولتی</option>
                <option value="SAMPAD">سمپاد (استعدادهای درخشان)</option>
                <option value="SHAHED">شاهد</option>
                <option value="VOCATIONAL">هنرستان</option>
                <option value="ORGANIZATION_TIED">وابسته به نهاد</option>
              </select>
            </div>

            {/* فیلتر رویکرد غالب تربیتی */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                رویکرد غالب تربیتی:
              </label>
              <select
                name="dominantApproach"
                defaultValue={dominantApproach}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="ALL">همه رویکردها</option>
                <option value="EDUCATIONAL_CULTURAL">تربیتی و فرهنگی</option>
                <option value="SKILL_ORIENTED">مهارت‌محور</option>
                <option value="RESEARCH_ORIENTED">پژوهش‌محور</option>
                <option value="PROBLEM_ORIENTED">مسئله‌محور</option>
                <option value="RELIGIOUS_VALUE">دینی و ارزشی</option>
                <option value="EDUCATIONAL_GRADE_ORIENTED">آموزشی و نمره‌محور</option>
                <option value="ARTISTIC_CREATIVE">هنری و خلاق</option>
                <option value="ENTREPRENEURSHIP">کارآفرینی</option>
              </select>
            </div>

            {/* فیلتر نگرش علوم انسانی */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                نگرش به علوم انسانی:
              </label>
              <select
                name="humanitiesAttitude"
                defaultValue={humanitiesAttitude}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="ALL">همه نگرش‌ها</option>
                <option value="POSITIVE_SERIOUS">مثبت و جدی</option>
                <option value="POSITIVE_LOW_INFO">مثبت اما کم‌اطلاع</option>
                <option value="NEUTRAL">خنثی</option>
                <option value="WEAK_STEREOTYPICAL">ضعیف یا کلیشه‌ای</option>
              </select>
            </div>

            {/* مرتب‌سازی سریع */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                مرتب‌سازی بر اساس:
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  name="sortBy"
                  defaultValue={sortBy}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="avgScore">میانگین نمره شایستگی</option>
                  <option value="evaluatedCount">تعداد معلمان ارزیابی‌شده</option>
                  <option value="totalTeachers">تعداد کل کادر مدرسه</option>
                  <option value="keyAxisCount">تعداد معلمان شاخص (محور)</option>
                  <option value="name">نام مدرسه (الفبایی)</option>
                  <option value="district">منطقه آموزش و پرورش</option>
                  <option value="evaluator">ارزیاب متصل</option>
                  <option value="createdAt">جدیدترین تاریخ ثبت</option>
                </select>

                <select
                  name="sortOrder"
                  defaultValue={sortOrder}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer shrink-0"
                >
                  <option value="desc">نزولی ⬇️</option>
                  <option value="asc">صعودی ⬆️</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* جدول داده‌ها و سورت ستون‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-sm text-slate-900">
              نتایج گزارش ارزیابی مدارس ({processedSchools.length} مدرسه)
            </span>
          </div>
          <div className="text-xs text-slate-400">
            برای تغییر جهت مرتب‌سازی، روی سرستون‌های جدول کلیک کنید.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200/80 text-xs font-bold select-none">
              <tr>
                <th className="py-4 px-4 text-center w-12">#</th>
                <th className="py-4 px-5">
                  <Link
                    href={getSortUrl("name")}
                    className="group inline-flex items-center hover:text-indigo-600 transition"
                  >
                    <span>نام مدرسه و مدیر</span>
                    {renderSortIndicator("name")}
                  </Link>
                </th>
                <th className="py-4 px-5">
                  <Link
                    href={getSortUrl("district")}
                    className="group inline-flex items-center hover:text-indigo-600 transition"
                  >
                    <span>منطقه / شهر</span>
                    {renderSortIndicator("district")}
                  </Link>
                </th>
                <th className="py-4 px-5">
                  <Link
                    href={getSortUrl("ownershipType")}
                    className="group inline-flex items-center hover:text-indigo-600 transition"
                  >
                    <span>نوع مالکیت</span>
                    {renderSortIndicator("ownershipType")}
                  </Link>
                </th>
                <th className="py-4 px-5">
                  <Link
                    href={getSortUrl("evaluator")}
                    className="group inline-flex items-center hover:text-indigo-600 transition"
                  >
                    <span>ارزیاب مسئول (کارتابل)</span>
                    {renderSortIndicator("evaluator")}
                  </Link>
                </th>
                <th className="py-4 px-5">
                  <Link
                    href={getSortUrl("dominantApproach")}
                    className="group inline-flex items-center hover:text-indigo-600 transition"
                  >
                    <span>رویکرد تربیتی و علوم انسانی</span>
                    {renderSortIndicator("dominantApproach")}
                  </Link>
                </th>
                <th className="py-4 px-4 text-center">
                  <Link
                    href={getSortUrl("totalTeachers")}
                    className="group inline-flex items-center justify-center hover:text-indigo-600 transition"
                  >
                    <span>کادر کل</span>
                    {renderSortIndicator("totalTeachers")}
                  </Link>
                </th>
                <th className="py-4 px-4 text-center">
                  <Link
                    href={getSortUrl("evaluatedCount")}
                    className="group inline-flex items-center justify-center hover:text-indigo-600 transition"
                  >
                    <span>ارزیابی‌شده</span>
                    {renderSortIndicator("evaluatedCount")}
                  </Link>
                </th>
                <th className="py-4 px-5 text-center">
                  <Link
                    href={getSortUrl("avgScore")}
                    className="group inline-flex items-center justify-center hover:text-indigo-600 transition"
                  >
                    <span>میانگین نمره شایستگی</span>
                    {renderSortIndicator("avgScore")}
                  </Link>
                </th>
                <th className="py-4 px-5 text-center">
                  <Link
                    href={getSortUrl("keyAxisCount")}
                    className="group inline-flex items-center justify-center hover:text-indigo-600 transition"
                  >
                    <span>معلمان شاخص</span>
                    {renderSortIndicator("keyAxisCount")}
                  </Link>
                </th>
                <th className="py-4 px-5 text-left">شناسنامه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedSchools.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-slate-400 text-sm"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <School className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600">
                        مدرسه‌ای با شرایط انتخابی یافت نشد.
                      </p>
                      <p className="text-xs text-slate-400">
                        می‌توانید فیلترها را ریست کرده یا عبارت جستجو را تغییر دهید.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                processedSchools.map((school, index) => (
                  <tr
                    key={school.id}
                    className="hover:bg-slate-50/70 transition group"
                  >
                    {/* ردیف */}
                    <td className="py-4 px-4 text-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </td>

                    {/* نام مدرسه و مشخصات تماس */}
                    <td className="py-4 px-5 font-bold text-slate-900">
                      <div className="text-sm group-hover:text-indigo-600 transition">
                        {school.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-normal flex-wrap">
                        {school.code && (
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            کد: {school.code}
                          </span>
                        )}
                        {school.principalName && (
                          <span className="text-slate-600">
                            مدیر: {school.principalName}
                          </span>
                        )}
                        {school.phone && (
                          <span className="font-mono text-slate-500" dir="ltr">
                            {school.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* منطقه و شهرستان */}
                    <td className="py-4 px-5 text-slate-600 text-xs">
                      <div>منطقه {school.district}</div>
                      <div className="text-[11px] text-slate-400">
                        {school.city} ({school.province})
                      </div>
                    </td>

                    {/* نوع مالکیت */}
                    <td className="py-4 px-5 text-xs text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 text-xs">
                        {getOwnershipLabel(school.ownershipType)}
                      </span>
                    </td>

                    {/* ارزیاب متصل به کارتابل */}
                    <td className="py-4 px-5">
                      <AssignEvaluatorForm
                        schoolId={school.id}
                        currentEvaluatorId={school.assignedEvaluatorId}
                        evaluators={evaluators}
                      />
                    </td>

                    {/* رویکرد غالب و نگرش علوم انسانی */}
                    <td className="py-4 px-5 text-xs space-y-1.5">
                      <div className="text-slate-700 font-medium">
                        {getApproachLabel(school.dominantApproach)}
                      </div>
                      <div>{getAttitudeLabel(school.humanitiesAttitude)}</div>
                    </td>

                    {/* تعداد کل کادر */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {school.totalTeachers} نفر
                      </span>
                    </td>

                    {/* تعداد ارزیابی‌شده‌ها */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          school.evaluatedCount > 0
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {school.evaluatedCount} معلم
                      </span>
                    </td>

                    {/* میانگین نمره شایستگی معلمان */}
                    <td className="py-4 px-5 text-center">
                      {school.avgScore !== null ? (
                        <div className="inline-flex flex-col items-center">
                          <div
                            className={`text-base font-black ${
                              school.avgScore >= 75
                                ? "text-emerald-600"
                                : school.avgScore >= 50
                                ? "text-indigo-600"
                                : school.avgScore >= 30
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {school.avgScore.toFixed(1)}
                            <span className="text-[10px] font-normal text-slate-400 mr-0.5">
                              / ۱۰۰
                            </span>
                          </div>
                          {/* نوار کوچک گرافیکی نمره */}
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                school.avgScore >= 75
                                ? "bg-emerald-500"
                                : school.avgScore >= 50
                                ? "bg-indigo-500"
                                : school.avgScore >= 30
                                ? "bg-amber-500"
                                : "bg-rose-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  Math.max(school.avgScore, 5),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-100/70 px-2 py-0.5 rounded">
                          بدون ارزیابی
                        </span>
                      )}
                    </td>

                    {/* معلمان شاخص (محور و مستعد رشد) */}
                    <td className="py-4 px-5 text-center">
                      {school.keyAxisCount > 0 || school.developmentalCount > 0 ? (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {school.keyAxisCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                              {school.keyAxisCount} محور
                            </span>
                          )}
                          {school.developmentalCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              {school.developmentalCount} رشدی
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* لینک شناسنامه و جزئیات */}
                    <td className="py-4 px-5 text-left">
                      <Link
                        href={`/admin/schools/${school.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition shrink-0"
                      >
                        <span>مشاهده</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
